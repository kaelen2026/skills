# Design Reference

方向锁阶段加载。它持有全部硬规则。一个人做 UI 时没人替你记这些约束，把它当查找表用，命中哪节读哪节。

## 技术栈冲突表

以下组合会产生静默失败或不连贯输出。永远不要混用：

| 不要混用 | 原因 |
|---|---|
| 同一元素上 Tailwind + CSS Modules | 优先级冲突，级联不可预测 |
| 同一元素上 Framer Motion + CSS transition | 同属性双重动画导致 jank |
| styled-components/emotion + Tailwind | 两套 class 系统抢同一个 DOM 节点 |
| 一个项目里 Heroicons + Lucide + Font Awesome | 视觉不一致、尺寸错配、包膨胀 |
| 多个 Google Font 家族都当 display 字体 | 互相抵消彼此的个性 |
| Glassmorphism backdrop-filter + 实线 `border: 1px solid` | 实线边框击碎分层深度的错觉 |
| 深色背景 + `#ffffff` 满透明度文字 | 太刺眼，用 `rgba(255,255,255,0.85)` 或 `#f0f0f0` |
| Tailwind v4 `@theme` + 动态拼接的 class 名 | `@theme` token JIT 生成 utility class；class 名由变量拼出或不在扫描源里就会被 purge，样式静默消失。改用静态 class 名、加 `safelist`、或在 `:root` + `extend.colors` 定义自定义色 |

写第一个组件前，命名项目唯一的 CSS 策略：只用 Tailwind、只用 CSS Modules、或只用 CSS-in-JS。不要中途漂移。

## 常见默认陷阱

提交前检查以下有没有无意中混进来：

- 白底上紫色或蓝色渐变当 hero 背景
- 三段式 hero：大标题、一行副文、两个并排 CTA
- 一排卡片，圆角、投影、padding 全相同
- 顶栏：logo 左、链接中、主操作最右
- 区块在白和 `#f9f9f9` 之间交替
- 居中图标/插画压在标题压在段落上
- 四列等权页脚

这些只要是有意为之服务设计就可以出现，绝不能作为默认冒出来。

最终测试：换成完全不同的内容，布局不改还说得通，那你做的是模板不是设计，重做。

## 内容真实性

看着像真但不是真的占位文案，用户一读就破功。交付前应用这些规则。

**示例数据：**
- 不用泛用人名：不要 John Doe、Jane Smith、Alex Johnson，或任何读起来像填充的"名+姓"。用有文化多样性和具体感的名字（Priya Mehta、Lars Eriksson、Nia Okafor）。
- 不用泛用公司名：不要 Acme Corp、Nexus、SmartFlow、TechCorp、Initech。挑带领域感的（Meridian Logistics、Hokkaido Ceramics、Vantage Bioworks）。
- 不用 Lorem Ipsum。写匹配版面阅读层级的简短真文案。
- 数据样本里不用整数。`99.99%` 在线率、`50%` 转化、`$100.00` MRR 都像合成的。用有机值：`99.94%`、`47.2%`、`$99.00`。
- 多个头像实例不能共用同一张图；多张博客/活动卡片不能共用同一日期。

**UI 文案：**
- 所有标题用 sentence case。Title Case On Every Heading 是正文里最常见的 AI 破绽。
- 成功态去掉感叹号（"Saved!"→"Saved"，"Done!"→"Done"）。`!` 留给真正的紧急。
- 错误消息绝不以 "Oops!" 开头，读起来居高临下。
- 错误消息不用被动语态（"Something went wrong"→"We couldn't load your data. Try refreshing."）。
- hero 文案、CTA、功能描述里禁用的 AI 营销词：Elevate、Seamless、Unleash、Delve、Tapestry、Game-changer、Next-Gen、"In the world of..."。这些词对产品什么都没说，改成具体价值。

## 占位优于劣质仿造

图标、图像、组件不可用时：用占位。高保真设计里，带标签的占位永远好过对真品的劣质模仿。例：hero 图用灰矩形，缺 logo 用 monogram 字标，未设计组件用虚线边框。

绝不用 inline SVG 画插画类图像。SVG 只用于图标和几何形。照片、插画、产品图用占位并请用户提供真实素材。

## 生产质量基线

交付前检查。这些不是审美选择，是不可妥协项。

> 把下面各节当工艺细节而非默认值。只在服务于已锁定的视觉方向时应用。去掉某个细节后界面手感不变，就别加。

### 可达性

- 纯图标按钮需要 `aria-label`
- 操作用 `<button>`，导航用 `<a>`，不要 `<div onClick>`
- 图像需要 `alt`（装饰性用 `alt=""`）
- 可见焦点态：`focus-visible:ring-*` 或等效；绝不在没有替代的情况下 `outline: none`

### 动画

