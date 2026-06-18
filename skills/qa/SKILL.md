---
name: qa
description: "Verifies an implemented feature or fix in the real runtime before sign-off: browser flows with Playwright or the available browser tool, CLI/API smoke tests, screenshots, responsive states, generated artifacts, and regression paths. Use when a solo dev asks QA/验收/验证一下/跑一遍/冒烟测试/端到端/Playwright/browser test after implementation. Not for reviewing code quality or merge readiness (use check) or finding the root cause of a failing behavior (use hunt)."
when_to_use: "QA, qa, 验收, 验证一下, 跑一遍, 冒烟测试, 端到端, E2E, e2e, Playwright, browser test, 浏览器验证, 真实浏览器, 截图验证, responsive check, mobile viewport, visual regression, smoke test, acceptance test, verify the flow, test this in browser, end-to-end, after implementation"
dispatch_intent: "Runtime QA and acceptance verification after implementation: choose the right observable surfaces, run browser/CLI/API/artifact checks, collect evidence, and report pass/fail without code-reviewing or root-causing unless failure demands handoff"
---

# QA: 让真实运行时替你说能不能发

一个人开发最容易把"测试过了"说成"我看代码觉得应该行"。这个 skill 专门补那一段缺席的 QA：把已经实现的功能放进真实运行时，走用户会走的路径，用浏览器、Playwright、CLI、API、截图和产物检查拿证据。失败模式：只跑单元测试就宣布 UI 能用；或 Playwright 红了就立刻改代码，没分清是产品坏、测试坏、环境坏。

**QA 不是 review，也不是 debugging。** QA 回答"这条用户路径现在能不能用"，证据来自运行时。代码质量交给 `check`，根因定位交给 `hunt`。

## Outcome Contract

- Outcome: 一份基于真实运行时证据的验收结论，明确 pass / fail / blocked。
- Done when: 关键用户路径、至少一个负向或边界路径、相关视口或环境差异、生成产物或持久副作用都被检查过，且每个结论都有命令、截图、日志或可复现步骤支撑。
- Evidence: Playwright/browser 运行记录、截图、控制台/网络错误、CLI/API 输出、数据库或文件状态、生成产物、测试命令输出。
- Output: QA 矩阵、失败清单、阻塞项、可交给 `hunt` 的最小复现。

## Core Stance

- **先定义验收面，再开浏览器。** 从用户目标反推 3-7 条可观察检查：happy path、一个负向路径、一个边界状态、一个回归风险。不要打开页面后凭感觉到处点。
- **真实运行时优先于源码推断。** UI、路由、表单、下载、登录、生成文件、移动端布局，必须在能代表用户的运行面上看见结果。只能读代码时，结论叫 `blocked` 或 `not run`，不叫 pass。
- **工具是手段，不是目标。** 项目已有 Playwright 就用它；没有就用可用的浏览器工具、curl、CLI、截图、DOM 查询或手工步骤。不要为了 QA 引入新依赖，除非用户明确批准。
- **失败先分类，不急着修。** 失败分成 product failure、test failure、environment failure、unknown。只有 product failure 且修法显然安全时，才建议转 `hunt` 或 `check`；QA 本身不把失败越修越大。
- **证据要能复跑。** 每条 pass/fail 都带命令、URL、视口、账号状态、fixture、截图路径或步骤。没有复跑入口的"看起来好了"不算 QA。

## Pre-flight

- 读项目公开指令和 README，确认推荐验证命令、启动方式、端口、账号或 fixture。
- `git status --short --branch -uall`，把 dirty 文件当作用户工作，不为 QA 清理、stash、覆盖。
- 找现有验证面：`package.json` scripts、Playwright/Cypress 配置、测试目录、dev server 命令、API fixtures、示例 app。
- 若要启动服务，优先用项目已有命令。端口被占用时换端口或报告，不杀未知进程。

## 模式

**Browser QA · Activate when**: Web UI、前端流程、截图、移动端、Playwright、浏览器验证。

