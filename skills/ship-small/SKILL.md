---
name: ship-small
description: "Splits one big pile of changes into a sequence of small steps that each ship, verify, and roll back on their own, ordered so every step leaves the project working. Use when an indie dev has a fat branch, a multi-part feature, or a 'just one more thing' diff and asks 怎么拆/拆成几步/太大了/分批发/break this up/ship incrementally. Not for deciding how to design it (use think) or gating the diff before merge (use check)."
when_to_use: "怎么拆, 拆开, 拆成几步, 分批, 分批发, 太大了, 一坨, 改太多, 一次别改这么多, 怎么发, 小步发, 先发哪个, break this up, split this, ship incrementally, smaller PRs, slice this, tracer bullet, vertical slice, too big to review"
dispatch_intent: "Fat branch or multi-part change to split into independently shippable, verifiable, reversible steps in dependency order"
---

# Ship-Small: 把一坨改动切成各自能上、能验、能回滚的小步

一个人开发没人帮你 review 一个 800 行的 PR，也没人在你发崩之后帮你查是哪一块。所以更要小步发：每一步都穿过所有层、能独立演示、能单独回滚，按依赖顺序排。失败模式有两个：一是横着切（这步只动 schema，那步只动 UI，没有一步能演示），结果攒到最后一次性合，崩了无从定位；二是切得能跑但回滚要连带撤三步，等于没切。

**一片就是一颗 tracer bullet：窄，但从入口穿到结果。** 不是把大改动按层切片，是按"能独立演示并验证的最小完整路径"切。切完每一片都该能回答一句话：上完这片，用户能多做什么，我怎么证明它好了。

## Outcome Contract

- Outcome: 一坨改动变成一个有序的小步清单，每步独立可上、可验、可回滚。
- Done when: 每片都穿过所有相关层、有一句话的演示场景、有一个 pass/fail 验证、依赖排在它前面、回滚不牵连后续步。
- Evidence: 当前 diff / 分支状态（`git status`、`git diff --stat`）、项目的测试与发布方式、相关时的 issue/PRD。
- Output: 一张有序切片表，每片标注：动什么、怎么演示、怎么验、回滚边界、HITL 还是 AFK。

## Core Stance

- **竖切，不要横切。** 每片自带它需要的 schema、逻辑、UI、测试，上完就能演示一个真实行为。"先把所有 model 建完"这种横片不能演示，是隐藏的大爆炸。
- **薄片优先于厚片。** 宁可多切几片薄的，也不要少切几片胖的。薄片 review 快、出事定位快、回滚干净。一片改超过它该改的层，就再切一刀。
- **按依赖排，阻塞项先上。** 后面要用到的东西排在前面，且排在前面的那片上线后系统就是可用的，哪怕后面的永远不来。出现"第 0 片：调研/spike"说明调研该在切片之前做完。
- **每片自带它的验证。** 一片没有"怎么证明它好了"就不是一片，是一摊待办。能写测试写测试，能 curl 就 curl，能点一下 UI 就写清点哪。
- **标 HITL / AFK。** AFK = 你能闭眼实现并合的片（纯实现、有明确验收）。HITL = 需要你做架构或产品取舍、要看效果再定的片。先把 HITL 的决策点单独拎出来定掉，别埋在实现里。

## Pre-flight

- 先看清这坨到底改了什么：`git status --short` 和 `git diff --stat`（或对着分支 `git diff main...HEAD --stat`）。凭印象切片会漏掉已经混进去的无关改动。
- 确认怎么验、怎么发：项目用什么测试命令、怎么部署、能不能单独回滚一片（一个 commit？一个 PR？一个 feature flag？）。回滚单位决定了切片的最小粒度。
- 若这坨改动里混了不相关的顺手改（重命名、格式化、临时调试），先标出来单独成片或剔除，不要让它们污染每一片的 diff。

## Hard Rules

- **不能独立演示的不算一片。** 每片上完必须能演示一个用户可见或可调用的行为。只动一层、要等后续片才能跑的，是横切，重切成竖片。
- **回滚要牵连后续片的，边界画错了。** 撤这片必须不破坏已上线的前序片。做不到就说明这片和前面那片其实是一片，或者顺序排反了，重排。
- **先剔无关改动再切片。** 顺手的重命名、格式化、调试代码不要散在功能片里，否则每个 PR 的 diff 都被噪音撑大，review 不动也是你自己 review。
- **HITL 决策不要埋进 AFK 片。** 任何"上线看效果再定""这里有两种做法"的取舍单独标 HITL 先定掉，不要让一个本该闭眼合的片卡在一个没定的产品问题上。
- **切片不是重新设计。** 怎么实现已经定了才来切片；如果切的过程中发现方案本身不成立，停下回 think，不要边切边改设计。
- **多片之间不留占位符。** "这片先留个 TODO 等下片接"是把大爆炸推迟，不是切片。每片自身完整。

## Gotchas

| 出过的问题 | 规则 |
|---|---|
| 按层切：一片全是 model，一片全是 UI，没一片能演示 | 竖切，每片穿透所有层 |
| 切完每片能跑，但回滚第 2 片会带崩第 3 片 | 回滚边界独立，否则顺序或粒度错了 |
| 把顺手的格式化、重命名混进功能片，diff 撑到没法看 | 无关改动先剔出单独成片 |
| 一片卡在"这里两种做法没定" | 该片标 HITL，决策先定，再排进 AFK 实现 |
| 凭印象列切片，漏了已经混进分支的改动 | 先 `git diff --stat` 看全量 |
| 切到一半发现方案根本不对 | 停，回 think，别边切边重设计 |
| 第一片就是"搭好所有基础设施" | 那是横片；第一片也要能演示一个真实行为 |

## Output

一张有序切片表，按依赖从先到后：

```
切片清单（按上线顺序）

1. [片名] · AFK/HITL
   - 动什么: 跨哪些层（schema / 逻辑 / UI / 测试）
   - 演示: 上完这片，用户/调用方能做的一个具体行为
   - 验证: 一个 pass/fail 检查（测试命令 / curl / 点哪）
   - 回滚: 撤这片的单位（commit / PR / flag），不牵连前序片
   - 依赖: 无 / 依赖第 N 片

2. ...
```

收尾：标出哪些片是 HITL、要先定掉的决策是什么。然后这句收尾：

```
切片已就绪。逐片实现，每片上线前跑 /check 过一遍发布门禁。
```
