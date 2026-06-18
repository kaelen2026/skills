---
name: hunt
description: "Finds the root cause before touching code for errors, crashes, regressions, failing tests, flaky bugs, and screenshot-reported defects, building a fast pass/fail loop first. Use when an indie dev asks 排查/报错/崩溃/不工作/回归/反复修不好, or says something used to work and now fails. Not for planning a new feature (use think) or reviewing a finished diff (use check)."
when_to_use: "排查, 查查, 报错, 崩溃, 不工作, 不对, 跑不通, 以前是好的, 回归, 截图回归, 偶发, 判断错误原因, 判断为什么报错, 反复修不好, debug, regression, used to work, broke after update, why broken, not working, what's wrong, fix error, stack trace, flaky"
dispatch_intent: "Error, crash, regression, flaky failure, screenshot-reported defect, test failure, stale cache, why broken, fix that won't hold"
---

# Hunt: 先建反馈回路，定到根因，再动手

打在症状上的补丁，会在别处长出新 bug。一个人开发没人帮你复现、没人帮你看日志，所以更要先把"能稳定告诉你对错"的回路建出来，再在它上面定位。失败模式：没有可信回路就开始猜、改、再猜，第三次还没修好，且每次"修好了"都没法证明。

**反馈回路就是调试本身。** 一个快速、确定、agent 能自己跑的 pass/fail 信号，是这里唯一真正的工具。有了它，定位 bug 就只剩 bisection 和验证假设这些机械动作。没有它，你做的一切都是猜。

## Outcome Contract

- Outcome: 在改任何代码前，根因被锁定。
- Done when: 一句话说清根因，每个观察到的症状都被它解释，修复或交接已对着一个可复现的检查验证过。
- Evidence: 源码路径、复现命令或 UI 路径、日志/状态、定向的 test/build 输出、UI 或原生缺陷的运行时证据。
- Output: 根因、修复或交接、验证结果、以及任何没扫到的同类风险。

**能用一句话说出根因前，不要碰代码：**
> "我认为根因是 [X]，因为 [证据]。"

点名具体的 file、function、line 或 condition。"状态管理问题"不可测；"`src/hooks/user.ts:42` 的 `useUser` 因为依赖数组缺了 `userId` 导致缓存陈旧"才可测。说不到这个粒度，就还没有假设。

## Core Stance

- **先投资回路，再投资定位。** 回路这一步值得花不成比例的精力。能写失败测试就写，能 curl 就 curl，能拿 fixture diff 就 diff。目标是一个 2 秒、确定的回路；一个 30 秒、时好时坏的回路几乎没用。构造与打磨手段见 `references/feedback-loop.md`。
- **假设必须可证伪，且解释所有症状。** 行动前列全所有可观察症状（不只是用户先报的那个）。假设若只覆盖一部分，它是症状级猜测，不是根因。
- **不确定的 bug，目标是提高复现率。** 偶发、闪烁、竞态，先把它逼到能稳定（或高概率）复现：循环 100 次、并行、加压、调时序。无法稳定复现就别开始诊断。
- **改不动就回到证据。** 同一症状在修复后还在，是硬停。从头重读执行路径，别往一个被推翻的解释上再叠补丁。
- **修因，不修症状。** 修复超过 5 个文件就暂停，跟用户确认范围。bug 修着修着变成重构，那是另一个 PR。

## Diagnosis Signals

好进展的样子：一条日志匹配上了假设、你能在跑之前预测下一个错误、你看懂了从根因到症状的传播路径、你能写出一个在旧代码上失败的测试。每出现一个信号，提交前再找一份独立证据。

合理化警告：

- "我先试试这个" = 没假设，先写下来。
- "我很确定" = 跑一个能证明它的仪器。
- "大概是同一个问题" = 从头重读执行路径。
- "在我机器上是好的" = 列全每一处环境差异再下结论。
- "再重启一次" = 逐字读最后一个错误；没有新证据，重启不超过两次。

## 模式

**Fast Path · Activate when**: bug 局部、路径清楚、能在几分钟内建出回路并一次定位。

写一句根因假设 → 建最小回路 → 跑它确认 → 改 → 回路转绿 → 加回归测试。不要把简单 bug 拖进六阶段仪式。

**Full Loop · Activate when**: bug 反复修不好、偶发、跨进程、或一次定位失败。

走纪律：建回路 → 复现并锁定症状 → 列 3-5 个排序的可证伪假设（每个写出预测："若 X 是因，那么改 Y 会……"）→ 按预测逐个上仪器验证 → 写回归测试再修 → 清理仪器并在 commit 里写清为何复发、此修为何能防。

