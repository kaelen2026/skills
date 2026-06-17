<!-- 工作流规则见 .claude/rules/workflow.md：从干净的 main 切分支、一个 PR 一件事、合入只走 PR。 -->

## 做了什么

<!-- 一两句说清这个 PR 解决什么、改了哪些地方。 -->

## 为什么

<!-- 背景或动机；非显然的取舍可链到 example/chain 里的 decision-log 风格说明。 -->

## 验证

<!-- 怎么证明它对：贴命令与结果。 -->

- [ ] `bin/check.sh` 全过（CI 也会在 PR 上跑同一门禁）
- [ ] 涉及 `example/app` 时：`cd example/app && npm test` 全绿

## 自检

- [ ] 从干净的 `main` 切分支，未在 `main` 上直接改
- [ ] 一个 PR 一件事，无夹带无关改动
- [ ] 新增/改动 skill 时，已按 [CLAUDE.md](../CLAUDE.md) 在 README 的技能清单、困境映射表、致谢段登记
- [ ] 无落单英文破折号（中文 —— 可用）
