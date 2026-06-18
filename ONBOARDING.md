# Onboarding：kaelen/skills

面向新加入的维护者（人或 agent）。读完这一页，你就能安全地提交第一个改动。

事实源是 [AGENTS.md](./AGENTS.md) 与 [.claude/rules/workflow.md](./.claude/rules/workflow.md)，本文只做导航与上手。规则有冲突时以那两份为准。

## 这是什么项目

一套面向独立开发者的零基建、纯 prompt 技能包。每个 skill 是一段结构化的 prompt，插件机制自动发现 `skills/` 下的所有目录。没有运行时、没有构建产物，质量靠约定和检查脚本守住。

## 第一次环境准备

```bash
git clone <repo> && cd skills
bash bin/setup-hooks.sh   # = npm install，触发 husky，接上 pre-commit / commit-msg hook
npm test                  # 确认本地能跑通：bin/check.sh + markdownlint-cli2
```

接上 hook 后，每次提交会自动用 lint-staged 修复并校验暂存的 markdown，提交信息也会被 commitlint 校验。

## 改动的生命周期

这是不可绕过的主干流程：

```
确认 main 干净 → 切分支 → 改代码 → npm test → push → gh pr create → 人在 PR 上合
```

1. **开工前**
   - `git status --short` 确认 `main` 干净；有未提交残留先停下问清楚。
   - 确保在最新 `main` 基线：必要时 `git switch main && git pull`。
2. **切分支再动手**
   - 禁止在 `main` 上 Write/Edit。接到需求第一步就 `git switch -c <branch>`，不是改完才切。
   - 命名：`feat/<topic>`、`fix/<topic>`、`docs/<topic>`、`chore/<topic>`，topic 用 kebab-case。
   - 一个 PR 一件事；不相关的改动各开分支、各开 PR。
3. **提交**
   - 走 Conventional Commits：`<type>: <subject>`，type 用 `feat` / `fix` / `docs` / `chore` 等。
   - `commit-msg` hook 用 commitlint 自动校验，不合规会被拦下；确需跳过单次用 `git commit --no-verify`。
4. **合入 main**
   - 只走 PR：push 特性分支后 `gh pr create`，由人在 PR 上合。
   - 禁止本地 `git merge` / `--ff-only` 直接并回 `main`，那样绕过了评审与 CI 门禁。
5. **提交、push 仅在被明确要求时进行。**

## 提交前门禁

- 跑 `npm test`，即 `bin/check.sh`（不变量校验）+ `markdownlint-cli2`（markdown 门禁），全过再提交。
- markdown 规则见 `.markdownlint-cli2.jsonc`。
- 新增 skill 记得在 README 的技能清单、困境映射表、致谢段里登记。

## 写一个 skill 的结构约定

- 每个 skill 是 `skills/<name>/` 下的 kebab-case 目录，内含 `SKILL.md`；长清单、评分维度、模板等深度内容放 `references/*.md`，按需加载。
- frontmatter 四件套：
  - `name`：kebab-case，必须等于目录名。
  - `description`：第三人称，先说做什么 + 何时用，结尾用 `Not for ...` 指向最接近的邻居 skill，避免抢触发。
  - `when_to_use`：逗号分隔的真实触发词，中英混排。
  - `dispatch_intent`：一句意图。
- 正文中文为主，默认结构：`# 名: 一句签名式本质` → 2-4 句本质 + 要避免的失败模式 → `## Outcome Contract` → `## Core Stance` →（可选）`## Pre-flight` →（可选）`## 模式` →`## Hard Rules` → `## Gotchas`（表格）→（可选）`## Closing Pass` → `## Output`。
- `health` / `check` / `read` 里的 `scripts/`、`agents/` 是从上游近原样搬来的 vendored 代码，别为风格手改，规则见 [VENDORED.md](./VENDORED.md)。

## 内容硬规则

- 禁英文破折号：不写落单的 em-dash（U+2014）、en-dash（U+2013）、连接号分隔符（U+2E3A/U+2E3B）。中文破折号 —— 合法。其余改用逗号、句号、冒号或小标题；`bin/check.sh` 会校验。
- 每条 Hard Rule / Gotcha 必须对应一个真实会犯的错，否则删掉。
- 写判断与硬规则，不写「第一步读文件、第二步分析」这类模型本就会做的流程套话。
- 精简 SKILL.md，深度下沉到 references，正文只留判断和索引，并写明何时加载哪个文件。

## 常见陷阱

| 陷阱 | 后果 | 正确做法 |
| --- | --- | --- |
| 在 `main` 上直接改 | 违反硬规则，得推倒重来 | 第一步先 `git switch -c <branch>` |
| 一条分支塞多件事 | PR 难评审、被打回 | 一个 PR 一件事 |
| 跳过 `npm test` 就提交 | hook 拦截或 CI 失败 | 提交前先本地跑通 |
| 手改 vendored 的 `scripts/` / `agents/` | 与上游漂移、难维护 | 按 VENDORED.md，别为风格改 |
| 正文写满流程套话 | 稀释判断、违反硬规则 | 只写判断与硬规则 |

## 接下来读什么

- [AGENTS.md](./AGENTS.md)：维护指南事实源，动代码前完整读一遍。
- [.claude/rules/workflow.md](./.claude/rules/workflow.md)：工作流硬规则。
- [README.md](./README.md)：项目定位、技能清单、困境映射、「房屋风格」背景。
- [VENDORED.md](./VENDORED.md)：哪些代码是搬来的、为什么别手改。
