---
name: handoff
description: "Compresses the current conversation into a focused handoff doc so the next session (a fresh agent or future you) can resume without re-reading everything, referencing artifacts by path instead of recopying them. Use when an indie dev says 交接/接力/续上/换个会话继续/快满了/handoff/continue this later/pick up next time or the context is getting long. Not for planning a feature (use think) or recording why a decision was made (use decision-log)."
when_to_use: "交接, 接力, 续上, 续接, 换个会话, 换个会话继续, 下次接着, 快满了, 上下文太长, 压缩上下文, 存个进度, handoff, hand off, continue this later, pick up next time, resume next session, context getting long, compact context, save state for next"
dispatch_intent: "Compress this conversation into a handoff doc the next session can resume from, referencing artifacts by path"
---

# Handoff: 把这段对话压成下一段能接着干的交接文档

一个人开发，一段会话越拉越长，等真要换会话或第二天接着干时，全靠脑子记当时干到哪、为什么这么走。这个 skill 把当前对话压成一份聚焦的交接文档，让下一段（新 agent 或明天的你）不用重读全程就能续上。失败模式：要么把整段对话原样转录（没压缩，下一段还是要重读），要么压得只剩结论（丢了"下一步要干什么、卡在哪"，接的人无从下手）。

**交接的是状态和方向，不是流水账。** 压缩的核心是判断什么留、什么扔：决策和当前状态留，已经记在别处的过程引用路径，敏感信息删。

## Outcome Contract

- Outcome: 一段长对话压成一份交接文档，下一段会话据此无缝续上。
- Done when: 干到哪、关键决策、下一步、相关产物路径、建议接力用哪个 skill 都写了，且没有重读全程才懂的隐含上下文。
- Evidence: 当前对话本身、已落盘的产物（方案、PRD、决策记录、commit、diff 的路径或链接）、用户对"下一段要聚焦什么"的说明。
- Output: 一份交接文档，写到系统临时目录（不是工作区），路径报给用户。

## Core Stance

- **压缩，不是转录。** 目标是下一段不用重读这段对话。复述对话过程没有价值，写清现在在什么状态、为什么走到这、下一步往哪走。
- **引用而非复制。** 方案、PRD、决策记录、issue、commit、diff 已经在别处的，用路径或链接指过去，不要把内容抄进交接文档，否则文档一长又得重读。
- **按用户要聚焦的方向裁剪。** 用户说"下一段专注修那个 bug"，就把和那个 bug 无关的上下文压到最薄。用户给的方向是裁剪依据。
- **删敏感信息。** API key、密码、token、个人身份信息一律不写进交接文档。要让下一段知道"需要某个 key"就写"需要 X 服务的 key（不在此文档）"。
- **写明下一步和卡点。** 接的人最需要的是"现在该干什么"和"卡在哪"。只交接已完成的、不交接待办和阻塞，等于让下一段从头摸索。

## Pre-flight

- 先确认下一段要聚焦什么。用户给了方向就照着裁剪；没给就默认交接"当前主线任务 + 未完成项"。
- 扫一遍这段对话里产出的落盘产物（写了哪些文件、建了哪个分支、有没有 think/decision-log 的输出），列出路径，交接时引用它们而不是复述。
- 交接文档写到系统临时目录（如 `$TMPDIR` 或 `/tmp`），不要写进工作区，避免污染仓库或被误提交。

## Hard Rules

- **不要原样转录对话。** 没有压缩的交接文档等于没交接，下一段照样要重读。只留状态、决策、下一步。
- **不要把外部产物内容复制进来。** 方案、PRD、diff、决策记录用路径/链接引用。复制进来既冗长又会和真相漂移。
- **绝不写入敏感信息。** key、密码、token、PII 一律删。需要提及就只写"需要某凭据，不在此文档"。
- **必须包含下一步和卡点。** 交接文档没有"接下来干什么"和"卡在哪"，就只是一份历史摘要，不是交接。
- **必须给出建议接力 skill。** 写一节"下一段建议用哪个 skill"（修 bug → hunt、出方案 → think、发布前 → check、留决策痕 → decision-log），让下一段直接进入正确流程。
- **写临时目录，不写工作区。** 交接文档不进仓库，避免污染或误提交。

## Gotchas

| 出过的问题 | 规则 |
|---|---|
| 把整段对话原样转录，下一段还得重读 | 压缩状态和方向，不转录过程 |
| 把方案/PRD/diff 内容抄进文档，又长又漂移 | 引用路径/链接，不复制 |
| 顺手把日志里的 API key 写进了交接文档 | 删敏感信息，只写"需要某凭据" |
| 只交接了做完的，没写待办和卡点 | 必含下一步和阻塞 |
| 没说下一段该用哪个 skill | 给出建议接力 skill |
| 交接文档写进了工作区被误提交 | 写系统临时目录 |
| 不看用户要聚焦什么，全量交接 | 按用户给的方向裁剪 |

## Output

写到系统临时目录的一份交接文档：

```
# 交接：[一句话主题]

## 当前状态
干到哪了，现在系统/分支处于什么状态。

## 关键决策
做了哪些非显然的选择，为什么。已有 decision-log 记录的引用路径。

## 下一步
接下来具体要做什么，按顺序。

## 卡点 / 未知
卡在哪，缺什么信息或权限（凭据只写需要什么，不写值）。

## 相关产物（引用，不复制）
- 方案 / PRD：[路径或链接]
- 分支 / commit / diff：[引用]
- 其它落盘文件：[路径]

## 建议接力 skill
下一段从哪个 skill 进入：hunt / think / check / scope-guard / ship-small / decision-log，及为什么。
```

收尾只报一句：交接文档写到了哪个路径，下一段会话可以从那里续上。
