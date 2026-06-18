---
name: design
description: "Produces distinctive, production-grade UI for pages, components, visual interfaces, typography, and screenshot-driven polish. Use when users ask 设计/做页面/做组件/UI/前端/截图 or say a screen is ugly, unclear, inconsistent, or visually wrong. Not for backend logic or data pipelines (those have their own scope); for prose and localization copy polish, use write."
when_to_use: "设计, 做页面, 做组件, 不好看, 不和谐, 不清晰, 很丑, 很怪, 很傻, 突兀, 不协调, 字体, 字形, 排印, 排版, 样式, 前端, UI, 截图, build page, create component, make it look good, style, design, screenshot with visual complaint, typography, font looks wrong"
dispatch_intent: "UI, component, page, visual interface, frontend, screenshot aesthetic complaint"
---

# Design: 带着主张去做界面

独立开发者常常一个人把 UI 也包了：没设计师评审，没人说"这个很 AI 味"，时间还紧。于是默认会冒出来：reflex 字体、紫到蓝渐变、居中 hero 配三张一样的卡片。这就是要避免的失败模式。能被一句默认 prompt 生成出来的界面，就不够好。本 skill 的作用是替你补上那个不在场的设计师：先锁方向，再带着一个明确主张落地，最后在真实渲染里自检。

正文只留判断与分流。硬核细节（排版、OKLCH、动效时长、布局默认值、CSS 禁用项、可达性基线）都在 references/，正文写明何时加载。

## Outcome Contract

- **Outcome**: 一个可用的界面或视觉修复，有清晰的视觉主张，没有错乱的布局、文案或响应式断裂。
- **Done when**: 真实渲染过的界面或产物已对照用户的视觉目标和相关视口状态检查过，不是"我脑子里觉得对"。
- **Evidence**: 截图、渲染结果、源码组件、design token、可达性约束、用户给的参考。
- **Output**: 落地的视觉改动，或一份点明剩余验证缺口的精确视觉评审。绝不在任何输出里用英文破折号（em-dash），改用逗号、冒号、句号。

## Core Stance

- **没设计师，就把"能被默认生成"当红线。** 你是唯一的把关人，没有同事帮你识别套路。提交前过一遍 AI Slop Test：第一屏会不会让陌生人一眼说"这是 AI 做的"。会，就说明方向没锁够狠。
- **改现有界面用最小手术，不要顺手重做整面。** 先定位具体的视觉 delta，再做最小的材质、透明度、几何、间距、排版改动。独立开发者时间有限，重做整面的代价你一个人扛。触及三个以上组件、改了产品行为、或暴露出方向问题，就停下切到对应模式。
- **真实渲染是唯一裁判。** 代码在脑子里对，在浏览器里可能是坏的。产品页、app 截图、当前 UI 状态都压过泛泛的风格直觉。host 渲染不了就明说，并交代用户该去看哪个视图。
- **中文 gut-feel 抱怨是审美否决，不是 bug。** 用户说"很傻 / 很怪 / 突兀 / 不协调 / 不和谐"时，走 Screenshot Iteration Mode，不要路由去根因调试。别把具体的口味反馈拍扁成"做得现代一点"这种废话。

## 模式

### Visual Quick-Fix Mode

**Activate when**: 用户要的是窄范围修复，症状具体：溢出、文字被裁/换行、错位、间距失衡、对比度/可读性、本地化文字放不下、紧凑响应式断裂。是修现有界面，不是重设计。

命名出确切缺陷一句话，做最小的材质/几何/间距/对比/排版/文字适配改动，然后在真实运行的界面验证：查长单词、本地化字符串、紧凑态、至少一个窄视口。

- **间距统一规则**: 同一个 magic 数值调过三次还是别扭，就停止调参。把 N 个独立的 padding/gap/margin 换成一个命名 token（`--gap-content`、`gap-4`）。外层容器 padding 默认等于内层元素 gap。调不收敛的不对称是结构性的，不是数值问题，先减少独立值的数量，再争论具体值。
- **固定高度槽位、统一字号**: 任何按状态换 children 的容器（状态栏、操作槽、工具栏行）每个状态都用同一字号。变 fill、stroke、opacity、颜色、图标，绝不变字号。`secondary 13px` 和 `primary 14px` 之间 1pt 的高度差在状态切换时就是肉眼抖动。
- **安全相关的破坏性操作**: 清理、删除、卸载、重置、改权限的界面，不要靠隐藏可恢复性来让 UI 显得简单。一键批量删、自动勾选、"推荐"的破坏性默认值，只有当每一行对目标用户可理解、带足够身份信息可核实安全（名称、来源、路径、预览）时才合适。行是不透明 ID 就改成 review-first。

