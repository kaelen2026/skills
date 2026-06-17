---
name: scope-guard
description: "Draws the line on a pile of wants: decides what this round will NOT do, cuts the gold-plating, and names the MVP boundary so a solo dev with limited time ships something real. Use when the dev has a sprawling wishlist and asks 砍一下/这次做到哪/范围/别做太多/最小做什么/what's the MVP/where do I draw the line/what to cut. Not for producing the how once scope is set (use think)."
when_to_use: "砍一下, 砍掉, 这次做到哪, 范围, 范围太大, 别做太多, 做不完, 时间不够, 最小做什么, 先做哪些, 这个要不要, 镀金, 过度设计, scope, scope creep, MVP, what to cut, where do I draw the line, cut the scope, too ambitious, do less, smallest version"
dispatch_intent: "A sprawling set of wants to bound: decide what NOT to do this round, cut gold-plating, name the MVP boundary line"
---

# Scope-Guard: 决定这次不做什么，把边界画出来

一个人开发，时间是最硬的约束，最大的浪费不是写错代码，是把精力花在没人要、可以晚做、或本就该砍掉的东西上。这个 skill 只做一件事：对着一坨想做的需求，画一条范围线，明确这次不做什么。失败模式：把每个想法都收进范围（范围只增不减），或者偷偷给一个简单需求镀金（"顺便把它做得通用一点"），结果该上线的功能永远差一截。

**输出是一条范围线，不是实现方案。** 这里不回答"怎么做"，只回答"做到哪、哪些这次不碰"。怎么做交给 think。

## Outcome Contract

- Outcome: 一坨需求被切成"这次做 / 这次不做 / 以后再说"，边界明确到不必再纠结。
- Done when: In / Out / Later 三栏都填了，每个 Out 有一句理由，MVP 那条线说清"砍到这里仍然是个能用、能演示的东西"。
- Evidence: 用户真实约束（时间、动力、是否商业化、维护成本）、当前已有什么（grep 确认别把已有的排进待做）、相关时的 PRD / issue。
- Output: 一张 In / Out / Later 表 + 一句 MVP 边界声明。不含实现步骤。

## Core Stance

- **默认在线外。** 每个需求要被明确论证才进 In。"顺便""既然都做了""万一以后要"不是进 In 的理由，是进 Later 或 Out 的信号。
- **砍镀金。** 通用化、配置化、可扩展、支持多种 X，在只有一个 X 的当下都是镀金。砍到"刚好满足当前真实用例"，需要第二个 X 时再说。
- **MVP 是能演示的最小完整体，不是半成品。** 砍到的那条线，上线后仍是用户能用、能演示的东西。砍成"少了一半没法跑"不是 MVP，是没做完。
- **Later 要有触发条件，不是垃圾桶。** 放进 Later 的东西写清"什么情况下重新捡起来"（有第 N 个用户要、商业化了、第二个用例出现）。没有触发条件的 Later 等于 Out，就直接 Out。
- **对着用户真实约束砍，不是泛泛取舍。** 时间多少、是不是要赚钱、愿不愿长期维护，决定线画在哪。同一坨需求，业余练手和要养活自己，边界完全不同。

## Pre-flight

- 先 grep / 读代码确认哪些"需求"其实已经能用了，别把已有功能排进待做。"其实已经能用"被误判成缺口是最常见的浪费。
- 问清这次的真实约束：能投多少时间、这东西要不要赚钱、愿不愿长期维护。约束没问清，边界就是凭感觉画的。
- 若某需求与项目文档里的刻意取舍（review-first、极简、不做某类功能）冲突，点名冲突，不要默默把它收进范围。

## Hard Rules

- **范围只减不增是默认方向。** 这个 skill 的产出几乎总是比输入小。如果跑完范围变大了，要么是输入漏了真需求，要么是没在砍。
- **不出实现方案。** 不写"怎么做""用什么库""分几步"。那是 think 的活。这里越界给方案，就把"该不该做"和"怎么做"两个决策搅在一起了。
- **每个 Out 一句理由。** 砍掉的东西要说清为什么这次不做（没人要 / 可以晚做 / 镀金 / 维护成本高于收益），否则砍了也会被重新捡回来。
- **MVP 线必须仍可演示。** 画完线问一句：砍到这里，还能给人演示一个完整行为吗？不能就是砍过头了，往回收一点。
- **Later 必须带触发条件。** 没有"什么时候重新考虑"的 Later 一律改成 Out。模糊的"以后再说"是范围蔓延的入口。
- **不替用户做商业判断。** 涉及"这个功能值不值得做"的价值判断，框出选项和取舍交用户定，别擅自把一个可能赚钱的方向砍掉。

## Gotchas

| 出过的问题 | 规则 |
|---|---|
| 每个想法都收进 In，范围只增不减 | 默认在线外，进 In 要被论证 |
| 给只有一个用例的需求做了通用化 | 砍镀金，需要第二个用例再说 |
| 砍成了半成品，没法演示 | MVP 线必须仍可演示一个完整行为 |
| Later 成了不会再看的垃圾桶 | Later 必须带触发条件，否则直接 Out |
| 把已经能用的功能排进了待做 | 先 grep 确认现状 |
| 顺手给出了"怎么做"的方案 | 不出实现方案，那是 think |
| 不问时间和是否商业化就画线 | 对着真实约束砍 |
| 砍掉了一个可能赚钱的方向没问用户 | 价值判断交用户，别擅自砍 |

## Output

```
范围线

In（这次做）
- [项]：为什么是现在的必需

Out（这次不做）
- [项]：砍的理由（没人要 / 可晚做 / 镀金 / 维护成本高）

Later（以后再说）
- [项]：触发条件，什么情况下重新捡起来

MVP 边界：砍到 ___ 这条线，它仍然是一个 ___ 能用并能演示 ___ 的东西。
```

收尾这句：

```
范围已定。要把 In 的部分变成可执行方案，跑 /think；要把它拆成可独立上线的小步，跑 /ship-small。
```
