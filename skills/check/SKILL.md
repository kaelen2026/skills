---
name: check
description: "Reviews a diff, PR, issue queue, release, or whole project as the senior reviewer an indie dev does not have, with safety gates for dirty and untracked worktrees. Use when the dev asks review/看看代码/合并前/看看issue/PR/release/push, or hands off an approved plan to implement. Not for exploring a design (use think) or tracing why something broke (use hunt)."
when_to_use: "review, 看看代码, 检查一下, 有没有问题, 是否需要优化, 合并前, 继续优化, 看看issue, 看看PR, release, publish, push, 发布, 提交, 关闭issue, close issue, review my code, check changes, before merge, before release, code review, audit, 项目体检, 项目评分, 给项目打分, scorecard, rate this codebase, 按计划实施, implement this plan"
dispatch_intent: "Code review, before merge, release gates, generated artifacts, safety sinks, publish/push follow-through, triage issues/PRs, project-wide quality scorecard, execute an approved plan"
---

# Check: 合并/发布前，一人扮演那个评审者

> 注：`/review` 是 Anthropic 内建的 PR review 插件命令。本 skill 用 `check`，不要在 check 内再触发 `/review`。

一个人开发没人 review 你的 PR，所以最容易在自己最熟的代码上漏掉自己引入的坑。这个 skill 扮演那个缺席的资深评审者：读 diff、找问题、能安全修的就修、其余的问。失败模式：为了"对得起这次调用"硬凑发现；或把"我看了代码觉得没事"写成"我验证过了"。Done 的定义是：验证命令本回合真的跑过并通过。

## Outcome Contract

- Outcome: 一个基于当前 diff、项目上下文、实时证据的评审、发布决策或维护者动作。
- Done when: 发现、修复、已发布状态或阻塞，都附上证明它们的命令、产物或远程状态。
- Evidence: worktree 状态、diff、公开项目文档、manifests、CI、包内容、release/registry 状态、当前命令输出。
- Output: 先给精简发现，适用时再给验证与已发布状态摘要。

## Core Stance

- **不写未经验证的声明。** 不写"我验证了 X""我跑了 Y""测试通过""这修好了 Z"，除非 shell 输出就在本回合 transcript 里。只读代码就说"based on reading the code"，不说"verified"。
- **引用 source-of-truth 事实前先本回合重读。** 行号、dirty 文件数、分支 ahead/behind、fallback 行为、release 产物状态，写进报告前都要本回合重读（`git status`、`git diff`、`Read`、`rg`）。长会话里凭百回合前的记忆复述是反复出问题的失败模式。引用时标注验证路径（`per current Read of <file>`）。
- **干净的评审就是有效的评审。** 不要为了凑数制造发现。零发现 + 写明评审面 = 完整输出。低置信噪音比报告空白更糟，它会训练读者忽略真发现。
- **每个发现先过质量门。** 能引确切 file:line 吗？能描述触发它的输入/状态吗？读过上游调用方和下游消费方吗（不只孤立看这个函数）？严重度站得住吗？任一为否，降级到 advisory 或删掉。
- **HIGH/CRITICAL 需三份证据：** bug 所在的确切 file:line；具体触发（什么输入/状态/序列产生坏结果）；为何现有守卫（校验、类型系统、上游 catch、框架默认）没拦住。给不全就降到 MEDIUM 或删。

## Worktree Safety Preflight

任何评审/分诊/ship/release/PR 操作前，先读：

```bash
git status --short --branch -uall
```

把 modified、staged、untracked 文件当用户的工作。可以读、可以纳入评审面，但未经本回合明确批准，不得移动、隐藏、覆盖、clean、丢弃。

默认评审/PR 准备不要跑：`git switch`、`git checkout`、`git reset --hard`、`git clean`、`git stash -u/-a/--all`、`gh pr checkout`。真需要切分支或清理，停下问那个确切操作。也不要把 untracked/生成/截图/scratch 文件挪进 `/tmp` 来"保护"：挪走别人的 WIP 和 stash 是同一类干扰。需要干净树才能生成/打包/验证，就从已知 commit 开一个独立 worktree，只把你自己的产物或 patch 拷回来。

