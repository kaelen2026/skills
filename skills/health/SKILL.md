---
name: health
description: "Audits the current project's agent setup and AI-coding maintainability: instruction/config drift across Claude/Codex/AGENTS files, hooks/MCP, permission and security floor, verifier surfaces, and code-rot signals. Use when users ask 检查claude/检查codex/配置检查/健康度 or report agents ignoring instructions, missing validation, or code getting hard to maintain. Not for debugging a specific bug (use hunt) or reviewing a diff/PR (use check)."
when_to_use: "检查claude, 检查codex, 检查配置, Codex 配置, AGENTS.md, config.toml, agent instructions, 健康度, 配置检查, 配置对不对, AI coding 腐化, 代码变烂, 维护性, 上下文混乱, 验证缺失, 验证命令失真, Claude ignoring instructions, check config, settings not working, audit config"
dispatch_intent: "Agent config audit, instructions ignored, hooks/MCP broken, missing verification, AI-coding code rot"
---

# health: 给一个人维护的项目体检它的 agent 配置与可维护性

独立开发者把 agent 当成整个团队来用，但没人帮你检查这套配置是否在悄悄漂移：指令分散在 CLAUDE.md / AGENTS.md / config.toml 几处互相打架、hook 没真的触发、MCP 早挂了、没有一条能跑的验证命令、热点文件越长越没人界定边界。代码慢慢变烂，你却找不到那条"早该写下来却没写"的规则。这个 skill 沿
`agent config → instruction surfaces → tools/runtime → verifiers → maintainability`
这条链找违规、指出错位的那一层、按项目复杂度校准。失败模式：第一次就烧光 token 跑深审、把"缺 docs/specs"当失败、把评审打分卡当成可维护性文档。

两条赛道共用一份报告：
- Agent 配置健康：Claude/Codex/AGENTS 指令漂移、权限、hooks、MCP、skills、记忆供应链。
- AI 可维护性健康：项目上下文面、验证器封装、生成物检查、热点归属、过期或误导的耐久文档。

输出语言按序判定：(1) 项目 agent 指令（AGENTS.md 优先于运行时专属文件）；(2) 全局 agent 指令；(3) 用户近期语言；(4) 英文。

## Outcome Contract

- Outcome: 一份预算可控的健康报告，把 agent 配置风险和 AI 可维护性风险分开。
- Done when: 每条发现都点名错位的层、具体证据、和一条可直接粘贴的动作或诊断命令。
- Evidence: 采集脚本输出、被跟踪的项目指令、运行时配置摘要、验证器日志、hooks/MCP 面、必要时的实时探测。
- Output: 按优先级排的发现（状态、影响、下一步动作），或一份残留风险清晰的"健康"结论。

## Core Stance

- 预算优先。默认只跑 summary 审计。读全量对话提取、起 inspector 子 agent 是深审工具，不是 Standard 项目的默认路径。升级深审前告诉用户它会显著消耗 token。
- 每条 `Action:` 必须可粘贴。绝不写"investigate X""consider Y"。修法未知就给诊断命令。
- 按项目分层校准，只套对应 tier 的要求。绝不把 Complex 的检查套到 Simple 项目。
- 不当重型 lint / typecheck / 架构重写替身。health 只报可维护性护栏和具体下一步。
- 绝不未确认自动应用修复。

## Step 0：判定 tier

| Tier | 信号 | 期望 |
|---|---|---|
| Simple | <500 文件，1 贡献者，无 CI | 只要 CLAUDE.md；0-1 个 skill；hook 可选 |
| Standard | 500-5K 文件，小团队或 CI | CLAUDE.md + 1-2 条 rules；2-4 个 skill；基础 hook |
| Complex | >5K 文件，多贡献者，活跃 CI | 完整六层配置 |

## Step 1：采集数据

先跑 summary 模式，先别解读：

```bash
HEALTH_SCRIPT="${CLAUDE_SKILL_DIR:+$CLAUDE_SKILL_DIR/scripts/collect-data.sh}"
[ -f "${HEALTH_SCRIPT:-}" ] || HEALTH_SCRIPT="./skills/health/scripts/collect-data.sh"
if [ ! -f "$HEALTH_SCRIPT" ]; then
  echo "health collect-data.sh not found; set CLAUDE_SKILL_DIR or run from the skills repo root"
  exit 1
fi
bash "$HEALTH_SCRIPT"
```

