#!/usr/bin/env bash
# 启用提交前门禁。克隆后跑一次即可。
# 装依赖会触发 package.json 的 "prepare": "husky"，由 husky 把 .husky/ 接成 git hooks
# （core.hooksPath -> .husky/_）。之后每次提交自动跑 lint-staged + bin/check.sh，不过就拦下。
set -uo pipefail
root="$(git rev-parse --show-toplevel)" || { echo "不在 git 仓库里"; exit 1; }
cd "$root" || exit 1

if ! command -v npm >/dev/null 2>&1; then
  echo "需要 Node/npm（husky + markdownlint 依赖它），先安装 Node 再跑本脚本。" >&2
  exit 1
fi

npm install
echo "已启用提交前门禁（husky -> lint-staged + bin/check.sh）。"
echo "跳过单次：git commit --no-verify"
