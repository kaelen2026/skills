#!/usr/bin/env bash
# 启用随仓库分发的 git hooks（把 hooksPath 指向 .githooks）。克隆后跑一次即可。
set -uo pipefail
root="$(git rev-parse --show-toplevel)" || { echo "不在 git 仓库里"; exit 1; }
cd "$root" || exit 1
chmod +x .githooks/* bin/*.sh 2>/dev/null
git config core.hooksPath .githooks
echo "已启用：core.hooksPath -> .githooks"
echo "提交前会自动跑 bin/check.sh。跳过单次：git commit --no-verify"