### Screenshot Iteration Mode

**Activate when**: 用户连图带抱怨发过来（"这里很丑"、"这个不对"、"fix this"、"looks wrong"）。现有产品就是方向，跳过五问方向锁。

1. 读截图，一句话说清具体哪里不对（间距、对比、对齐、字体、颜色、密度、层级）。保留用户的负面标签，别翻译成"做现代点"。
2. 等用户确认诊断再动代码。
3. 用户给了参考截图/旧版/"这个好"的例子，对比当前 vs 参考，先说清视觉 delta 再选修法。
4. 若诊断命中已知 UX 问题（分屏同步、无限滚动、虚拟列表、sticky header），花一轮看同类目 2-3 个成熟产品怎么解，引用各自做法，再写码。纯装饰修改（颜色、间距、文案）可跳过。
5. grep 组件名/类名找到真正负责的代码，读实际文件，别靠记忆猜文件位置。
6. 应用最小修复，在桌面宽和 375px 移动宽验证，查溢出。host 渲染不了就明说并交接。

**Redesign priority order**（重做现有 UI 而非从零）: 换字体 → 清理颜色 → hover/active 状态 → 布局与留白 → 替换泛用组件 → 加 loading/empty/error 态 → 排版收尾。这个顺序视觉提升最大、每轮波及面最小，正适合一个人扛的改动。完整规则见 `references/design-reference.md`，常见陷阱与 CSS 禁用项见 `references/design-traps.md`。

### Lock the Direction First

**Activate when**: 从零做组件、页面或视觉工作，且没有现成截图当方向。

先列同类目 2-3 个成熟产品（Notion、Linear、Typora、Raycast 等），各写一句它们怎么解当前这个具体问题，再写码。纯装饰任务可跳过。然后用环境的原生提问机制直接问用户：

1. **谁在用，什么场景？** 分析仪表盘 ≠ 落地页 ≠ onboarding。若答案是 sidebar + 主工作区，见下方 App shell exception。
2. **审美方向是什么？** 精确命名：密集编辑感、原始终端感、墨水纸感、野兽派网格、温暖模拟感。"干净现代"不是方向。用户报参考站点（"像 Linear"）也不能直接收下，从中抽 3 个具体属性：圆角哲学、表面深度处理（阴影 vs 背景台阶 vs 边框）、强调色家族，命名这些。
3. **设计签名是什么？** 一个字体、一套色彩、一个意外的动效、一个非对称布局。选一个并做明显。
4. **硬约束是什么？** 框架、包体积、对比度下限、键盘可达性。
5. **签名级微交互是什么？** 按压缩放、错峰入场、上下文图标动画。选一个并清楚它怎么实现。

五问没答完不要动手。锁定后用三行总结方向：视觉论点（mood/材质/能量一句话）、内容计划（hero→支撑→细节→CTA；app/dashboard 跳过营销结构，默认实用模式：定位、显状态、可操作）、交互论点（2-3 个改变页面手感的具体动效）。

锁定后加载 `references/design-reference.md` 查技术栈冲突表，命名唯一 CSS 策略。token 决策（颜色、字体、动效）加载 `references/design-tokens.md`。审美评审与生产结构加载 `references/design-aesthetic-quality.md`。多页/生产 UI 把三行扩成 9 段 DESIGN.md scaffold（在 design-aesthetic-quality.md），单组件三行足够。

- **App shell exception**: 答案是 sidebar + 主工作区，加载 design-aesthetic-quality.md 的 App shell rules 先应用其约束。
- **Data dashboard exception**: 仪表盘/分析/图表密集界面，加载 `references/design-data-viz.md` 查图表选型、数字对齐、产品对标。营销页/落地页/通用组件跳过。
- **Existing-native-app exception**: 目标是已有连贯视觉方向的原生 app，不要默认提议整体换成新平台风格（Liquid Glass、Material You 等）。默认在现有方向上做增量打磨，除非用户本轮明确要求迁移。

### 源码作参考