- 尊重 `prefers-reduced-motion`：设置开启时禁用或减弱动画
- 只动 `transform`/`opacity`（合成器友好，不触发布局抖动）
- 绝不 `transition: all`；显式列出属性
- 可中断动画：交互态变化（hover、toggle、open/close）优先 CSS transition，因为能中途重定向；keyframe 动画留给只跑一次的分阶段序列（如错峰入场）
- 错峰入场：把内容拆成语义块，约 100ms 延迟；标题拆成单词约 80ms；典型入场用 `opacity: 0→1`、`translateY(12px)→0`、`blur(4px)→0`
- 克制的退场：用小的固定 `translateY(-12px)` 而非整高，时长约 150ms `ease-in`，比入场短而软
- 上下文图标切换：`scale: 0.25→1`、`opacity: 0→1`、`blur: 4px→0`。有 spring 库：`{ type: "spring", duration: 0.3, bounce: 0 }`。没有：两个图标都留在 DOM（一个 absolute），用 `cubic-bezier(0.2, 0, 0, 1)` 交叉淡入
- 按压缩放：按钮 active/press 时 `scale(0.96)`，用 CSS transition 以便可中断；加 `static` prop 在动效干扰时禁用
- 首屏加载守卫：toggle/tab/图标切换的 animated presence wrapper 用 `initial={false}` 防止首次渲染就播入场；有意的页面入场序列不要用它

### 性能

- transition 精确性：绝不 `transition: all`；列出确切属性（`transition-property: scale, opacity`）。Tailwind 的 `transition-transform` 覆盖 `transform, translate, scale, rotate`；混合属性用 `transition-[scale,opacity,filter]`
- GPU 合成：`will-change` 只用于 `transform`、`opacity`、`filter`。绝不 `will-change: all`。注意到首帧卡顿才加，不要预防式地给每个元素加
- 图像：显式 `width` 和 `height`（防布局抖动）
- 折叠以下图像：`loading="lazy"`
- 关键字体：`font-display: swap`

### 触控与移动

- `touch-action: manipulation`（消除双击缩放延迟）
- 全出血布局：刘海设备用 `env(safe-area-inset-*)`
- modal 和 drawer：`overscroll-behavior: contain`
- hover 守卫：交互 hover 态用 `@media(hover:hover)` 包住，只在指针设备生效。Tailwind：`[@media(hover:hover)]:hover:bg-...`。否则移动端点过的元素会保持永久 hover 态直到点别处

### 排版细节

- 文本换行：标题和短文本块（Chromium ≤6 行，Firefox ≤10 行）用 `text-wrap: balance`；正文段落和长文本用 `text-wrap: pretty`；代码块和预格式化文本保持默认
- 字体平滑：在根布局上应用一次 `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale`（仅 macOS）
- 等宽数字：计数器、计时器、价格、数字列、任何动态更新的数字用 `font-variant-numeric: tabular-nums`
- 字距随字号缩放：display 字体需要负字距才显得"工程化"而非被拉伸。两档：display（32px+）约 -0.022em，中段（20-28px）约 -0.012em，16px 及以下正常。适用于任何 display-weight 字体。大标题用正字距永远是错的

### 表面

- 同心圆角：`outerRadius = innerRadius + padding`，让嵌套圆角显得有意而非机械；padding 超 `24px` 就把各层当独立表面分别选圆角
- 视觉对齐：靠眼睛微调图标而非纯数学，让按钮显得居中；带文字和图标的按钮在图标侧 padding 略小（`pl-4 pr-3.5`）；播放三角和非对称图标向重的一侧偏 `1px`-`2px`，或直接改 SVG
- 阴影优于边框：卡片、按钮、抬升元素用分层 `box-shadow` 做深度，让表面像被托起而非被框住；`border` 留给分隔线、表格单元、布局分隔（主要适用浅色模式；深色见下方深色表面层级规则）
- 图像描边：加细微内描边让图像自带深度而不改布局尺寸：`outline: 1px solid rgba(0,0,0,0.1); outline-offset: -1px`（浅）或 `rgba(255,255,255,0.1)`（暗）
- 最小命中区：每个交互目标至少 40×40px；可见元素更小时用居中伪元素扩展，两个交互元素的命中区绝不重叠
- 多卡对齐：卡片组里所有 CTA 按钮底对齐，避免高度差造成参差的操作行。定价/对比卡里特性列表项跨列对齐到共享 Y 原点。并排面板（评价、套餐、特性拆解）里标题、描述、价格、按钮跨行共享基线。区块上下 padding 不必对称：视觉平衡常需要底 padding 比顶大 20-25%。正文段落宽度约束在 65 字符（ch）
- 浅色 app 表面层级：相邻嵌套表面必须可区分。最低：sidebar 与主区、主区与卡片之间背景明度差 ≥4%，或抬升卡片有 `0 1px 3px rgba(0,0,0,0.10)` 阴影。近白背景上白卡片配 `box-shadow: 0 1px 2px rgba(0,0,0,0.05)` 是隐形的，那不是深度是噪音
- 深色表面层级：页面画布是近黑实色（`#08090a`）。抬升靠在画布上叠半透明白：卡片 `rgba(255,255,255,0.02)`、抬升面 `0.04`、突出面板 `0.05`。边框同理：`rgba(255,255,255,0.05)` 细微，`0.08` 标准。传统投影（暗压暗）几乎不可见，背景透明度的明度台阶才是深色表面的主深度线索
- 圆角系统：方向锁阶段定一个命名圆角刻度，别临时挑值。最小 3-4 档（`{4px, 8px, 12px, pill}`），丰富的 6-8 档。重点是在第一个组件前就承诺一组命名值，让所有表面说同一种空间语言