某些节显示 `(unavailable)`（缺 `jq` → 对话节不可用；缺 `python3` → MCP/hooks/allowedTools 节不可用；缺 `settings.local.json` → hooks/MCP 可能不可用，全局-only 配置下正常）。把 `(unavailable)` 当数据不足，不当发现，不要去 flag 那些区域。

采集器含运行时专属面（`AGENT CONFIG SUMMARY`/`DETAIL`：Claude、Codex、项目指令文件）和 agent 无关面（`AI MAINTAINABILITY SUMMARY`/`DETAIL`：项目形态、验证面、热点归属、封装、文档链接）。

## Step 1b：MCP 实时检查

每个 MCP server 调一个无害工具，记 `live=yes/no` 与错误细节。尊重 `enabled: false`（跳过不 flag）。API key 只检查环境变量是否设置（`echo $VAR | head -c 5`），绝不打印完整 key。

## Step 1c：安全基线

每次审计都跑，不分 tier，这是地板不是天花板。

- 拒绝清单地板：仅当项目/运行时暴露 agent 权限、hook、MCP、allowed/denied tools 或有据的自治启动器时适用。设置至少应拒绝：凭证与密钥目录（SSH、云厂商、GPG、gh CLI）、密钥文件（`.env`、`credentials*`、`secrets*`）、管道装机器（`curl ... | bash`、`wget ... | sh`）、出站 shell（`ssh`、`scp`、`nc`）。报成一条简洁 WARN 列出缺失类别与建议修法；无 agent 设置面则报"不适用"而非失败。
- 环境覆盖面：当成攻击面，在被跟踪文件或随包设置里出现且无理由注释时报告：API base-URL 覆盖（把流量重定向到第三方）、对项目本地 MCP 的自动信任、通配工具白名单（`allowedTools: ["*"]`）、跳权限标志（`--dangerously-skip-permissions` 等）。只打印 file:line 与 key 名，绝不打印密钥。
- 记忆与 skill 供应链：第三方 skill/插件/MCP 以用户权限运行。审记忆库有无密钥/token（Critical）与不可信运行写入的条目（建议轮换）；第三方来源应钉到 release tag 或 revision（非 `main`/分支/远端 marketplace 跟最新 head），hook handler 不写凭证目录，MCP 有显式用户同意。未钉来源/未审 hook 报 Structural 而非 Critical，除非有活跃利用信号。
- 长跑 agent 停止条件：用了 loop/自治/长跑流程的项目，须在被跟踪的项目文档里定义显式停止条件（无进展、重复同一失败、超预算、外部阻塞）；缺失各报一条 Structural。能用 hook（PostToolUse）就别只靠 prompt：hook 跳不掉，prompt 会被忘。

## Step 2：分析

确认 tier 后路由：
- Simple：本地分析，不起子 agent。
- Standard：从 summary 输出本地分析，默认不起子 agent。用户要深/完整/彻底审计，或本地无法归类某安全/控制问题时，升级深审并说明 token 成本。
- Complex / 记忆里有深审偏好 / 显式要深审或 AI 可维护性审计：用 `bash "$HEALTH_SCRIPT" auto deep` 重采，并行起子 agent，凭证脱敏成 `[REDACTED]`。
  - Agent 1（上下文+安全）：读 `agents/inspector-context.md`，喂 `CONVERSATION SIGNALS` 节。
  - Agent 2（控制+行为）：读 `agents/inspector-control.md`，喂检测到的 tier。
  - Agent 3（AI 可维护性）：读 `agents/inspector-maintainability.md`，只喂 `TIER METRICS`、`AI MAINTAINABILITY SUMMARY`/`DETAIL`、脚本热点列表。仅深审/Complex/显式代码腐化请求时起。
- Fallback：子 agent 失败就本地分析那一层，注明"(analyzed locally)"。

## Step 3：报告

