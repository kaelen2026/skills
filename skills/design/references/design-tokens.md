# Design Tokens: 颜色与字体

token 决策（颜色、字体）时加载。动效规则在 [design-reference.md](./design-reference.md) 的动画与性能两节。本文件只管颜色和字体。

没设计师时，颜色和字体是最容易暴露"没做决定"的两处。这两样定下来，界面立刻有主张。

## 颜色系统：OKLCH 规则

- 用 OKLCH 而非 HSL。OKLCH 感知均匀：相等的数值变化在整个色谱上产生相等的感知变化。
- 明度接近极端时降低 chroma。85% 明度下 chroma 约 0.08 就够，推到 0.15 显得刺眼。15% 明度下同样收紧。
- 把中性色朝品牌色相微调，chroma 取 0.005 到 0.01。即使这么微弱也可感知，并营造潜意识的协调。
- 60-30-10 是视觉权重不是像素数：60% 中性/表面，30% 次要文字和边框，10% 强调。
- 绝不在彩色背景上用灰色文字。用背景色相降明度的一档代替。

## Theme Matrix

按受众和场景刻意选浅色或深色，两者都不是默认。

| 场景 | 方向 | 原因 |
| --- | --- | --- |
| 交易/分析仪表盘、夜班使用 | 深 | 数据密度高；长时段减少眩光 |
| 儿童阅读/学习 app | 浅 | 友好、低疲劳 |
| 企业 SRE/可观测性工具 | 深 | 运维场景；暗表面在低光机房一眼可读 |
| 周末规划、菜谱、日记 | 浅 | 日间环境光使用；浅色随意亲和 |
| 音乐播放器/媒体浏览 | 深 | 内容前置；暗表面后退让媒体凸显 |
| 医院/临床患者门户 | 浅 | 信任和易读至上；临床联想偏浅 |
| 复古/手工品牌站 | 奶油/暖浅 | 深色与模拟材质参照冲突 |

场景不明显时默认浅色。场景暗示双模式时先发浅色，再叠深色 token。

## Reflex 字体黑名单

这些字体主导训练数据，用它们等于宣告"没做决定"，对独立开发者尤其要警惕（你没有设计师拦你）。禁用的是 reflex 式地拿来当 display 面；有理由的产品 UI 用法（如密集数据表用 Inter）在说明理由后允许。此表不穷尽，任何无理由的 reflex 用法都算。

Reject: Inter, DM Sans, DM Serif Display, DM Serif Text, Outfit, Plus Jakarta Sans, Instrument Sans, Instrument Serif, Space Grotesk, Space Mono, IBM Plex Sans, IBM Plex Serif, IBM Plex Mono, Syne, Fraunces, Newsreader, Lora, Crimson Pro, Crimson Text, Playfair Display, Cormorant, Cormorant Garamond.

## 字体选型流程

1. 写三个词描述品牌（如"精确、极简、快"）。
2. 说出你会反射性伸手去拿的三个字体。
3. 全部拒绝。
4. 从有名 foundry（Klim, Commercial Type, Colophon, Grilli Type, OH no Type, Village 等）或有清晰个性的开源字体里挑，能一句话说清为什么是这个字体而非别的。

## 排版细节

- 标题和短文本块用 `text-wrap: balance`；正文段落用 `text-wrap: pretty`
- 根布局上应用一次 `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale`（仅 macOS）
- 计数器、计时器、价格、数字列用 `font-variant-numeric: tabular-nums`
- 字距：display（32px+）约 -0.022em，中段（20-28px）约 -0.012em，16px 及以下正常

## CJK 与多语言排版

界面混排中日韩与拉丁时，纯拉丁字体规则会静默破坏 CJK 文字。交付前应用：

- **拉丁面在前，系统 CJK 面在后**，让每种文字用正确字形：`font-family: -apple-system, "SF Pro Text", "PingFang SC", "Noto Sans SC", sans-serif;`。拉丁段用拉丁面，汉字落到 CJK 面。
- **CJK 正文比拉丁多给行高**：阅读约 1.7-1.8。密集汉字需要比拉丁正文 1.4-1.5 更多的垂直空间。
- **用 `lang="zh"` / `lang="ja"` / `lang="en"` 标注文字段**，让浏览器选对字体和断行。混语段落不标会断得很糟。
- **衬线阅读模式需要显式 CJK 衬线 fallback。** 多数拉丁"阅读衬线"webfont 不带 CJK 字形，衬线开关会静默把中文退回 sans 看着像坏了。配对：`"Newsreader", "Songti SC", "Noto Serif SC", serif`。
- **不要给 CJK 段加负字距。** 上面的 display 字距规则是拉丁专用；收紧汉字字距会挤字形、读起来像渲染 bug。把字距 scope 到 `lang="en"` 段。