dirty 或多 agent checkout 里的 commit/push：staging 前记 `git rev-parse HEAD`；commit 前、push 前各重读一次 `git status --short --branch -uall` 和 `git rev-parse HEAD`。HEAD 动了、冒出未知 commit、或工作区在你目标文件之外变了，停下报告，别 rebase/重提/push。

PR 检查优先用不切工作树的命令：`gh pr view`、`gh pr diff`、`git fetch origin pull/<n>/head:refs/tmp/pr-<n>`、`git merge-tree`。

## Project Context Extraction

评审前从仓库公开上下文提约束（来自公开文件、diff、CI、本回合明确指令，不依赖私有机器路径）：读 diff 识别改动的语言/框架/manifests/生成产物/release 文件/CI；按需读公开项目文件（README、AGENTS/CLAUDE、manifests、lockfiles、build/test config、workflow、release notes）；压缩成评审上下文（验证命令、受保护/生成文件、release 产物、领域风险、公开回复规则）；项目上下文与本 skill 重叠时取更严的那条；项目文档或 CI 指名了验证命令，优先于自动探测。上下文模板见 `references/project-context.md`。release/维护者工作还要填该文件里的 Release Gate 2.0 矩阵；缺矩阵证据 = "ready to release"的阻塞。

## Mode Picker

按用户意图选模式，读全那一节。模式叠在共享评审面（Scope、Hard Stops、Autofix、Specialist、Verification、Sign-off）之上。

| 用户意图 | 模式 |
| --- | --- |
| "按计划实施"、think 交接的计划 | Plan Execution |
| diff/PR ready、"review"、"看看代码"、"合并前" | 默认评审（从 Get the Diff 起） |
| "看看 issue"、"review PRs"、"triage"、"批量处理" | Triage |
| "值不值得发版"、"is this worth a release" | Release Worthiness |
| "commit"、"push"、"publish"、"release"、"close issue" | Ship / Release Follow-through |
| "audit"、"项目体检"、"项目评分"、"给项目打分"、"scorecard" | Project Audit |
| 文档、PDF、prose 评审 | check 不处理，路由到写作类 skill |

**Plan Execution · Activate when**: 消息以"按计划实施""按照计划""整""可以干""直接改"+计划正文开头，或链接到 think 输出。此模式不跑代码评审：声明执行哪份计划 → `git status --short --branch -uall` 查仓库漂移（漂移使计划不安全就点名并停）→ 逐项做、逐项标完成 → 跑项目验证命令 → 若项目上下文/本回合指示 review-then-ship，自动转 Ship。

**Default Continuation**: 项目 AGENTS.md 或本回合明确要求"review 后 commit""绿了就 ship"时，干净评审后直接转 Ship 流程，不再问，先声明"proceeding to ship"。

## Get the Diff

取当前分支与 base 分支的完整 diff。不清楚就问。已在 base 分支上，问评审哪些 commit。

## Triage Mode

**Activate when**: 提到 issue、PR、"review all"、triage、批量。跳过 diff 流程。

行动优先：处置明确的项（已修、重复、已发布）直接动手，不写分析段落；分析截图/图片时一条消息内说清看到什么+建议动作；只在处置真歧义时才问用户。

捆绑请求先拆：核心 bug / 已有入口 / 装饰偏好 / 范围外。只修或关验证过的核心 bug；已有入口用当前路径回答；装饰和范围外的推迟或拒，别把整份报告当待办。

状态回答顺序：对"都解决了吗""is this fixed"，按 代码/commit 状态 → 分支/CI 状态 → release 产物/registry 状态 → 公开 issue/PR 状态。别把 fixed-on-main、pre-release 可用、下个 stable、已发布混为一谈。

流程：先从公开上下文识别 issue/PR 宿主。GitHub 项目用 `gh issue list -R <repo> --state open --limit 20` 和 `gh pr list`；非 GitHub 用项目文档指名的 CLI/API，没有就停下报告缺集成而不是硬套 GitHub。逐项查是否已修：`git log --oneline <latest-tag>..HEAD | grep -i "<keyword>"`。已修则关并附注；merged 未发布则回"已修复，等下个版本 release"并关；无修则分析处置。下结论前再刷一次列表、重读期间变动的项；证据不全就 hold 不要靠猜关闭。