**Bisect · Activate when**: "以前是好的""之前是好的""used to work""broke after update"，或用户记得某个 good commit/version。

0. 先保护用户的工作区：`git status --short --branch -uall`。有改动/暂存/未跟踪文件就别在当前 checkout 里 bisect，从同一 HEAD 建临时 detached worktree 跑，完事 `git bisect reset` 并移除临时 worktree。做不到就停下问，要明确的 stash/清理批准。
1. 找候选 good tag：`git tag --sort=-version:refname | head -10` 或问用户最后已知好的 commit。
2. 开始前先定义一个非交互的 pass/fail 测试命令。没有可复现检查的 bisect 毫无价值。
3. `git bisect start && git bisect bad HEAD && git bisect good <tag>`，每步跑测试命令标 good/bad，让 bisect 驱动，别跳步。
4. bisect 点名 culprit commit 后只读那个 diff，定位引入回归的具体行。完事 `git bisect reset`。

大文件读一次记笔记引用，别每步重读。

**Screenshot / Repeated Regression · Activate when**: 用户说同一问题修后还错、给了"好的"截图/版本/文件、或把某视觉结果描述为曾经正确。

把参照当证据不当装饰：列全每个报告和可见症状（保留用户原话，"还是慢""不清晰""尖刺""先显示上一个内容"）→ 找参照 oracle（last-good commit、旧 build、fixture、截图、期望状态）→ 编辑前定义 pass/fail 检查 → 对比当前与参照、点名确切 delta，别把坏渲染泛化成"风格打磨"。同一症状修一次后还在，停下从证据重建假设，别叠补丁。纯主观 UI 审美路由到 design；渲染/状态/时序/build 输出/字体生成/已知好版本的回归留在 hunt。

**Scope Blast · Activate when**: 修完一个根因模式、宣布 bug 完成之前；或用户说"举一反三""其他地方有没有同样问题"。同一形状常藏在另外 N 处，一个局部修复忽视 blast 就在树里留下 N-1 个 bug。

提取模式签名（具体函数名、regex、API 调用、CSS 选择器、锁获取、跳过的校验、输入边界）→ `grep -rn` 全仓（排除 generated/build/vendored）→ 逐个 match 书面回答：这里也是同一 bug 吗？修 / 留（说明为何安全）/ 不确定（问用户），不要默默跳过。blast 报告进 Outcome 块前不许宣称"已修"。blast 翻出无关 bug，列出但本 PR 不修，除非用户同意。

## Hard Rules

- **同症状修后复现，是硬停；"我先试试"也是。** 都意味着假设没完成，从头重读执行路径再碰代码。
- **三个假设都失败就停。** 用下面的 Handoff 格式交出查了什么、排除了什么、什么未知，问怎么继续。
- **声称前先验证。** 版本号、函数名、文件位置绝不凭记忆，先 `sw_vers` / `node --version` / grep。查不到就重审路径。
- **行为/生命周期/异步 bug：先上仪器，不要等修复失败后才加日志。** 窗口生命周期、事件投递、导航、焦点、定时器、状态机、异步排序几乎不靠静态阅读解决。假设一旦涉及"这个回调比那个先/后触发""Y 跑时这个状态应该是 X""这个对象到这里应该还活着"，**立刻把日志作为形成假设的一部分加上**，在写任何修复之前。连续两个无运行时证据的猜测就是硬停信号。
- **视觉/渲染 bug：先静态分析。** 在 DevTools 里追 paint 层、stacking context、层序，再考虑日志或可视化叠层。日志抓不到合成器做了什么。
- **系统/工具链症状：先量底层基线。** 怪可见的 app/生成文件/顶层功能之前，先量原始底层：OS 采集 vs 后处理、运行时服务 vs UI、编译器/工具链 vs 测试断言、网络/API vs 客户端处理。被基线证伪的假设明确退役，别绕圈。
- **外部工具失败：先诊断再切换。** MCP 工具或 API 失败，先查为什么（服务在跑吗？key 有效吗？config 对吗？）再换替代。
- **魔法数字调到第三轮：停，统一。** 一个间距/尺寸/阈值调了三次还不对，bug 是结构性的不是数值。把 N 个独立值换成一个命名 token，验证那个不对称是不是藏着缺失的约束。调过三轮还在的不对称是结构性的，再调不会收敛。
- **注意回避。** 有人说"那块不用看"时当信号待之。被回避的地方常是问题所在。

## Runtime Evidence Ladder

宣布修好前走这个梯子：

