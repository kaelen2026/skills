---
name: zoom-out
description: "Rises one abstraction layer above a piece of code and draws a map of the relevant modules and their callers in the project's own domain vocabulary, so a solo dev quickly grasps how an unfamiliar area fits the whole. Use when the dev asks 拉高看看/整体看/这块怎么连的/zoom out/给我个全景 about code they don't know well. Not for tracing why something broke (use hunt) or planning a change (use think)."
when_to_use: "拉高看看, 拉远一点, 整体看, 全景, 这块怎么连的, 这部分怎么 fit 进去的, 不熟这块, 上升一层, zoom out, bigger picture, how does this fit, map of modules, who calls this, higher level view"
dispatch_intent: "Unfamiliar code area, need a higher-level map of modules and callers in domain vocabulary before diving in"
---

# Zoom Out: 上升一层，画出模块与调用方地图

一个人开发，整个代码库都是你写的，但半年后回到某块代码，你也成了陌生人，没有同事能用一句话告诉你"这块归谁管、谁在调它"。这个 skill 替代那句话：从手头这段代码上升一个抽象层，画出相关模块和调用方的地图，用项目自己的领域词汇说话。失败模式：埋头逐行读实现细节、用 "service"/"handler"/"util" 这类通用词糊一遍，读完还是不知道这块在整体里的位置。

不要复述代码做了什么，要回答它在系统里处于什么位置、和谁说话。

## Outcome Contract

- Outcome: 对一块不熟的代码，得到一张高一层的地图：相关模块、它们的职责、谁调用谁。
- Done when: 能用领域词汇一句话说清这块的职责，相关模块和主要调用方向都标出来了。
- Evidence: 源码路径、`grep`/`rg` 出的调用点、项目领域词汇（README / 领域表 / 既有命名）。
- Output: 一段定位 + 一张模块/调用方地图（ASCII 或要点），用领域语言，不堆实现细节。

## Core Stance

- **上升一层，别钻下一层。** 目标是"这块在哪、连着谁"，不是"这个函数第 12 行干了啥"。看到自己开始逐行解读实现，就是钻错方向了。
- **用项目的领域词汇，不用通用词。** 读 README、领域表、既有模块命名，拿项目自己的词说话（如 "订阅账期""审稿队列"），而不是 "the service""the handler"。通用词糊不出真实结构。
- **先标边界和调用方，再谈内部。** 这块的入口在哪、出口去哪、谁在上游调它、它往下游调谁。调用方地图比内部细节更能定位它。
- **轻量，不写报告。** 这是快速理解，不是架构评审。一段定位加一张要点地图就够，别铺成长文档。

## Hard Rules

- **不复述实现细节充数。** 把函数体翻译成自然语言不算地图。地图是模块之间的关系，不是某个函数的逐行解说。
- **调用方靠 grep 不靠猜。** "谁调用这个"用 `grep -rn` / `rg` 在仓库里查实，别凭印象列。漏掉一个主要调用方，整张地图就指错方向。
- **找不到领域词汇就先取。** 动手画之前先扫一眼 README / 领域表 / 模块命名取项目词汇；项目真没有统一词汇，就明说你用的是描述性命名而非项目术语。
- **不顺手改代码。** 这是理解任务。看到想改的地方记下来，路由到 think（规划）或 hunt（修 bug），不在 zoom-out 里动手。

## Gotchas

| 出过的问题 | 规则 |
| --- | --- |
| 逐行解读了实现，没画出它在哪 | 上升一层，标边界和调用方，不钻细节 |
| 用 "service"/"util" 糊了一遍 | 取项目领域词汇说话，没有就明说用描述性命名 |
| 凭印象列调用方，漏了主入口 | `grep -rn` 查实所有调用点 |
| 理解着理解着开始改代码 | 记下改动意图，路由到 think / hunt |

## Output

```
定位:     [这块的职责, 一句话, 用领域词汇]
模块:     [相关模块及各自职责]
调用方:   [谁 -> 这块 -> 谁, ASCII 图或要点]
盲点:     [没扫到或不确定的连接] 或 none
```