PR 处理：方向接受但 patch 需改，优先把维护者修复 push 到贡献者 PR 分支再 merge：先查 `maintainerCanModify`，push 前确认 remote、目标分支、当前 HEAD，别覆盖贡献者工作或推错仓。不允许改分支就请贡献者开 maintainer edits 或自行 push。只在方向被拒/不安全/不再需要/明确不在范围时不 merge 直接关。别把接受的 PR 悄悄吸进 main 再关。公开回复模板见 `references/public-reply.md`。

Sign-off 追加：`triage: N reviewed, N closed, N deferred`。

## Release Worthiness Analysis

**Activate when**: "深入分析 X 是不是值得发新版本""值不值得发版"。

`git log <last-tag>..HEAD --oneline`（last tag 用 `git tag --sort=-version:refname | head -1`），分类计数 feat/fix/chore，输出：commit 摘要（N feat/N fix/N chore）、Verdict（release/skip 一行）、建议 bump（patch 仅修复 / minor 有 feat / major 有破坏）、Key risk（一句）。判 release 则提议转 Ship。

## Ship / Release Follow-through

**Activate when**: commit、tag、release、publish、push、回复 issue/PR、改动 ready 后关 issue。此模式扩展评审，不跳过评审。任何公开或不可逆动作前：从公开上下文提 release 规则 → 填 Release Gate 2.0 矩阵 → 校验生成/捆绑产物、版本字段、release notes、包内容、必需 artifacts 同步（有 dry-run 优先用）→ 只 commit 有意的文件、保留无关 dirty 工作、串行化 git 操作、push 前重查 HEAD/status → push/publish/tag/release 只在用户明确批准该动作后做，auth/OTP/CI/registry/网络阻塞就暂停报确切阻塞 → issue/PR 跟进前用宿主读命令确认条目身份（GitHub 用 `gh issue view`/`gh pr view`）→ 网络或 API 失败后重读终态，别假设成败。

生成交付物包含 tracked archives、ignored dist、appcasts、site/download 文案、registry 包、checksums、release assets。项目文档要求就重生成、检查、明确 stage 或上传，哪怕被 git ignore；别从仅源码的测试推断 ready。

**Reworked / Cancelled Release Gate · Activate when**: release candidate 被取消、preview/beta 反复修 bug、或用户问延期的 release 终于安全了吗。把评审 base 锁到最后一个公开 stable tag/artifact 一直评到当前 HEAD，不要只看近期 commit。记录确切 base、HEAD、dirty 状态、origin 同步、版本字段、生成产物、release notes、包内容、CI、远程分发态；中途有变就刷新范围重跑快速门。按已发布风险面评（用户报告的回归、crash/hang、破坏性操作、权限边界、后台 worker、启动/首帧、update feed、包内容、公开支持声明）。输出两个 release 决策：preview/beta 能否继续收测试、stable prep 能否开始。每个结论都点名阻塞、可推迟维护、跑过的命令、运行时或用户冒烟覆盖；仅源码测试不能证明 reworked UI/原生 release ready。

收尾给具体已发布状态：commit hash、tag、release URL、registry/version 结果、pushed 分支、release asset 状态、issue/PR 状态、剩余阻塞。不适用的字段省略。

## Project Audit Mode

**Activate when**: 项目级质量评分卡："audit""项目体检""代码质量评分""scorecard""linus 风格 review"。区别于默认评审（PR/diff 范围）和 Triage（issue 批处理），是单遍项目级质量评估。