1. 源码追踪：点名能产生该症状的确切 function、状态转移、file、line 或 condition。
2. 确定复现：跑或写出产生它的最小命令、fixture、UI 路径。
3. 日志/状态/缓存：检查证明路径被走到的运行时状态，含队列、DB 行、缓存、临时文件、生成产物、外部工具日志。
4. Build/test：跑覆盖此修的窄测试或 build。
5. 真实运行时检查：UI、原生 app、浏览器、渲染、视觉 bug，打开 app/page/artifact，用截图或具体清单核对可见结果。

UI、原生、视觉、渲染、生成产物类 bug，仅编译通过不够。环境里跑不了运行时检查就说明原因，并把确切的屏幕、命令、artifact 交接出去。复发类失败，加第二个修复前先读 `references/failure-patterns.md`。

## Targeted Logging

日志当手术刀不当噪音。加日志前先写它要回答的问题：
> "若这条在 Y 之前打出 X，假设 A 还成立；若没有，A 错。"

快速规则：第一条日志放执行路径中点（不是症状处），从那二分；只记有区分度的事实（序号、输入 key、走了哪个分支、新旧状态、错误码）；收尾前删临时日志，持久诊断 gate 在项目 debug flag 后。加日志改变了行为，那本身就是时序/生命周期/并发问题的证据。完整 playbook 见 `references/logging-techniques.md`。

## 专项参照（按需加载）

- 渲染/PDF/字体/分页 bug：`references/rendering-debug.md`（WeasyPrint 怪癖、字体加载、页溢出、打印 CSS）。先静态分析。
- IME/Unicode/光标漂移/emoji 分裂/输入法 bug：`references/ime-unicode.md`，形成假设前先看。
- 复发类、首次修复没扛住、症状像运行时状态而非局部语法：`references/failure-patterns.md`。

## 原生 App 卡死

beachball、无响应、切 tab 卡、首开卡、空闲唤醒卡、overlay 锁死、截图显示冻结时，改代码前先收集：精确用户路径与版本（冷启 vs 热启、tab/window 转换、空闲时长、权限、显示器数、什么设置能让卡死消失）；冻结时的运行时采样（`sample <process>`、近期日志、CPU/内存、线程数、主线程是否被阻塞/空转/分配）；首帧表面（view body、首个 `.task`、同步图标/元数据查找、文件系统扫描、URL 父目录遍历、通知回调、唤醒 handler）；修后 blast 搜同一 API 形状。仅编译/仅源码不足以收尾此模式。

## Gotchas

| 出过的问题 | 规则 |
| --- | --- |
| 改了 client pane，问题在 local pane | 碰文件前先反向追执行路径 |
| MCP 不加载，直接换工具而非诊断 | 先查服务状态、key、config，再换方法 |
| 怪可见 app，没量原始系统/工具层 | 先量底层，再明确退役被证伪的假设 |
| 编排器说 RUNNING，实际 TTS 配错 | 多阶段管线逐段隔离测试 |
| 竞态被诊断成陈旧状态 bug | 时序敏感问题先看事件时间戳和顺序，再看状态 |
| 到处加日志还是解释不了 bug | 把每条日志改写成是/否问题，删掉不能排除假设的 |
| 本地能复现，CI 失败 | 先对齐环境（运行时版本、env、时区）再追代码 |
| 栈追踪指向库深处 | 往自己代码回退 3 帧，bug 几乎总在那不在依赖 |
| 从 app 启动正常，从文件关联/拖拽/deep link 打开就坏 | 用用户描述的确切入口复现；冷启动带文件的 init 与 app 内 init 不同，文档到达时状态可能没就绪 |
| build 过了 UI 还是错 | 沿证据梯子上移，核对真实渲染表面或产物 |

## Closing Pass / Output

### 成功格式

```
Root cause:        [哪里错了, file:line]
Fix:               [改了什么, file:line]
Confirmed:         [证明修复的证据或测试]
Tests:             [pass/fail 数, 回归测试位置]
Regression guard:  [test file:line] 或 [none, 原因]
```

状态：**resolved** / **resolved with caveats**（写明）/ **blocked**（写明未知）。

**回归守卫规则**：任何复发过或曾"修好"的 bug，不算完成，除非三条同时成立：回归测试在未修代码上失败、在修复后通过；测试进项目测试套件不是临时文件；commit 信息写清为何复发、此修为何能防。

### Handoff 格式（三个假设都失败后）

```
Symptom:           [原始错误, 一句]
Hypotheses Tested: 1/2/3 [假设] → [测法] → [排除原因]
Evidence:          [日志/栈/文件内容; 复现步骤; 环境: 版本/config/运行时]
Ruled Out:         [已排除的根因]
Unknowns:          [仍不清楚的; 缺的信息]
Next Steps:        [下一步方向; 可能需要的工具/权限; 用户应补的上下文]
```

状态：**blocked**
