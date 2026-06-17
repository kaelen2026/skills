# Design Traps 与反模式

提交前过一遍。没人替你 review 时，这一节就是你的对抗式自审：这些套路在 AI 生成界面里出现得最频繁，每条都有具体重写方案。

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

最终测试：换成完全不同的内容布局不改还说得通，那是模板不是设计，重做。

## CSS 模式级绝对禁用

这些模式出现在多数 AI 生成界面里，每条都有具体重写。不穷尽，任何当无脑默认而非有意选择的 CSS 模式都属于同类。

| 模式 | 原因 | 重写 |
|---|---|---|
| 宽于 1px 的 `border-left`/`border-right` 当区块强调 | admin/dashboard UI 里最被滥用的"设计点"，超过 hairline 就像出了错 | 改元素结构：彩色圆点、短横线、背景色块、或字重变化 |
| `background-clip: text` 渐变文字 | 装饰而非有意义；顶级 AI 破绽；打印和高对比模式下不可读 | 用实色品牌色、调过的中性色、或字重强调 |
| `backdrop-filter: blur` 玻璃拟态当默认卡片表面 | 低功耗设备上贵；被滥用；分层深度错觉遇实线边框就破 | 用背景色台阶和 `box-shadow` 做抬升表面 |
| 紫到蓝渐变或暗底青色强调系统 | 经典"AI 设计"调色板，对品牌什么都没说 | 按品牌词用 OKLCH 规则选调色板 |
| 泛用圆角矩形卡 + `box-shadow` 当默认容器 | 模板思维，不管层级给每种内容套同一容器 | 默认无卡片区块，内容类型需要时才加卡片处理 |
| modal 当溢出 UI 的偷懒出口 | 打断流程、破坏浏览器后退；该用内联展开/抽屉/独立页时用了 modal | 内联展开、详情面板、独立路由；只有真需要焦点锁时才 modal |
| `transition: all` 或动 width/height/padding/margin | 强迫浏览器每帧重算布局 | 列确切属性；高度展开用 `grid-template-rows: 0fr to 1fr` |

## 动效细节

补充主 SKILL 与 design-reference.md 的动效时长。

- 不用回弹或弹性缓动。真实物体平滑减速。用指数 ease-out（`ease-out-quart`、`ease-out-quint`、`cubic-bezier(0.16,1,0.3,1)`）做自然高质感的减速。
- 只动 `transform` 和 `opacity`。其它属性都触发布局或绘制。
- 高度展开用 `grid-template-rows: 0fr` 到 `1fr` 而非直接动 `height`，避开 `height: auto` 动画陷阱。
- 图标切换：120ms 交叉淡入，`opacity` 加细微 `scale(0.9)` 到 `scale(1)`。除非旋转有语义（chevron 指示方向变化），否则不旋转。
- 即使原型也不用 `transition: all`。它同时动布局、颜色、字号，造成可见 jank。

## AI Slop Test

陌生人扫一眼第一屏会不会立刻说"这是 AI 做的"？会，就说明锁的方向不够狠。常见元凶：reflex 字体、默认紫强调、居中 hero 配泛用卡片网格。修字体、色彩系统或布局直到答案翻转。

## 内容真实性（精简）

看着像真但不是真的占位文案，用户一读就破功。交付前应用。

**示例数据**：不用泛用人名（John Doe、Jane Smith）、不用泛用公司名（Acme Corp、TechCorp）、不用 Lorem Ipsum。用有机数字：`99.94%` 不是 `99.99%`，`$99.00` 不是 `$100.00`。

**UI 文案**：所有标题 sentence case，成功态不用感叹号，错误不用 "Oops!"。禁用词：Elevate、Seamless、Unleash、Delve、Tapestry、Game-changer、Next-Gen。

**占位**：组件不可用时用带标签的占位（灰矩形、monogram 字标、虚线边框）。绝不用 inline SVG 画插画类图像。

完整版见 [design-reference.md](./design-reference.md) 的内容真实性一节。