1. 从目标仓跑 `python3 <skills>/check/scripts/audit_signals.py --root <project>`，输出带标签块（`=== FILE SIZE HOTSPOTS ===` …）各以 `status: PASS|WARN|FAIL|N/A` 结尾。
2. 略读 `FILE SIZE HOTSPOTS` 顶部 3-5 个最大源文件（架构清楚就提前停）。
3. 读 `CLAUDE.md`/`AGENTS.md`/`README.md` 学项目自述约定，再拿通用标准判它。
4. 用四轴 rubric（各独立 0-10，总分取算术平均）：Architecture（模块边界、耦合、抽象层 vs 扁平重复、单一真相源）、Code Quality（文件大小纪律、去重、可读性、非显然行为的注释）、Engineering（测试、CI 门、版本协调、install URL pinning、打包姿态）、Perf & Risk（隐患、范围蔓延、分发风险、隐私姿态、第三方爆炸半径）。
5. 每轴 3-7 个具体发现：尽量带 file:line、severity（CRIT/STRUCT/INCR）、一行修法。
6. 只输出到终端，不在目标仓建文件。用户后续说"保存"再提 `./docs/<project>-audit.md`。

评分锚：9-10 极佳仅剩打磨；7-8.5 扎实有明确改进点；5-7 能用但有结构债；<5 建议大改。项目自己文档/注释里已论证的 WARN 不算发现（引用论证并跳过），别机械把 WARN 升成 CRIT；`status: N/A` 表示该面不存在，当沉默而非正面信号。

输出模板与评分细则见上述六步；报告后停，除非用户要后续实现。Audit 模式不改目标仓文件。

## Scope

| Depth | 标准 | Reviewers |
| --- | --- | --- |
| Quick | <100 行, 1-5 文件 | 仅基础评审 |
| Standard | 100-500 行, 或 6-10 文件 | 基础 + 条件 specialist |
| Deep | 500+ 行, 10+ 文件, 或触 auth/payments/data mutation | 基础 + 全 specialist + 对抗 pass |

先声明 depth。

## Did We Build What Was Asked?

读代码前查范围漂移：diff 与陈述目标对得上吗？标 on target / drift / incomplete。再查 surgical traceability：每个改动文件、每个新公开面都要能用一句话从用户目标推出来。某文件/依赖/config 旋钮/抽象/生成产物/workflow 权限/release 行为解释不了，标 drift 直到证明必要。漂移信号（任一即可）：改动文件与目标无关；目标是修 bug 或加功能却含纯重构（重命名、格式化）；冒出目标没提的新依赖；删/注释了无关代码；引入目标不要求的新抽象；一个"可维护性/清理"改动悄悄加了用户可见 UI、默认 config、workflow 权限或 release 行为。

## Pattern-Fix Completeness

diff 修了某 class-of-bug 的一个实例（缺校验、错选择器、off-by-one、缺锁），同形状常在别处。提取签名 `grep -rn` 全仓（排除 generated），确认同类实例也处理了。漏的同类：同风险标硬停，低风险标 advisory。深扫 playbook 见 hunt 的 Scope Blast。

## Testability Seam For Recurring Bugs

diff 修的是复发过的视觉/布局/时序/有状态 UI bug（同区域之前坏过，或修法读起来像"调数字调到看着对"），仅改代码会让回归回来：逻辑和可变渲染/UI 状态纠缠，没地方断言。标不完整，除非它把决策抽成纯函数（入参进、值出、无可变 receiver）并单测被违反的不变量（宽度永不塌成 0、命中区保持半开、偏移在界内）。"跑 app 验证过"只确认这一例；只有钉住不变量才能挡下一例。只对复发类或运行时检查看不见的类要求接缝，别对已有直接覆盖的一次性逻辑强求。

## CLI Command Surface

diff 触 CLI 入口、installer、completion、config/env 处理、包 wrapper，或 cleanup/update/uninstall/migration/cache 移除这类 mutating 命令时，sign-off 前填 `references/project-context.md` 的 CLI Command Surface。查命令契约和已安装运行时行为（help/version、子命令/flag、exit code、stdout/stderr、JSON 输出、TTY/非交互、env/config 优先级、shebang/可执行位、PATH shim、包管理安装路径），不只库测试。mutating 命令还跑 Safety Sink Review（dry-run/确认、操作日志/回滚、retry/幂等、信号/部分失败、auth 或真实变更的 test-mode 守卫）。cleanup/uninstall/prune/reset/cache 移除还加两查：普通用户能否核对每个选中项安全、删的内容本地可重建还是下载依赖/用户数据。任一为否，要求更窄匹配、显式选择，或留可见但不破坏。

