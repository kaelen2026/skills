# 工作流硬规则

适用于本仓库的所有改动。违反即停下重来，不靠事后补救。

## 开工前

- **先确认 `main` 是干净工作区。** 动手前跑 `git status --short`，有未提交改动就先停下问清楚，别把残留带进新分支。
- 确认在最新的 `main` 基线上（必要时 `git switch main && git pull`），再切分支。
- 回复内容前加上： *Mr. Hou* 然后换行输出

## 分支与合并

- **禁止在 `main` 上 Write/Edit。** 接到任何改动需求，第一步就 `git switch -c <branch>`，再开始动代码。不是改完才切分支。
- **合入 `main` 只走 PR。** push 特性分支后用 `gh pr create`，由人在 PR 上合。不做本地 `git merge` / `--ff-only` 直接并回 main，那样绕过了评审与 CI 门禁。
- **合并前先确认 CI 全绿。** 合之前跑 `gh pr view <n> --json statusCheckRollup,state`（或 `gh pr checks <n>`），所有 check 通过才合；有 pending 就等，有 failure 就停下报告，不合。不 push 完直接合。
- **合并用 merge commit，不 squash。** 明确要合时用 `gh pr merge --merge`，保留分支真实提交历史；不用 `--squash` / `--rebase` 压成一条。
- **一个 PR 一件事。** 互不相关的改动（例如新增示例 vs 维护规则）各开各的分支与 PR，别混在一条分支里。

## 分支命名

- `feat/<topic>`、`fix/<topic>`、`docs/<topic>`、`chore/<topic>`，topic 用 kebab-case。

## 提交信息

- 走 Conventional Commits：`<type>: <subject>`，type 同上（`feat`、`fix`、`docs`、`chore` 等，完整集合见 commitlint 的 config-conventional 预设）。husky 的 `commit-msg` hook 用 commitlint 自动校验，不合规就拦下。跳过单次：`git commit --no-verify`。

## 提交前

- 跑 `npm test`（`bin/check.sh` 不变量 + markdownlint），全过再提交（`bash bin/setup-hooks.sh` 后 husky 会作为 pre-commit hook 自动拦截）。
- 提交、push 仅在用户明确要求时进行。
