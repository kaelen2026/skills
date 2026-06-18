#!/usr/bin/env python3
"""Check that Markdown links and doc references (@path, ~/.claude/...,
docs/..., references/...) in project-owned Markdown resolve to real files.
Prints `doc references: ok` on success, otherwise lists every MISSING
reference with source location.

Run as: python3 check_doc_refs.py [ROOT]
ROOT defaults to the current working directory.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path


REF_RE = re.compile(
    r"(?<![\w/.-])("
    r"@[A-Za-z0-9_~/.-]+(?:\.md|/)|"
    r"~/\.claude/[A-Za-z0-9_/.-]+(?:\.md|/)|"
    r"(?:docs|references)/[A-Za-z0-9_/.-]+\.md"
    r")"
)

MD_LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")


def resolve_ref(source: Path, raw: str, root: Path, home: Path) -> Path:
    ref = raw[1:] if raw.startswith("@") else raw

    if ref.startswith("~/"):
        return (home / ref[2:]).resolve()

    path = Path(ref)
    if path.is_absolute():
        return path.resolve()

    if raw.startswith("@"):
        return (root / ref).resolve()

    if ref.startswith("docs/"):
        return (root / ref).resolve()

    if ref.startswith("references/"):
        source_parts = source.relative_to(root).parts
        if len(source_parts) >= 3 and source_parts[0] == "skills":
            skill_root = root.joinpath(*source_parts[:2])
            return (skill_root / ref).resolve()
        if len(source_parts) >= 4 and source_parts[:2] == (".claude", "skills"):
            skill_root = root.joinpath(*source_parts[:3])
            return (skill_root / ref).resolve()
        return (root / ref).resolve()

    return (source.parent / ref).resolve()


def collect_scan_files(root: Path) -> list[Path]:
    scan_files: list[Path] = []
    for path in sorted(root.rglob("*.md")):
        parts = path.relative_to(root).parts
        if ".git" in parts:
            continue
        if "agents" in parts:
            continue
        scan_files.append(path)
    return scan_files


def should_scan_doc_refs(path: Path, root: Path) -> bool:
    rel = path.relative_to(root)
    parts = rel.parts
    return (
        rel in (Path("AGENTS.md"), Path("CLAUDE.md"))
        or parts[:2] == (".claude", "rules")
        or (len(parts) == 3 and parts[0] == "skills" and parts[2] == "SKILL.md")
    )


def iter_refs(line: str, include_doc_refs: bool) -> list[str]:
    refs = [match.group(1) for match in REF_RE.finditer(line)] if include_doc_refs else []
    for match in MD_LINK_RE.finditer(line):
        raw = match.group(1).split("#", 1)[0]
        if not raw or raw.startswith("#"):
            continue
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", raw):
            continue
        refs.append(raw)
    return refs


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", help="Project root (default: cwd)")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    home = Path(os.environ.get("HOME", "")).expanduser()

    scan_files = collect_scan_files(root)

    missing: list[str] = []
    seen: set[tuple[Path, int, str]] = set()
    for path in scan_files:
        include_doc_refs = should_scan_doc_refs(path, root)
        in_fence = False
        for lineno, line in enumerate(
            path.read_text(encoding="utf-8", errors="replace").splitlines(), start=1
        ):
            stripped = line.lstrip()
            if stripped.startswith("```") or stripped.startswith("~~~"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue

            for raw in iter_refs(line, include_doc_refs):
                key = (path, lineno, raw)
                if key in seen:
                    continue
                seen.add(key)

                target = resolve_ref(path, raw, root, home)
                exists = target.is_dir() if raw.endswith("/") else target.is_file()
                if not exists:
                    source = path.relative_to(root)
                    missing.append(f"MISSING: {source}:{lineno} -> {raw}")

    if missing:
        print("\n".join(missing))
        return 1

    print("doc references: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
