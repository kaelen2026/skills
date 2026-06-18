---
name: decision-log
description: "Leaves a lightweight trace of a real decision for the future self: why this choice, what got rejected, and under what condition to revisit, an ultra-light ADR for a dev who has no one to discuss with. Use when the dev makes a non-obvious technical or product call and asks 记一下/留个痕/为什么这么选/decision log/ADR/写下来 or wants to remember the reasoning later. Not for producing the decision itself (use think)."
when_to_use: "记一下, 记下来, 留个痕, 留个记录, 为什么这么选, 当时怎么想的, 决策记录, 写个 ADR, 决策日志, decision log, ADR, log this decision, record why, why did I, remember this choice, write it down, document the decision"
dispatch_intent: "Capture a made decision lightly: the choice, what was rejected, why, and the condition that should trigger a revisit, for the future self"
---

# Decision-Log: 给半年后的自己留一条决策痕

一个人开发没人一起复盘，半年后翻到一段奇怪的代码，第一反应是"我当时为什么这么写"，然后要么不敢动，要么推倒重来。这个 skill 把一次决策的"为什么这么选、放弃了什么、什么前提下该重审"轻量留痕，是超轻量 ADR。失败模式：要么写成长篇 ADR 仪式（写一次就再也不想写第二次），要么只记了选了什么、没记为什么和放弃了什么（半年后等于没记）。

**记的是判断，不是过程。** 不复述讨论过程、不贴大段代码。只留三样能救未来的你：当时选了什么、否掉了什么及原因、什么条件下要回来重审。

## Outcome Contract

- Outcome: 一次非显然的决策被轻量留痕，半年后的自己看一眼就懂当时的判断。
- Done when: 决策一句话、被否的备选及原因、触发重审的条件都写了，且短到下次还愿意再写。
- Evidence: 这次决策的真实约束与备选（多半来自刚跑完的 think / scope-guard）、相关代码或文件路径（引用不复制）。
- Output: 一条追加到决策日志的简短记录。不重写历史记录，只追加。

## Core Stance

- **轻到愿意重复做。** 一条记录几行字，不是一页文档。仪式感越重，留痕这件事越活不过第三次。模板见 `references/decision-template.md`，按需加载。
- **必记三件：选了什么、否了什么及原因、何时重审。** "选了什么"自己看代码就知道，真正救命的是后两样：当时认真考虑过但放弃的方案，以及"在什么新情况下这个决策就不成立了"。
- **记前提，不记结论的对错。** 决策基于当时的约束（数据量小、只有一个用户、赶时间）。把前提写下来，未来前提变了，自然知道该重审。
- **引用不复制。** 相关的 PRD、方案、commit、代码位置用路径或链接指过去，不要把内容抄进记录，否则记录会和真相漂移。
- **只追加，不改写。** 旧决策被推翻了，写一条新记录说明"取代了哪条、为什么"，不要回去改旧的。日志的价值在于看得到判断怎么演变。

## Pre-flight

- 确认这值得记。显然的、无备选的、改起来零成本的决策不用记。值得记的是：有过真实的取舍、改起来有成本、或依赖了一个可能会变的前提。
- 看一眼有没有现成的决策日志文件（项目里的 `DECISIONS.md`、`docs/decisions/`、ADR 目录）。有就追加，没有就在项目根建一个轻量的 `DECISIONS.md`。
- 这条决策刚从 think / scope-guard 出来的话，直接取那里的"被否取舍"和"假设"填进来，别重新想一遍。

## Hard Rules

- **不记被否的备选和原因，就等于没记。** 只写"用了 X"半年后毫无价值，因为代码本身就告诉你用了 X。必须写当时认真考虑又放弃的方案及原因。
- **必须有重审触发条件。** 每条记录写一句"什么情况下回来重审"（用户超过 N、数据量到 X、第二个用例出现、某依赖弃用）。没有触发条件的记录是死的。
- **保持轻量，拒绝 ADR 仪式。** 不要套用企业级 ADR 的十段式模板。几行字讲清三件事即可，长度本身就是这个 skill 能活下来的前提。
- **引用而非复制外部内容。** PRD、方案、代码用路径/链接指过去。复制进来的内容会过时，路径不会。
- **只追加。** 不修改、不删除旧记录。决策变了写新记录并注明取代关系。
- **不在这里做决策。** 决策本身在 think 里做完。这里只负责留痕。如果还没决定，先去 think，别用日志当决策工具。

## Gotchas

| 出过的问题 | 规则 |
| --- | --- |
| 只记了"选了 X"，没记否掉了什么 | 必记被否备选及原因，否则代码已经说明了 X |
| 记录没有重审触发条件，成了死档 | 每条带一句"何时回来重审" |
| 套了企业级十段 ADR 模板，写一次就放弃 | 保持几行字，轻到愿意重复 |
| 把整段 PRD / 方案抄进记录，后来漂移失真 | 引用路径/链接，不复制 |
| 决策变了就回去改旧记录 | 只追加，新记录注明取代哪条 |
| 还没想清就来记录 | 先 /think 决策，日志只留痕 |
| 把每个显然的小决定都记了，日志变噪音 | 只记有取舍、有成本、有可变前提的 |

## Output

追加到 `DECISIONS.md`（或项目已有的决策文件）一条记录：

```
## [日期] 决策：[一句话标题]

- 选了什么：一句话
- 否掉了什么 / 为什么：当时认真考虑又放弃的备选及原因
- 当时的前提：基于哪些约束（数据量 / 用户数 / 时间 / 依赖）
- 何时重审：什么新情况下这个决策不再成立
- 相关：[路径或链接，不复制内容]
```

完整字段与示例见 `references/decision-template.md`。收尾只报一句：记到了哪个文件、第几条。