## Hard Stops（合并前修）

示例非穷举，任何不评审合并就可能造成不可逆伤害的 diff 都标。

- **不写未经验证的声明。** 见 Core Stance。每个 sign-off 里的验证声明都要指向本回合真跑过的命令。
- **String-matching 在捕获输出上？** diff 在错误消息/命令输出上分支、grep、分类时，先验证那字符串运行时真装了什么。`stdio: 'inherit'`（或任何未捕获管道）把诊断流到终端不进 `error.message`，于是 matcher 静默匹配到命令而非输出，能过测试、触错 token、或线上是死代码却看着对。用一行 repro 探真实 `error.message`，优先用结构化事实（build target、exit code）驱动而非重解析字符串。
- **破坏性自动执行**：任何标"safe"/"auto-run"却改用户可见状态（history、config、preferences、已装软件）的任务必须要显式确认。
- **Release 产物缺失**：release notes/模板/workflow 列的每个 artifact 都要验证存在并已上传，再宣布 done。
- **生成产物漂移**：源码改动要求重生成的产物，验证已重生成并包含。
- **Verifier 失败层不清**：verifier 在断言前失败、或因缺可选依赖/bootstrap 噪音/构建服务崩/模拟器不可用/工具 setup 失败，分清 setup 失败 vs 产品失败。只在有新证据或更窄环境时重试。intended test body 或 artifact 检查真跑起来前别说仓库坏了。
- **Tracked 包遗漏**：包脚本从 tracked 文件/allowlist/生成 manifest 构建时，验证 diff 用到的每个新 helper、reference、template、script 都 tracked 且在构建的 archive 里。
- **版本错位**：manifests、包元数据、app config、changelogs、tags、lockfiles 的 release 版本字段必须同步。
- **diff 里的未知标识符**：diff 引入的、codebase 里不存在的 function/variable/type 是硬停。引用前 grep：`grep -r "name" .`，diff 外无结果 = 不存在。
- **无证据的死代码/YAGNI 删除**：任何"零调用方""未用"声明必须全仓核查，含顶层入口、文档、测试、生成的 dispatch 表、脚本、CI、动态查找。子 agent/工具报告当线索不当证据。删前批量 grep 所有候选、区分 test-only 与生产引用、追可能一起变孤儿的写入变量/数据表。grep 范围不全就别删。
- **注入与校验**：系统入口的 SQL/命令/路径注入。凭证硬编码、记日志、提交、抄进公开文档。
- **依赖变更**：package.json/Cargo.toml/go.mod/requirements.txt 里意外的新增或版本 bump。标任何 diff 没明显需要的新依赖。
- **Safety sinks**：破坏性文件操作、shell/AppleScript 构造、cwd/path/symlink 遍历、approval/sandbox 边界改动、signing/appcast 流、auth 提示，都要显式评审校验、回滚、用户确认行为。
- **Audit before restore**：diff 重新加回近期历史删掉的 symbol/string/asset/config 字段时，grep diff 余下和主分支确认还有东西用它。规则文件提到符号不是存活证据。只有 parity test 引用它 = 规则陈旧、restore 错，拒 restore 并标陈旧规则。
- **AI 生成 PR 在破坏性 sink 引入宽匹配器**：引入 find 式递归、批量删、sandbox 遍历、ID 前缀通配、fallback regex 喂进破坏性 sink 且疑似 AI 生成的 PR，逐行查三件事：每个分支的匹配器宽度（fallback 常退回宽 glob 即便主分支对）、受保护路径覆盖、是否绕过现有用户确认。泛泛的"看着合理"不是安全。存疑就请贡献者收窄到精确常量（确切 bundle ID、确切 app 名、确切路径），别批"this looks fine"。
- **为从未发布过的功能写迁移代码**：底层 preference/schema/feature 在本 release 才引入时，拒迁移脚手架、版本门默认、"carry old key forward"。`git show v<last-release>:<path>` 是闸门：key 在上个 tag 缺席就不需迁移，发默认值即可。

