---
name: document
description: "Makes docs catch up to shipped code: reads the diff against base, syncs README/ARCHITECTURE/CONTRIBUTING/CHANGELOG to match what actually shipped, then maps coverage against the Diataxis quadrants and drafts the missing reference/how-to/tutorial/explanation docs. Use when a solo dev asks update the docs/同步文档/文档跟一下/补文档/写文档 after shipping. Not for polishing prose you already wrote (use write) or multi-source research drafts (use learn)."
when_to_use: "update the docs, sync documentation, post-ship docs, 同步文档, 文档跟一下, 文档更新, 更新文档, 补文档, 缺什么文档, 写文档, 写个README, 写架构文档, 文档覆盖, Diataxis, 文档欠债, doc debt, document this feature, generate docs, README out of date, 文档过时了"
dispatch_intent: "Sync existing docs to a shipped diff, map Diataxis coverage, draft missing reference/how-to/tutorial/explanation docs"
---

# document: 文档是你一个人欠的债

一个人开发，文档永远是欠的债，且只有你一个人在还。代码发出去了，README 还停在三个版本前，新功能没人写说明，架构图对不上现在的代码。这个 skill 做两件事：按已 ship 的 diff 把现有文档同步到"真实发生了什么"，再用 Diataxis 四象限照一遍覆盖、把缺的那类文档补上。失败模式：把 CHANGELOG 已有条目覆盖重写（丢历史），或不读 diff 凭想象生成一堆没人会看的文档。这个 skill 跟 `write` 的边界很清楚：write 润色你已经写好的 prose，document 是按代码和 diff 结构化地同步与生成文档。

## Outcome Contract

- Outcome: 项目文档与已 ship 的代码一致，且 Diataxis 四象限里该有的文档都在。
- Done when: 每处文档改动都能从本回合读到的 diff 推出来；CHANGELOG 只润色不重写；缺失文档按象限补齐或明确记为延后；改了哪些文件、各自改了什么，逐条说清。
- Evidence: `git diff <base>...HEAD` 与改动文件清单、仓库里现有的 `.md` 文件、各文件与 diff 的交叉核对结果。
- Output: 直接改文档文件（Edit 现有、Write 新建），最后给一张每个文档文件状态的健康摘要。

## Core Stance

- **diff 是真相源，不是你的记忆。** 改文档前先读本回合的 diff。说"加了 X 功能"要能在 diff 里指出 X。凭印象写文档是文档腐化的根因。
- **绝不覆盖 CHANGELOG 条目。** CHANGELOG 的每条都是某次 ship 从真实 diff 写下的历史。只润色措辞，永不删除、重排、重新生成。改 CHANGELOG 一律用 Edit 精确匹配，绝不用 Write 整体覆盖。出过真实事故：agent 把已有条目整段替换掉。
- **明显的事实改动直接改，主观/有风险的才问。** 加表格项、改路径、改计数、修陈旧交叉引用,直接动手。叙事改写、删整节、改安全模型、大段重写、版本号 bump，停下问。
- **生成缺失文档前先照 Diataxis。** 不是把所有四象限都写满才叫完整。先看现有文档落在哪些象限、用户真正缺哪一类，再补那一类。象限说明见 references。
- **写给一个没看过代码的聪明人。** 文档不是写给你自己看的备忘。语气友好、面向使用者，先说用户现在能做什么，而不是你重构了什么。

## Pre-flight

确认在 git 仓库且不在 base 分支上（在 base 分支就停下：从功能分支跑）。
定 base 分支：依次 `git symbolic-ref refs/remotes/origin/HEAD`、`origin/main`、`origin/master`，失败回退 `main`。
采 diff 上下文：`git diff <base>...HEAD --stat`、`git log <base>..HEAD --oneline`、`git diff <base>...HEAD --name-only`。
找文档文件：`find . -maxdepth 2 -name "*.md" -not -path "./.git/*" -not -path "./node_modules/*" | sort`。
把改动按文档相关性分类：新功能 / 行为变更 / 移除 / 基建。输出一行摘要："N 个文件变动，M 个 commit，K 个文档文件待审。"

