# CLAUDE.md：kaelen/skills 维护指南

这是一套面向独立开发者的零基建、纯 prompt 技能包。新增或修改 skill 时严格遵守以下不变量（背景见 [README](./README.md) 的"房屋风格"）。改完务必跑 `bin/check.sh` 自检，全过再提交。

## 每个 skill 的结构

- 每个 skill 是 `skills/<name>/` 下的一个 kebab-case 目录，内含 `SKILL.md`；深度内容（长清单、评分维度、模板）放 `references/*.md`，按需加载。插件机制自动发现 `skills/` 下的所有 skill。
- `health` / `check` / `read` 带的 `scripts/`、`agents/` 是从上游近原样搬来的工具代码，**别为风格手改**，规则见 [VENDORED.md](./VENDORED.md)。
- frontmatter 四件套：
  - `name`：kebab-case，**必须等于目录名**。
  - `description`：第三人称，先说做什么 + 何时用，结尾用 `Not for ...` 指向最接近的邻居 skill，避免抢触发。
  - `when_to_use`：逗号分隔的真实触发词，中英混排。
  - `dispatch_intent`：一句意图。
- 正文中文为主，结构：`# 名: 一句签名式本质` → 2-4 句本质 + 要避免的失败模式 → `## Outcome Contract` → `## Core Stance` →（可选）`## Pre-flight` →（可选）`## 模式`（每个 `**Activate when**: ...`）→ `## Hard Rules` → `## Gotchas`（表格）→（可选）`## Closing Pass` → `## Output`。

## 硬规则

- **禁英文破折号**：不写落单的 em-dash（U+2014）、en-dash（U+2013）、连接号分隔符（U+2E3A/U+2E3B）。中文破折号 —— 是合法标点，可用。其余改用逗号、句号、冒号或小标题。`bin/check.sh` 会校验。
- **每条 Hard Rule / Gotcha 必须对应一个真实会犯的错**，否则删掉。
- **写判断与硬规则**，不写"第一步读文件、第二步分析"这类模型本就会的流程。
- **精简 SKILL.md**，深度下沉到 references，正文只留判断和索引，并写明何时加载哪个文件。

## 提交前

1. 跑 `bin/check.sh`，全过。克隆后跑一次 `bash bin/setup-hooks.sh` 即可把它接成 git pre-commit hook（`core.hooksPath -> .githooks`），之后每次提交自动校验，不过就拦下。确需跳过单次：`git commit --no-verify`。
2. 新增 skill 记得在 README 的技能清单、困境映射表、致谢段里登记。
