---
name: retro
description: "Reconstructs what an indie dev actually shipped over a window from git history, tracks shipping streak and test-health trend, and persists snapshots so each run compares against the last. Use when a solo dev asks weekly retro/复盘一下/这周发了什么/回顾/retrospective or wants to see their cadence over time. Not for reviewing a specific diff (use check) or planning what to build next (use think)."
when_to_use: "weekly retro, 复盘, 复盘一下, 周复盘, 回顾一下, 这周发了什么, 这段时间干了啥, 最近在忙什么, 节奏怎么样, shipping streak, 连续发布, 测试健康, 趋势, retrospective, what did I ship, what have I been working on, engineering retro, sprint review"
dispatch_intent: "Reconstruct what shipped from git history, track cadence and test-health trends over time, persist and compare retro snapshots"
---

# retro: 一个人开发，没人帮你周会复盘

一个人开发，没有周会、没有 sprint review，没人在周五帮你回头看这周到底发了什么、节奏是变密还是断了、测试是不是又欠债了。这个 skill 用纯 git 历史把这件事做了：它不猜你"应该"做什么，只如实读出 commit 里发生过什么，并把每次快照存下来，下次自己跟自己比。失败模式有两个：把 git log 复述一遍当复盘（没有判断），或编造一段励志总结（数据撑不住的赞美）。

## Outcome Contract

- Outcome: 一段基于本回合真实 git 数据的复盘，说清这个窗口发了什么、节奏与测试健康的走向，以及和上次比是好转还是退步。
- Done when: 每个数字都来自本回合跑过的 git 命令；快照已写入 `.retro/`；有上次快照时给出了趋势对比，首次运行则明说"首次记录"。
- Evidence: 本回合的 `git log` / `git shortlog` / `git diff --shortstat` 输出、测试文件计数、`.retro/` 里的历史快照。
- Output: 直接输出到对话。唯一落盘的是 `.retro/` 下的 JSON 快照，不写其它文件。

## Core Stance

- **只读 git，零外部基建。** 不依赖任何后台服务、telemetry、配置文件、第三方账号。一个有 `.git` 的目录就能跑。装不上、连不上、要登录的东西一律不引入。
- **不写数据撑不住的话。** 每个结论都要能指回一条 commit 或一个数字。说"这周专注"前先看 focus 数据；说"测试欠债"前先数测试文件。没有数据支撑的鼓励等于噪音。
- **单人视角，不做 per-person 分解。** 这是给独立开发者的。默认所有 commit 都是"你"。不要生成团队 leaderboard、不要给"队友"写表扬与成长建议。窗口里出现多作者（机器 co-author、偶尔的协作者），合并计数即可，别拆人。
- **趋势比单点更重要。** 一周的绝对数字意义有限。真正有用的是和上次比:test ratio 在涨还是跌、streak 还在不在、fix 占比是否失控。首次运行没有对比就老实说，别假装有趋势。
- **节奏是观察，不是评判。** 报告何时 commit、session 多长、连续多少天，是为了让你自己看清自己的工作模式，不是 KPI。深夜 cluster、断更几天，如实写，不上价值。

## Pre-flight

确认在 git 仓库内：`git rev-parse --git-dir`。不在就停下说明。
解析参数定窗口（默认 7 天）：`7d`/`14d`/`30d`/`24h`，或 `compare`(本窗口 vs 紧邻的上一个等长窗口)。窗口换算与对齐细节见 `references/windows.md`，需要算 since/until 边界时再读。
定 base 分支：依次 `git symbolic-ref refs/remotes/origin/HEAD`、`origin/main`、`origin/master`，都失败回退本地 `HEAD`。有 remote 才 `git fetch origin --quiet`，纯本地仓直接用本地分支，别因 fetch 失败卡住。

## 复盘要采的数据

按需在仓库根跑（这些彼此独立，可并行）。完整命令清单与字段解释见 `references/git-queries.md`，第一次跑或忘了字段含义时读它。最少要拿到：