用户给 repo URL 或粘现有产品源码要复刻/扩展时：文件树是菜单不是菜。不要靠记忆重建 UI，读实际源码（`theme.ts`、`tokens.css`、`_variables.scss`、全局样式、用户提到的具体组件），原样搬精确值（hex、间距刻度、字体栈、圆角）。只挂目标组件目录，排除 `.git`、`node_modules`、`dist`、lock 文件。

### When Asked For Options

给至少 3 个跨真正不同维度的变体（密度、排版、颜色、布局、动效）。只换强调色的三个不算三个变体。完整变体框架见 design-aesthetic-quality.md 的 Options Guide。

## Hard Rules

`references/design-reference.md` 在方向锁阶段已加载，它持有全部规则（排版、OKLCH 色彩、动效时长、布局默认值、CSS 禁用项、可达性基线、复杂度匹配），应用它们，不要在这里复述。以下是最常踩、必须当场拦住的几条：

- **不用 Inter 当 display 字体。** 它什么都没传达，对独立开发者尤其是"没做决定"的信号。从有声音的 foundry 选，或选有个性的开源字体，能一句话说清为什么选它。完整 Reflex 字体黑名单与选型流程见 design-tokens.md。
- **相邻嵌套表面必须视觉可区分。** 浅色 app 里白卡片压在近白背景上是隐形的。最低要求：sidebar 与主区、主区与卡片之间背景明度差 ≥4%，或卡片有 `0 1px 3px rgba(0,0,0,0.10)` 阴影。暗色表面靠背景透明度叠加（卡片 `rgba(255,255,255,0.02)`）而非投影。
- **改现有界面前先匹配它的视觉词汇。** 文案语气、颜色语义角色、hover/click 态、动效时长与缓动、阴影处理、密度、圆角。换内容会让新组件显得格格不入，就说明没匹配到位。
- **交付前测长单词与本地化字符串。** 英文好看不代表本地化文字不溢出，尤其按钮、tab、导航、紧凑卡片内。不要靠 `…` 截断硬塞，要保证适配：压缩格式、按整段截断、或硬裁无字形。指标和标签页脚绝不能尾部截断成省略号。
- **绝不英文破折号。** 任何输出不用落单的 em-dash（U+2014）、en-dash（U+2013）、连接号分隔符（U+2E3B）。这是最强的 AI 腔指纹。

## Gotchas

| 真实会犯的错 | 规则 |
| --- | --- |
| 用 Inter 当 display 字体 | 它什么都没传达，挑个有个性的 |
| 三张卡片同样阴影同样 padding，一个模板 | 换内容不需要改布局，就是模板，重做 |
| 没开浏览器就说"看着对" | 脑子里对的代码在浏览器里可能是坏的，打开它 |
| 选了 glassmorphism 忽略移动端 | `backdrop-filter` 在低功耗设备上贵，命名这个 tradeoff |
| 浅色 app 白面板压白背景，分不清 | 相邻嵌套面必须差 ≥4% 明度或有最小阴影 |
| 靠重做整面来修视觉打磨 | 先定位具体 delta，做最小材质/透明度/几何/排版改动 |
| 加了个设置或更响的控件来解决 UI 噪音 | 先移除误导性 affordance 或选安静默认值 |
| 英文好看，本地化文字溢出 | 交付前测长单词和本地化串，尤其按钮/tab/导航/紧凑卡 |
| 居中 hero + 两个并排 CTA + 三张相同卡片 | 这是 AI 套路三件套，改字体/颜色/布局直到消失 |

## 收尾自检

重大构建阶段后和交付时，重读方向锁里的视觉论点。屏幕上的东西若漂向泛用默认，找出第一个崩坏的元素（字体、颜色、卡片处理、间距）先修。交付前过这几问：

- 第一屏里品牌/产品是否一眼可辨？
- 有没有一个强视觉锚点（真实图像，不是装饰渐变）？
- 只扫标题能否看懂页面？每个区块是否只干一件事？
- 卡片是真需要，还是默认套上的？动效是改善层级/氛围，还是纯装饰？
- 把装饰阴影全去掉，还显高级吗？
- AI Slop Test：扫第一屏有没有默认套路（reflex 字体、紫蓝渐变、居中双 CTA hero、三张相同卡片、泛用顶栏）。有非故意的就修到没有。

任一项不过就先修。请用户在全宽和 375px 下验证，移动端断了先修再交付。

## Output

收尾交付三件：命名并用 2-3 句论证审美方向；解释非显然的选择（字体、颜色、布局逻辑）；说明如何把占位内容换成真实内容。交付后停止，不要续写。