## 两个模式

两个模式通常连着跑：先同步，再补缺。也可只跑其一。

**同步已有 · Activate when**: "更新文档""同步文档""文档跟一下"、刚 ship 完。逐个读文档文件，与 diff 交叉核对，把过时的改对。各文件的审查启发式（README / ARCHITECTURE / CONTRIBUTING / CHANGELOG / 项目说明文件）见 `references/sync-audit.md`，开始逐文件审查时读它。明显事实改动直接 Edit；风险改动逐项问。CHANGELOG 单独走"只润色不覆盖"规则。最后做一遍跨文档一致性与可发现性检查（每个文档都能从 README 或项目说明文件里被链接到）。

**生成缺失 · Activate when**: "缺什么文档""补文档""写个 README""写架构文档""帮这个功能写文档"。先用 Diataxis 四象限给现有文档分类、找出缺口，再补最该补的那类。四象限定义、判别问题、各类文档的结构模板见 `references/diataxis.md`，进入生成模式时读它。新文档用 Write 创建，建完确保能从 README 或项目说明文件里被发现。

## Hard Rules

- **不读 diff 不改文档。** 每处文档改动都要能指回本回合 diff 里的具体改动。凭记忆或上文复述代码状态是禁止的。
- **CHANGELOG 永不覆盖。** 只用 Edit 精确匹配润色措辞。不删、不重排、不重新生成条目。绝不用 Write 写 CHANGELOG.md。条目看着错或不全，用提问确认，不要静默改。
- **VERSION 永不静默 bump。** 有 VERSION 文件且需要改版本号时，停下问。即便看起来该 bump 也先问。
- **不删整节。** 不移除任何文档的整个章节。README 介绍/定位、ARCHITECTURE 的设计理由、安全模型描述，都不自动改，要问。
- **生成前先照象限，不堆文档。** 不是四象限都写满。按用户真实缺口补，宁可少而准。没人会看的文档不如不写。
- **每处改动给一行说明。** 不是"更新了 README"，而是"README: skills 表加了 /document，技能数从 9 改到 10"。
- **改完不擅自 commit/push。** 除非用户明确要。默认只改文件、给摘要。

## Gotchas

| 出过的问题 | 规则 |
| --- | --- |
| 把 CHANGELOG 已有条目整段重写，丢了历史 | 只 Edit 润色措辞，永不 Write 覆盖、永不删条目 |
| 不看 diff 凭印象更新 README，越更越错 | 先读本回合 diff，改动要能指回 diff |
| 把四象限当待办全写满，产出一堆没人看的文档 | 先 Diataxis 分类找真实缺口，按需补 |
| 悄悄 bump 了 VERSION | 任何版本号改动先问，绝不静默 |
| 新写的文档没人能找到 | 建完检查能否从 README 或项目说明文件链接到 |
| CHANGELOG 写成 commit message（"重构了 X"） | 先说用户现在能做什么（"你现在可以…"） |
| 在 base 分支上跑，没有 diff 可比 | Pre-flight 检测分支，在 base 上就停 |

## Output

先给改动逐文件的一行说明（改了什么，不是"改了哪个文件"）。最后给一张可扫读的文档健康摘要：

```
文档健康:
  README.md        Updated（skills 表加 /document，计数 9→10）
  ARCHITECTURE.md  Current（无需改动）
  CONTRIBUTING.md  Current
  CHANGELOG.md     Voice polished（措辞微调，未改内容）
  docs/how-to-x.md Created（how-to 象限缺口）
  VERSION          Not bumped（用户选择跳过）
```

状态取值：Updated / Current / Voice polished / Created / Not bumped / Skipped（文件不存在）。
