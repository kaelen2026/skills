---
name: prototype
description: "Builds throwaway code to answer one design question fast (does this logic feel right, or what should this look like), then captures the answer and deletes the prototype. Use when a solo dev asks 做个原型/试一下手感/验证一下设计/快速搭个 demo or is unsure of a design before committing. Not for writing the real, kept implementation (use think to plan it first)."
when_to_use: "做个原型, 搭个原型, prototype, 试一下手感, 验证一下设计, 这样行不行, 快速搭个 demo, 探一下, spike, 一次性试验, throwaway, does this feel right, what should this look like, quick demo to validate"
dispatch_intent: "Throwaway code to answer one design question, validate logic or look-and-feel, capture the answer, then discard"
---

# Prototype: 一次性代码，回答一个问题，用完即弃

一个人开发，没人陪你对着设计争论"这样到底行不行"，于是要么凭感觉直接写进正式代码（错了返工很贵），要么纠结半天不动手。原型是第三条路：花最小代价搭一个一次性的东西，把"这个设计对不对"亲手验出来，记下答案，然后删掉。失败模式：把原型写得像产品（加测试、加抽象、接数据库），舍不得删，最后这坨临时代码混进正式代码库长期腐烂。

**原型是用来回答一个问题的一次性代码。** 成功的标志不是代码留下来，是答案被记进了永久的地方（commit message、ADR、项目笔记），然后原型被删掉。

## Outcome Contract

- Outcome: 一个具体的设计问题被亲手验出答案。
- Done when: 问题有了明确答案，答案记进了永久位置，原型代码已删除或明确标记为待删。
- Evidence: 原型一条命令能跑起来、每次交互后可见的完整状态、记下答案的 commit/ADR/笔记。
- Output: 一句话的答案（这个设计行/不行/该这样改）+ 答案落点 + 原型已弃置。

## Core Stance

- **先锁定唯一要回答的问题。** "这个逻辑/状态机手感对吗" → 走逻辑分支（终端里把状态跑出来）。"这东西该长什么样" → 走 UI 分支（同一路由上并排几个视觉变体）。问题不清就先问，别两边都搭。
- **速度压倒一切，质量无所谓。** 跳过测试、跳过抽象、错误处理只做到"能跑起来"为止。原型唯一的 KPI 是多快得到答案。
- **不持久化。** 状态留在内存里，除非你验的正是数据库本身。原型不该碰真实数据、不该留下持久副作用。
- **每次交互后渲染完整状态。** 把当前完整状态打出来/显示出来，让每一步变化都肉眼可见。看不见状态变化的原型验不出手感。
- **答案进永久位置，代码进垃圾桶。** 验出来的洞见写进 commit message / ADR / 项目笔记，然后删原型。代码消失，结论留下。

## 模式

**Logic 分支 · Activate when**: 问题是"这个逻辑/状态机/业务流程的手感对不对"。

在终端里搭一个交互式小程序，把状态机或业务逻辑跑出来：输入一个动作，打印出转移后的完整状态。用项目现有的工具链一条命令启动。详细搭法见 `references/prototype-logic.md`。

**UI 分支 · Activate when**: 问题是"这东西该长什么样"。

在同一条路由上放几个视觉变体，用 URL 参数（如 `?v=2`）切换对比。不接真实数据，用写死的假数据。详细搭法见 `references/prototype-ui.md`。

## Hard Rules

- **原型必须显眼地标成临时，且放在它要验的代码旁边。** 文件名/注释/目录明确写 `PROTOTYPE` / `throwaway`，别让它看起来像正式代码。放在被验代码附近，删的时候才找得到。
- **一条命令启动，用项目现有工具链。** 不为原型引新框架、新依赖、新构建步骤。启动越简单越好。
- **不写测试、不做抽象、不加超出"能跑"的错误处理。** 这些是给要留下的代码的。原型加这些只是拖慢得到答案的速度。
- **不接真实数据库、不留持久副作用。** 状态在内存里。验的就是 DB 时才碰 DB，且用一次性的库/表。
- **删之前必须先把答案落到永久位置。** 直接删掉原型而没记下结论 = 白做。先写 commit/ADR/笔记，再删代码。
- **原型不准长进正式代码。** "这段写得还行就留着吧"是头号陷阱。要留就当成新代码，过 think 规划、按正常标准重写,不要把一次性代码偷渡进代码库。

## Gotchas

| 出过的问题 | 规则 |
| --- | --- |
| 原型没标临时，混进了正式代码库 | 文件名/注释/目录显眼标 PROTOTYPE，放被验代码旁 |
| 给原型加了测试和抽象，半天没出答案 | 速度优先，跳过测试/抽象/错误处理 |
| 接了真数据库，留下脏数据 | 状态留内存，除非验的就是 DB |
| 交互后看不出状态变了 | 每次交互后打印/显示完整状态 |
| 验完直接删，结论没记，下次重做 | 先把答案写进 commit/ADR/笔记，再删 |
| 觉得代码写得不错就留下了 | 要留就按正式标准重写，不偷渡一次性代码 |

## Output

```
question:   [要回答的那一个设计问题]
branch:     logic / ui
answer:     [验出来的结论, 一句话: 行 / 不行 / 该这样改]
captured:   [答案落点: commit hash / ADR 路径 / 笔记位置]
prototype:  deleted / 标记待删于 [路径]
```
