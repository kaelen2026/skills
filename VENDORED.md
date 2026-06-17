# Vendored 资产

本包大多数 skill 的 `SKILL.md` 正文和 `references/*.md` 已**重写**为中文、按独立开发者视角适配。但下面这些**支撑脚本和 inspector/reviewer agent** 是从上游近乎原样搬来的工具代码（MIT），只做了去除上游专有路径/措辞的最小清理：

| 路径 | 来源 | 作用 |
|---|---|---|
| `skills/health/scripts/*` | tw93/waza | 配置/可维护性体检的采集与检查脚本（`collect-data.sh` 751 行等） |
| `skills/health/agents/inspector-*.md` | tw93/waza | health 深审的 inspector 子 agent 提示词 |
| `skills/check/scripts/*` | tw93/waza | 项目体检信号采集（`audit_signals.py`）与测试运行 |
| `skills/check/agents/reviewer-*.md` | tw93/waza | check specialist 评审子 agent 提示词 |
| `skills/read/scripts/*` | tw93/waza | URL/PDF 抓取器（飞书/微信/本地/通用） |

## 给维护者的规则

- **别为了风格手改这些文件。** 它们的体量（600 到 750 行）和写法是上游决定的，不是本包的债。`bin/check.sh` 的禁破折号等规则针对的是**自写 prose**，不针对这些 vendored 工具（`.sh`/`.py` 本就不在扫描范围；`.md` agent 已符合规则）。
- **要改行为，优先回上游对照**（[tw93/waza](https://github.com/tw93/waza)），保持 diff 最小，别就地大改导致与上游分叉、日后难同步。
- 方法论层面的完整归属见 [README](./README.md) 致谢段与 [LICENSE](./LICENSE)。