### 给现有 UI 加东西

扩展现有界面时，先花时间理解它的视觉词汇。写第一行新代码前匹配以下全部：

- 文案语气和阅读层级（技术？随意？利落？）
- 颜色调色板和语义颜色角色（哪个 token 表示 danger/success/muted）
- hover 和 click 态：缩放、变色、下划线、背景填充
- 动画风格：时长、缓动、是否回弹还是严格 ease-out
- 阴影和卡片处理：哪些表面抬升、哪些齐平
- 布局密度和留白节奏
- 圆角选择以及按钮是 pill、方角还是某个固定值

换内容会让新组件显得格格不入，就说明词汇没匹配到位。

### 响应式与屏幕验证

- 验证渲染过的界面，不是类型检查或读 CSS。多个回归（提前换行、孤立分隔点、表格溢出）在源码里看不见，只在渲染里现形。在手机（375px，按钮另加 320px）和桌面（1280px）截图，每个上线 locale 都截
- 行寡行：1-2 词的末行通过精简文案让块重新平衡来消除，不要加 `max-width` 帽（比容器窄的帽会提前换行、右侧留空，读起来像过早断行）。客观检测：标记任何末行宽度低于最宽行约 13% 的文本块，肉眼会漏，嵌套 `<code>` 会躲过 grep
- 移动端 CTA 静止态：自然宽度，左对齐到周围文本边，高度不变。居中读起来像漂浮，全宽 `flex: 1` 读起来重，为缓解"太满"降按钮高度是把宽度问题当高度问题处理
- 间距是系统不是逐 gap 值。区块间距跑成一条响应式阶梯；页面读起来太空或太挤时，用单一系数跨所有断点缩放整组而非调单个 gap。调不掉的不对称是结构性的
- 长文档表面保持轻：无边框的上一篇/下一篇文本翻页器（不是带边框卡片），sidebar 激活态用细导轨而非填充块，构建期零运行时 JS 的代码高亮（烤进静态 span，纯代码留作源）优于运行时高亮器

## 数据可视化表面

仪表盘、分析视图、图表密集界面或数字密集显示，加载 `references/design-data-viz.md`。它持有仪表盘默认值、图表选型、数字对齐、产品对标提取。

## 颜色与字体

颜色系统（OKLCH）、Theme Matrix、Reflex 字体黑名单、选型流程、CJK 多语言排版，都在 `references/design-tokens.md`。

## CSS 模式级绝对禁用

完整禁用表与重写方案在 `references/design-traps.md`（含 AI Slop Test、内容真实性精简版）。方向锁后写第一个组件前过一遍。

## 参考站点品牌预设（awesome-design-md）

`VoltAgent/awesome-design-md` 维护 66+ 从真实品牌站点抽取的 DESIGN.md。`npx getdesign@latest add <brand>` 把文件落到项目根，给 agent 具体 token 值去拆解，而非凭记忆推理。

**使用规则**：绝不自动运行命令。方向锁时作为选项提出，仅在用户明确批准后运行，结果当种子拆解材料而非成品方向。

**目录里的品牌**（用户报参考时识别）：

| 类目 | 品牌 |
|---|---|
| AI & LLM | Claude, Cohere, ElevenLabs, Mistral, Ollama, Replicate, RunwayML, Together AI, xAI |
| Dev Tools & IDEs | Cursor, Expo, Lovable, Raycast, Superhuman, Vercel, Warp |
| Backend/DB/DevOps | ClickHouse, Composio, HashiCorp, MongoDB, PostHog, Sanity, Sentry, Supabase |
| Productivity & SaaS | Cal.com, Intercom, Linear, Mintlify, Notion, Resend, Zapier |
| Design & Creative | Airtable, Clay, Figma, Framer, Miro, Webflow |
| Fintech & Crypto | Binance, Coinbase, Kraken, Revolut, Stripe, Wise |
| E-commerce & Retail | Airbnb, Meta, Nike, Shopify |
| Media & Consumer | Apple, IBM, NVIDIA, Pinterest, PlayStation, SpaceX, Spotify, Uber |
| Automotive | BMW, Bugatti, Ferrari, Lamborghini, Tesla |

**冲突解决**：本 skill 的规则永远胜出。预设推荐黑名单字体（如 Inter 当 display），丢弃并走选型流程。预设提议禁用表里的模式（如紫蓝渐变），丢弃。在交付总结里说明这个覆盖。

来源：[github.com/VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)

## 参考材料优先级

参考 UI 同时有源码和截图时：读源码。源文件含精确 token 值，截图要靠猜。从写出来的重建，不是从看到的。

只有 URL 时：抓取只返回提取的文本，无布局信息。视觉参考（"做得像 X"）请用户给截图，不要从剥离的 HTML 推断视觉设计。