- 窗口内 commit:hash、时间、subject、改动文件、增删行（`git log --since=... --shortstat`）
- 测试增删与生产增删的拆分（按路径含 `test`/`spec`/`__tests__` 区分）
- commit 时间戳序列（用于 session 检测与小时分布）
- 测试文件总数（`find` 计数，排除依赖目录）
- 全历史 commit 日期去重（用于 streak，查全历史而非只查窗口）

## 算什么

- **概览表**: commits、净增删 LOC、测试 LOC 占比、活跃天数、检测到的 session 数、PR 数（从 commit message 里的 `#NNN` 提取，无则省略）。
- **节奏**: 小时分布（峰值时段、深夜 cluster）；session 检测用 45 分钟间隔切分，分深(>50min)/中/微会话；窗口内连续发布的 streak。
- **commit 类型**: 按 `feat/fix/refactor/test/chore/docs` 前缀分类占比。fix 占比超 50% 时点出来，可能是"边发边修"，值得留意但不下定论。
- **测试健康**: 测试文件总数、本窗口新增/改动的测试文件数。test ratio < 20% 时标为成长点。这是要跨快照看趋势的核心指标。
- **shipping streak**: 从今天往回数，连续多少天至少有 1 个 commit。查全历史，streak 长度如实报；满 365 天显示 `365+`。

## 趋势对比与持久化

存快照前先读历史：`.retro/` 下最新的 JSON。有上次快照就算关键指标的 delta（test ratio、streak、fix 占比、commits、session 数），输出"Trends vs Last Retro"小节，用箭头标方向。首次运行明说"首次记录，下次再跑就能看趋势"。
快照 schema 与命名规则见 `references/snapshot.md`，写盘前读它。用 Write 工具写 `.retro/<date>-<seq>.json`，同日多次跑递增序号。只存当前窗口；compare 模式不持久化上一个窗口的指标。

## Hard Rules

- **不引入任何外部基建。** 不写 telemetry、不调网络服务、不要求登录、不读写 `~/.gstack` 或任何全局配置。整个 skill 自包含，只碰当前仓库的 git 和 `.retro/`。
- **不做 per-person 分解。** 不生成多人 leaderboard、不给单个作者写 praise/growth。原版的团队功能在这里一律去掉。
- **数字必须来自本回合命令。** 不凭记忆或上文复述 commit 数、LOC、streak。每个写进报告的数都要指向本回合真跑过的 git 输出。
- **streak 查全历史。** 只查窗口内的日期会把长 streak 截断。streak 命令用全历史 commit 日期，窗口参数不限制它。
- **零 commit 不硬凑。** 窗口内没有 commit 就直说"这个窗口没有提交"，建议换更长窗口，不要编一段复盘。
- **只写 `.retro/` 快照，不碰其它文件。** 复盘正文全部输出到对话。不改 README、不写报告 md、不动源码。

## Gotchas

| 出过的问题 | 规则 |
| --- | --- |
| streak 只数了窗口内，长 streak 被截断 | streak 用全历史 commit 日期，与窗口参数解耦 |
| `git log --since=日期` 在傍晚跑，起点变成当时钟点而非当天零点 | day/week 窗口算绝对起始日期，加 `T00:00:00` 后缀对齐午夜 |
| 纯本地仓 `git fetch` 失败导致流程中断 | 先判断有无 remote，无 remote 用本地分支，fetch 失败不致命 |
| 把机器 co-author 当成"队友"拆出一栏 | 单人视角，合并计数；co-author 至多记为 AI 辅助比例，不拆人 |
| 首次运行硬编出"趋势" | 无历史快照就明说首次记录，不造对比 |
| 时间戳按 UTC 报，深夜 cluster 全错位 | 用系统本地时区，不要覆盖 `TZ` |

## Output

先给一行可截图的 tweetable 摘要（窗口、commits、净 LOC、test 占比、streak），再依次给：概览表、Trends vs Last Retro（首次省略）、节奏与 session、shipping velocity、测试健康、本周亮点（最大的那个 ship）、下周可落地的 1-2 个小改进（各 <5 分钟可采纳）。结论锚在具体 commit，鼓励要 earned，成长建议像投资建议而非批评。