标题 `Health Report: {project} ({tier} tier, {file_count} files)`，先列通过项（表格，最多 5 行）。每条发现：

```
- [severity] <症状> ({file}:{line} 如已知)
  Why: <一行原因>
  Action: <可直接粘贴的命令或编辑>
```

- `[!] Critical`：违反的规则、危险 allowedTools、MCP 开销 >12.5%、安全发现、泄露的凭证。
- `[~] Structural`：指令在错的层、缺 hook、超长描述、验证器缺口。详见下方各检查与对应脚本。
- `[-] Incremental`：过时项、全局 vs 本地放置、上下文卫生、过期 allowedTools。

无问题则：`All relevant checks passed. Nothing to fix.`

各 Structural 检查从项目根快速核查：

```bash
bash skills/health/scripts/check-agent-context.sh . summary    # 指令漂移
bash skills/health/scripts/check-maintainability.sh . summary   # 可维护性缺口（深审用 deep）
bash skills/health/scripts/check-doc-refs.sh .                  # 坏文档引用
bash skills/health/scripts/check-verifier-output.sh . <log>     # 过期验证器缓存输出（仅解析已有日志）
```

判定要点：
- 指令漂移：AGENTS.md 与运行时专属文件都含大量指引却不委派、Codex `config.toml` 未信任当前项目、缺项目指令、运行时指令与共享真相源矛盾、重要规则只在被忽略的私有 overlay 里而被跟踪文档缺失。不打印原始配置值，密钥只作 `[REDACTED]`。
- 可维护性缺口：无可执行验证命令 / 非平凡仓库无 agent 指令面 / 坏文档引用 → `FAIL`；指令缺项目地图、验证指引、边界/非目标语言、TODO/HACK 聚集、大热点无归属与验证、耐久文档塞了一次性评审报告/打分卡/带日期行号 → `WARN`。缺 `docs/`、`specs/`、`HANDOFF.md`、`CHANGELOG`、issue/PR 模板默认按 informational，除非复杂度使其成为交接必需。
- 集中修复链：`git log --oneline --since='2 weeks ago' | grep -i fix` 按区域分组，同一区域 2 周内 3+ 次 fix 报 Structural WARN，提示加一条捕捉那些 fix 在收敛的不变量的规则。同一文件被改 4+ 次比散在不同文件更强。
- 坏文档引用：扫 `AGENTS.md`、`CLAUDE.md`、`.claude/rules/*.md`、每个 skill 的 `SKILL.md` 里 `@<path>`、`~/.claude/...`、`docs/<name>.md`、`references/<name>.md` 形态的引用，逐个核查目标是否在盘上，报"引用却缺失"的指针带源文件与行。报成 Structural，除非缺的文件是硬依赖。

## Gotchas

| 真实翻车 | 规则 |
|---|---|
| 漏了本地覆盖 | 也要读 `settings.local.json`，它会遮蔽被提交的文件 |
| 把子 agent 超时当成 MCP 失败 | MCP 失败来自实时探测，不是数据采集 |
| 用错语言报告 | 先遵从 CLAUDE.md 的沟通规则 |
| 把刻意吵闹的 hook 当成坏的 | 称一个 hook"坏了"之前先问 |
| hook 像没触发其实触发了，被后渲染的 UI 元素盖住 | hook 触发顺序不等于视觉顺序，重改前先 `--debug` 或管道确认，再查是否有 diff/权限弹窗盖在上面 |
| 第一次跑就烧太多 token | 先留在 summary 模式，全量对话提取和 inspector 子 agent 是深审工具 |
| 把缺 specs/docs 当失败 | 决策产物默认可选，仅当 tier/交接风险/用户请求使其必要时才升级 |
| 把被忽略的 AGENTS/CLAUDE 当耐久真相 | 报告规则是否被跟踪与分发，耐久修复属于公开仓库文档或随包 skill/rule |
| 把评审打分卡当可维护性文档 | 打分卡是快照，抽出不变量与验证路径，再移除/归档报告 |

## Non-goals

- 绝不未确认自动应用修复。
- 绝不把 Complex 检查套到 Simple 项目。
- 绝不当重型 lint / typecheck / 去重 / 架构重写的替身。