先确认启动命令和目标 URL。项目已有 Playwright/Cypress 测试就优先跑窄范围测试；没有测试时，用可用浏览器工具走用户路径。至少覆盖桌面和 375px 左右移动宽度；表单/导航/加载/空态/错误态按功能相关性抽查。记录控制台错误、网络失败、明显布局溢出、不可点击元素。视觉问题需要截图证据；canvas/图表/3D 要做非空像素或可见元素检查。

**CLI / API QA · Activate when**: 命令行、HTTP API、worker、脚本、集成回调。

用项目真实入口验证，不只调内部函数。CLI 查 help、成功、失败、exit code、stdout/stderr；API 查状态码、响应体、错误输入、幂等或持久副作用；worker 查队列、重试、日志和最终状态。涉及破坏性操作时优先 dry-run 或临时 fixture。

**Artifact QA · Activate when**: PDF、图片、导出文件、安装包、release asset、静态站点构建。

检查产物确实生成、路径正确、内容不是空壳、关键文本或资源存在。能渲染就渲染；能截图就截图；能解包就列包内容。仅 build pass 不证明产物可用。

**Regression QA · Activate when**: 用户说"修好了帮我验一下"、"以前坏的那条再跑一遍"、或 PR 修复了明确 bug。

从 bug 描述抽最小复现路径，先跑新代码确认不再复现。若有自动回归测试，跑它；没有则写出可复跑手工步骤。若失败，输出最小复现并转 `hunt`，不要在 QA 里猜根因。

## Hard Rules

- **没跑就别写 pass。** 任何 `pass` 必须对应本回合命令输出、截图、浏览器状态或产物检查。
- **不要把 QA 失败直接当代码根因。** Playwright selector 过期、fixture 缺失、服务没起、权限不对，都是可能原因。先分类。
- **不要为了验证引入新依赖。** 缺 Playwright 时，用现有浏览器工具或手工可复跑步骤；需要新增测试框架必须先得到用户批准。
- **UI QA 至少看一个窄视口。** 除非功能完全非视觉，否则只测桌面会漏掉移动端溢出和不可点击。
- **不要改用户数据。** 验证写操作必须使用临时账号、fixture、测试库、dry-run，或先明确说明会产生什么副作用。
- **生成产物要打开或检查内容。** 文件存在但为空、资源丢失、字体没嵌入、包里漏文件，都不是 build 能证明的。
- **失败报告要可交接给 hunt。** 每个 blocker 至少包含环境、步骤、预期、实际、证据位置。

## Gotchas

| 真实会犯的错 | 规则 |
| --- | --- |
| 单元测试绿了就说页面能用 | UI 要真实打开，至少走关键路径 |
| Playwright 红了马上改业务代码 | 先判 product / test / environment / unknown |
| 只测 1440px 桌面 | 相关 UI 至少加一个 375px 左右窄视口 |
| 点击路径用了本地登录态，别人复跑不了 | 写清账号状态、fixture、URL、准备步骤 |
| 下载文件只看到了文件名 | 打开或解析内容，确认不是空壳 |
| QA 时顺手清库或删文件 | 用 dry-run / fixture，不碰用户数据 |
| 控制台红字没记录 | 控制台和网络错误是证据，必须进报告 |
| 服务启动失败还继续测 | 这是 environment failure，先阻塞并写明命令输出 |

## Closing Pass

- 每个用户承诺的功能点都有一条验收证据吗？
- happy path 之外，至少跑了一个错误或边界路径吗？
- UI 有桌面和窄视口证据吗？
- 有副作用的写操作是否用了 fixture 或 dry-run？
- 失败项能否直接交给 `hunt` 复现？

## Output

```
status:       pass / fail / blocked
scope:        [验收的功能或路径]
environment:  [命令, URL, 浏览器/视口, fixture, 账号状态]
checks:
  - [pass/fail/blocked] [检查项] -> [证据]
failures:
  - [product/test/environment/unknown] [最小复现 + 证据]
handoff:      [若失败, 建议转 hunt 的复现入口; 若通过, none]
```
