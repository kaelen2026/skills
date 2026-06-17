---
name: write
description: "Rewrites and polishes Chinese or English prose, strips AI-sounding wording, and grounds public copy in real product facts for READMEs, docs, release notes, launch posts, and issue replies. Use when users ask 帮我写/改稿/润色/去AI味/写一段/审稿/发布说明/tweet/rewrite/proofread. Not for fetching a URL or PDF to read (use read) or for multi-source research drafts (use learn)."
when_to_use: "帮我写, 改稿, 润色, 去AI味, 写一段, 审稿, 文档review, README, 发布说明, release notes, changelog, 本地化文案, i18n copy, 推特, twitter, X推文, tweet, 发文, 回复issue, reply to PR, 连贯性, 段落连贯, draft, edit text, proofread, sound natural, polish, rewrite"
dispatch_intent: "Polish or rewrite prose, kill AI tone, draft release notes and launch/social/issue copy"
---

# write: 删掉 AI 味，不是加词

独立开发者的 README、文档、发布说明、上线推文、issue 回复全要自己写，且没有第二个人帮你冷读一遍"这听着像不像机器写的"。这个 skill 就是那个冷读的人：保住你的原意和声音，删掉 AI 表演式的措辞，而不是把词换得更"高级"。失败模式有两个，一样糟：过度编辑（把你的口语和节奏抹成通稿）和欠编辑（AI 痕迹原样留着）。

## Outcome Contract

- Outcome: 文字保住作者原意，读起来像目标读者场景下一个真人写的。
- Done when: 语义、事实、结构不变（除非用户要求改），AI 味措辞被删，没有破折号。
- Evidence: 待改的原文、目标读者、项目既有风格、当前发布/产品状态、要求的语言。
- Output: 只返回改后的文字。除非用户明确要 notes / 变体 / 评审意见。

## Core Stance

- 这是一份"气味目录"，不是从头跑到尾的检查表。references 很长是因为多轮积累的例子，不要把每条规则都套到每段文字上。套更多规则不等于改得更好。
- 过度编辑就是失败，和欠编辑等价。句子已经自然、清楚、稳定，就别动。多数润色是减法（删重复、删收尾总结、删复述结论），不是逐句换词。
- 作者的声音赢。保留作者既有的口语、节奏、立场。规则与作者刻意的选择（叙事体里的疑问句标题、作者想保留的列表）冲突时，作者赢。规则是默认值，不是法律。
- 禁词表和替换表是例子，不是查找替换。一个被点名的词在上下文里读着自然就留着。匹配气味，不匹配字符串。
- 宁可少改而重，不要多改而碎。三处要紧的改动，胜过三十处把声音磨平的机械替换。

## Pre-flight

1. 有原文吗？用户只给了指令没给要改的文字，一句话问要原文，不要开始编。
2. 读者锁定了吗？读者不清楚又无法从文字推断（博客读者 vs RFC vs 邮件），先问。给新手看和给资深架构师看的文字应该完全不同。
3. 语言看"被改的文字"判断，不看用户的指令语言，据此加载 reference：
   - 中文 + 发布说明/社交贴 → `references/write-zh-release-notes.md`
   - 中文 + 双语/翻译校对 → `references/write-zh-bilingual.md`
   - 多语言/站点本地化文案审查 → `references/write-product-localization.md`（含中文时再加载 `write-zh-bilingual.md`）
   - 中文散文（默认）→ `references/write-zh-prose.md`（速查）；要全量 AI 味目录时加载 `references/write-zh.md`
   - 其它 → `references/write-en.md`

加载后再改。不解释改了什么，除非用户明确要。

## 模式

只在场景确实分叉时启用对应模式，其余走默认润色。

**Activate when**: 改一篇 Markdown 长文（> ~300 行，或多个 `##` 节带表格图片）。
长文的主要问题是结构性的：同一份清单在多节重复、正文复读上方表格、整段冗余。单遍逐句润色看不见也修不掉这一半，所以长文模式覆盖两条 Hard Rule：结构性删并入内、产出是"改动点"供评审而不是一坨重写文。先只读不改地列出每个 `##`、表格、列表、图片，标出跨节重复 / 表格复读 / 冗余段；把删并作为 before→after 改动点让用户挑；再逐节做句级去 AI 味。不要对一篇几万字长文做单遍重写：会静默覆盖作者手调的措辞，且无法作为 diff 评审。结构内容规则见 `references/write-zh.md` 的「结构级重复与表格复读（长文专项）」。

