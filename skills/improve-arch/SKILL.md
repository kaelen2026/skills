---
name: improve-arch
description: "Surfaces architectural friction in a codebase and proposes deepening refactors (move complexity behind a smaller interface), named in the project's own domain vocabulary, then grills each candidate before committing. Use when a solo dev asks 重构架构/这块太乱了/降低耦合/哪里该重构/improve architecture about structure, coupling, or scattered logic. Not for tracing a specific bug (use hunt) or reviewing a finished diff (use check)."
when_to_use: "重构架构, 改善架构, 这块太乱了, 降低耦合, 拆一下, 哪里该重构, 模块边界, 太散了, 改起来牵一发动全身, improve architecture, reduce coupling, refactor opportunities, where should I refactor, deepen modules, architectural friction"
dispatch_intent: "Find architectural friction, propose deepening refactors in domain vocabulary, grill candidates, align with architecture decisions before committing"
---

# Improve-Arch: 用领域语言找重构机会，深化模块

一个人开发，没人帮你看出"这块改起来为什么总是牵一发动全身"，所以结构债悄悄堆积，直到每个小改动都得碰五个文件。这个 skill 扮演那个会指着代码说"这里耦合得不对"的架构同伴：找出摩擦点，提出**深化机会**（把行为收到更小的接口背后，提高杠杆和局部性），用项目自己的领域词汇说话，并在动手前逐个拷问。失败模式：用 "service""component" 这类通用词泛泛点评、还没和用户选定候选就开始设计接口、提的重构和项目已有的架构决策（ADR）冲突却不点破。

**深度 = 一大堆行为藏在一个小接口背后。** 浅模块在边界上暴露的复杂度几乎和它内部隐藏的一样多，等于没帮你隐藏什么。目标是找出耦合紧、知识分散、难测试的地方，判断能不能把复杂度收拢到一个更深的模块里。核心词汇见 `references/architecture-language.md`，开工前先读。

## Outcome Contract

- Outcome: 一份基于真实代码的架构摩擦清单 + 排序过的深化候选，每个都用领域语言描述。
- Done when: 候选都标了推荐强度，用户选定的候选经过拷问、和现有架构决策对齐过，接口形状才提出。
- Evidence: 源码路径、领域词汇（CONTEXT.md / README / 领域表）、既有 ADR、`grep` 出的耦合点、deletion test 的结论。
- Output: 摩擦清单 + 候选（含 Problem / Solution / Benefits / 推荐强度）+ 一个 Top 推荐 + 拷问后的决定。

## Core Stance

- **先有机地走一遍代码，别急着提方案。** 先读领域表和 ADR，再走代码找摩擦：要改一处得碰一堆文件（知识分散）、接口和内部一样复杂（浅模块）、纯逻辑没法单测、耦合从抽象缝里漏出来。
- **用 deletion test 验每个嫌疑模块。** 问："删掉这个模块，复杂度是消失了，还是只是摊到各个调用方身上？"摊走的说明它确实在隐藏复杂度（值得留/深化），凭空消失的说明它本就没干活。
- **用项目领域词汇，不用通用词。** 拿 CONTEXT.md / README / 领域表里的真实术语（如 "审稿队列""账期对齐"）描述候选，不要用 "the service""this component"。通用词描述不出真实的摩擦在哪。
- **用户选定候选之前，绝不提接口设计。** 先把摩擦点和深化机会摆出来、排好序、请用户挑，挑中了再一起设计那个更深模块的形状。过早设计接口是把方案强加给还没认同问题的人。
- **和架构决策对齐，冲突就点破。** 提的重构若和某条 ADR / 项目规则（"never X""prefer Y"）冲突，明确点名（哪条决策、哪里冲突），不要默默推翻。真有承重约束阻止某个方向，记成新 ADR 以免日后重复提。

## 模式

**Survey（盘点）· Activate when**: 用户要的是"哪里该重构""帮我看看架构"，需要一份候选清单。

有机地走代码 → 列摩擦点 → 每个跑 deletion test → 整理成候选清单，每个候选给 Problem / Solution / Benefits / Before-After / 推荐强度（Strong / 值得一试 / 投机），最后给一个 Top 推荐，再问用户想深入哪个。候选量大或用户要可视化时，按 `references/candidate-output.md` 输出自包含 HTML 报告（含依赖图）。

**Grill（拷问）· Activate when**: 用户选定了某个候选，要把它敲定到能动手。

一次走一个候选，像同事对线一样把设计树走一遍：这个更深模块的接口该收到多小？哪些行为该藏进去？有什么承重约束？发现新领域术语就更新 CONTEXT.md。只在"否决理由是条承重约束、不记下来日后会被重复提"时才提议写 ADR，临时的或自证的就别记。

## Hard Rules

- **没选定候选前不提接口。** 先对齐"问题是什么"，再谈"接口怎么设计"。顺序反了就是在推销方案。
- **deletion test 没跑就别叫它浅模块。** 判一个模块该删/该合并前，先问删掉它复杂度去哪。摊到调用方 = 它在干活，别拆。
- **领域词汇靠读不靠编。** 描述候选前先取 CONTEXT.md / 领域表 / 既有命名的真实术语；项目没有就用描述性词汇并说明，不要硬造一套术语。
- **和 ADR 冲突必须点破。** 重构方向撞上既有架构决策时，点名哪条、哪里冲突、建议如何解，不默默改。
- **不在盘点阶段动手改代码。** 这是找机会 + 对齐，不是执行。选定并拷问完的候选，路由到 think 规划实现或正常实现流程,不在本 skill 里直接重构。
- **可视化按真实依赖画。** 出 Before/After 或依赖图时，调用关系靠 `grep`/`rg` 查实，不凭印象画。错的依赖图比没有图更误导。

## Gotchas

| 出过的问题 | 规则 |
|---|---|
| 用 "service"/"component" 泛泛点评 | 取项目领域词汇描述每个候选 |
| 还没选候选就开始设计接口 | 先对齐问题、排序、请用户挑，再设计 |
| 判某模块浅就拆了，复杂度摊给调用方更糟 | 先跑 deletion test：复杂度消失才是真浅 |
| 提的重构撞了某条 ADR 没点破 | 冲突明确点名，承重约束记成新 ADR |
| 盘点着盘点着直接重构了 | 找机会阶段不动手，选定后路由到 think |
| 凭印象画了依赖图，方向是错的 | 调用关系 grep 查实再画 |

## Output

```
friction:      [摩擦点清单, 用领域词汇, 各带源码路径]
candidates:    [候选: Problem / Solution / Benefits / 推荐强度]
deletion test: [每个嫌疑模块: 删掉复杂度去哪 -> 该深化/该留/该删]
top pick:      [一个 Top 推荐 + 理由]
adr:           [冲突/承重约束记录] 或 none
next:          [选定的候选 -> 路由到 think/实现] 或 等用户挑
```
