# example：一条 idea 走完整条技能链路（dogfood）

这是 kaelen/skills 的自吃狗粮样例。拿一个真实小 idea —— **确定性 URL 短链 CLI** ——
从"该不该做"一路走到"复盘"，每一步都唤起对应 skill，并把它真实产出的工件落盘。
代码是真的、测试能跑、hunt 抓的是一个真埋进去的根因 bug。

读这个 example 有两个用途：

1. **看链路怎么协作**：每个 skill 不是孤立的，前一个的产出是后一个的输入，`Not for` 边界把请求分流到对的 skill。
2. **看每个 skill 的产出长什么样**：`chain/` 下每篇就是那个 skill 跑完会留下的东西。

## 链路顺序

```
该不该做        想清楚        评审计划       动手           找根因         发布前      发布         复盘
office-hours →  think    →   plan-review →  tdd        →   hunt       →   check   →  ship-small → retro
                scope-guard                                                                       document
                            decision-log 贯穿全程
```

| 步骤 | skill | 产出工件 | 这一步发生了什么 |
|------|-------|---------|----------------|
| 0 | [office-hours](chain/00-office-hours.md) | 六问纪要 | 逼问"短链还用自己写？"，结论：作为离线确定性工具有窄场景，值得做 |
| 1 | [think](chain/01-think-plan.md) | 决策完整的计划 | 一次一问敲定"确定性 = 纯函数散列"这个核心前提 |
| 2 | [plan-review](chain/02-plan-review.md) | 多视角打分 | 架构视角点出"散列里别掺运行时状态"，为后面的 bug 埋下伏笔 |
| 3 | [scope-guard](chain/03-scope-guard.md) | 不做清单 | 砍掉碰撞处理、自定义短码、删除命令，切出 MVP |
| - | [decision-log](chain/04-decision-log.md) | 两条 ADR | 记下"为何忽略碰撞""为何拒绝随机 salt" |
| 4 | [tdd](chain/05-tdd.md) | 红绿记录 + 真测试 | 6 条单进程测试全绿，工具上线 |
| 5 | [hunt](chain/06-hunt.md) | 根因报告 + 回归测试 | 线上"同一链接每次短码不同"，建可复现回路，定位到随机 salt，修复 |
| 6 | [check](chain/07-check.md) | 自审 + 安全门禁 | 对抗式过一遍 diff，挡住 expand 的存储信任问题 |
| 7 | [ship-small](chain/08-ship-small.md) | 切片计划 | 把"工具 + 修复"拆成三个能独立验证回滚的切片 |
| 8 | [retro](chain/09-retro.md) | 复盘 | 从这段历史回看：测试绿 ≠ 正确，盲区在跨进程 |

## 真代码在哪

`app/` 是真能跑的 TypeScript（Node 24 原生跑 .ts，零依赖）：

```bash
cd app
npm test                                 # 8 个测试，全绿
node src/cli.ts shorten https://anthropic.com   # 缩短
node src/cli.ts list                            # 列出
node src/cli.ts expand <code>                    # 还原
```

工具自己的使用文档见 [app/README.md](app/README.md)（document skill 的产出）。

## 哪些 skill 没在这条链路里出现，为什么

诚实标注覆盖范围（这本身就是 dogfood 的反馈）：

- **prototype / improve-arch / zoom-out**：这个工具一个文件就装下，没有"先抛弃式验证"或"降耦合""画地图"的需要。链路够大才用得上。
- **design / write / learn / read / handoff / health**：分别是 UI、文案、研究、读链接、会话交接、配置体检，与一个无界面的小 CLI 不沾边。
- **document** 只产出了工具的 README，没动仓库主文档，因为这是隔离的 example。

也就是说：20 个 skill 里，一个**纯后端小工具**自然会触发的是这 11 个。这正是 `when_to_use` + `Not for` 边界在起作用 —— 不该触发的不硬凑。