**Activate when**: 写 release notes / changelog / 发布说明。
先读项目既有发布源当风格基准（`CLAUDE.md` 的发布约定、既有 changelog；GitHub 项目用 `gh release view --json body -R <owner>/<repo>`），匹配它的条目数、句长、语气，不要自创格式。按用户可感知的功能分组（按产品面或用户可见动词），不按内部分类（"杂项优化""Chores"不是用户能行动的类别）。从 `git log <last-tag>..HEAD` 抽取，每个 `feat:`/`fix:` 都看，每条一句话说用户可见的变化而非实现。细节见 `references/write-zh-release-notes.md`。

**Activate when**: 写 tweet / X 推文 / 上线发文。
独立开发者发产品的五条：以社区开头（star 数、用户致谢、谁的反馈推动了修复），变化跟在后面；挑 2-4 个最有意思的点，丢掉整条没关系；用"你用它的时候…"而非"这个工具做了…"；至少一句有观点的话讲清为什么这么决定；用地道中文节奏，避免翻译腔。结尾用一句轻松的邀请去试，不要"立即升级"这种 CTA。

**Activate when**: 回复 GitHub issue / PR。
发前用 `gh issue view <num>` / `gh pr view <num>` 重读实时内容，不要凭记忆回。开头 `@<reporter>` + 一句致谢（匹配对方语言），无感叹号无 emoji；然后一句原因一句影响；然后给发布状态（已发 v<X.Y.Z> / 已在 main 下个版本发 / 计划 v<X.Y.Z> / 不做并给替代路径），没有当回合发布证据就不要写"已发布"。最多两段，不写 bullet 不写小标题。这是给用户看的最终文案，不是你的过程日志，不要写"刚才我判断错了"之类的元叙述。

**Activate when**: 审稿 / 检查文档 / PDF。
先做隐私扫描：检测 PII（姓名、公司、雇佣日期、薪资暗示、定位细节），任何文字暗示求职、竞品信息、个人数据泄露则硬停。再查语气一致性、双语术语一致性、残留占位符（`Lorem ipsum`、`TODO`、`[TBD]`）、坏图链。若文档本身是评审报告/打分卡/诊断快照，标出带日期的断言、过期行号、私有路径、当前分数式表述，建议抽成稳定规则而不是把快照当长青指南。输出在改后文字末尾追加 `privacy: clear / N issues found`。

**Activate when**: 检查连贯性 / 段落顺不顺。
不要重写。逐段过：标出无信号词的突兀转题、开头句接不上上段结尾、节奏问题（整段句长单调）。每条给最小修法（一个词、一处换序、一句过渡），输出带段落定位的编号清单，再问用户要不要应用。

## Hard Rules

- 语义第一，风格第二。删一个 AI 痕迹会改掉作者原意，就留原文。
- 不静默重构。除非明确要求，不重排标题、不调段序、不合并节，原地改。（长文模式例外：结构性删并入内，但仍作为改动点先提出而非静默执行。）
- 对外文案的事实必须有据。README、发布说明、社交贴、产品页、公开回复里的事实断言要落在真实素材上：当前应用行为、可运行产物、截图、产品页、发布页、changelog、issue/PR、用户给的草稿。不要把交接稿、计划、旧记忆、过期截图当成当前产品真相，也不要把具体产品证据稀释成通用营销话术。
- 禁英文破折号。中英文输出都绝不产出落单的 em-dash（U+2014）或 en-dash（U+2013），它是这类写作里最强的 AI 指纹。用逗号、句号、冒号、分号或括号断句。改稿时遇到原文的英文破折号，全部替换后再返回。
- 输出后即停。交付改后文字，不追加改动清单、不附理由、不写结尾收束。（长文模式例外：返回改动点供评审。）

## Gotchas

| 真实翻车 | 规则 |
|---|---|
| 没被要求就重排了标题 | 不重构，原地改，除非明确要求改结构 |
| 重写后又附了一段"改了哪些" | 输出只是改后文字，无 changelog 无评论 |
| 给博客草稿用了正式书面腔 | 匹配读者语域，博客是口语不是学术 |
| 把中英空格规则套到纯英文上 | 半角/全角间距规则只在中英混排时用 |
| 把作者的声音润成了通用上线文案 | 保留作者的节奏与立场，用真实产品证据去磨事实而非替换声音 |
| 凭记忆或交接稿写发布/社交文案 | 先读当前发布页、changelog、issue/PR、可运行产物、产品页、截图或用户给的素材 |
| 把评审报告润得像永恒真理 | 快照就标成快照，或抽成稳定规则，不要把带日期的断言写成长青 |

## Output

只返回改后的文字。若原文被截断或存在多种合理版本，正文后用一句话说明，否则不加任何包裹、前言、后记。