## Knowledge Sync

评审后查 diff 是否引入项目文档尚未记的不变量：新 safety gate/path-guard → AGENTS.md；新 UI 约束 → 项目规则文件；新 deploy/release 步骤或产物 → AGENTS.md 或 docs；新跨文件同步要求 → AGENTS.md。一次性评审报告/诊断快照别原样变成长期文档，把稳定规则抽进 AGENTS/CLAUDE/规则文件，丢掉陈旧报告。找到则不变量从 diff 清楚时按 `safe_auto` 应用文档更新，否则 sign-off 标 `doc debt`。无新不变量则 `doc debt: none`。

## Specialist Review（Standard / Deep）

读 `references/persona-catalog.md` 决定激活哪些 specialist，有并行 agent 设施就并行跑、传全 diff，没有就同会话顺序跑。合并发现：两个 specialist 标同一位置取高严重度并注明交叉一致；不同位置即便同主题也不算重复。把每个 specialist 发现当待验证的声明，路由到 Autofix/sign-off 前本回合重读所引代码、确认它真实且活（不是已在别处处理、不是 by-design、不是 latent 被标成 live），并行 reviewer 常凭名字推断和片面上下文过报，直接读后消失的就降级或删，并标验证路径。Agent 提示词见 `agents/reviewer-security.md` 和 `agents/reviewer-architecture.md`。

## Autofix Routing

| 类 | 定义 | 动作 |
| --- | --- | --- |
| `safe_auto` | 无歧义无风险：typo、缺 import、风格不一致 | 立即应用 |
| `gated_auto` | 大概率对但改行为：补 null 检查、加错误处理 | 批成一个用户确认块 |
| `manual` | 需判断：架构、行为变更、安全取舍 | sign-off 里呈现 |
| `advisory` | 仅信息 | sign-off 注明 |

先应用全部 `safe_auto`，把全部 `gated_auto` 批成一个确认块，绝不逐个单独问。

## Adversarial Pass（Deep）

"若我要通过这个 diff 攻破系统，会利用什么？"四角度（见 `references/persona-catalog.md`）：assumption violation、composition failures、cascade construction、abuse cases。压制 0.60 以下置信的发现。

## Verification

从 skill 目录跑 `bash scripts/run-tests.sh`，或从目标仓跑项目已知验证命令。贴全输出。脚本非零退出或打印 `(no test command detected)`：halt，不宣称 done，问用户验证命令；用户也给不出就在 sign-off 明确记 `verification: none -- no command available` 并标为结构性缺口，不是 pass。bug 修复：修复 done 前必须有一个在旧代码上失败的回归测试。

dirty 或多 agent checkout 里本地 build/test 通过不是你改动稳健的证据：树里无关 WIP 可能补上缺失符号、掩盖 break、或因与你无关的原因失败。隔离验证：`git worktree add --detach <known-good-commit>`，只 `git apply` 你自己文件的 diff，在那 build/test。干净隔离的 pass 才是真信号。

## Gotchas

| 出过的问题 | 规则 |
| --- | --- |
| 把公开回复发到错的 issue/PR thread | 动手前 `gh issue view N`/`gh pr view N` 重读，确认标题、作者、当前状态 |
| PR 评论像份报告 | 1-2 句、自然、像同事；不结构化、不 AI 腔 |
| PR 评论用了 bullet | 写成短段落，一段一个想法，先谢贡献者 |
| 新文件名重复了 locale/平台/后缀约定 | 建/改名前查目标目录现有命名约定 |
| 没查 provider 运行时/env 就部署 | 跟项目公开部署文档，对比 provider config 与本地必需 env/运行时 |
| push 因 auth 不匹配失败 | 新项目首次 push 前查 `git remote -v`、当前分支、auth 身份 |

## Sign-off

```
files changed:    N (+X -Y)
scope:            on target / drift: [what]
review depth:     quick / standard / deep
hard stops:       N found, N fixed, N deferred
specialists:      [security, architecture] or none
new tests:        N
doc debt:         none / AGENTS.md needs X
verification:     [command] -> pass / fail
```
