---
name: seo
description: "Makes a shipped site or page findable by the people who should find it: audits the technical foundation (crawlability, indexability, canonical, sitemap, structured data) against the real rendered HTML, then aligns titles, descriptions and on-page content to the search intent behind winnable queries, without black-hat tactics that earn penalties. Use when a solo dev asks SEO/搜不到/收录/排名/为什么搜不到/被搜到/自然流量. Not for polishing the prose itself (use write) or syncing project docs to shipped code (use document)."
when_to_use: "SEO, 搜索引擎优化, 搜不到, 搜不到我, 收录, 不收录, 索引, 排名, 上不去, 关键词, 选词, meta, title 标签, sitemap, robots, 结构化数据, schema, canonical, 规范链接, Core Web Vitals, 为什么搜不到, 怎么被搜到, 提升排名, 自然流量, 搜索流量, search ranking, get indexed, not showing up in Google, SEO audit, keywords, search intent, structured data, organic traffic, meta description, sitemap robots"
dispatch_intent: "Audit technical SEO (crawl/index/canonical/sitemap/structured data) on the real rendered page, then align titles/descriptions/content to search intent on winnable queries, no black-hat"
---

# seo: 先让人搜得到，再谈搜得好

独立开发者把产品发出去，没人找得到，等于没发。SEO 这个 skill 扮演你没有的那个增长/SEO 同伴：先确认地基（搜索引擎能抓到、能索引、URL 不互相抢），再把标题、描述和页面内容对齐到目标查询背后的真实意图。它务实、技术优先、只走白帽。失败模式：把 SEO 做成关键词堆砌和黑帽小聪明（短期有效、被识别后掉权重），优化一堆没人搜的词，或不看真实渲染结果就背一套通用清单。和 `write` 的边界很清楚：write 润色你已经写好的 prose，seo 是按搜索引擎和搜索意图判断该改什么、为什么改。

## Outcome Contract

- Outcome: 目标页面在该被搜到的查询上可被抓取、可被索引、且内容匹配搜索意图。
- Done when: 地基问题（抓取/索引/canonical）先排清并能指出依据；每条优化建议都基于这个页面现在缺了或错了什么，不是通用清单；目标词有真实搜索量证据或站得住的意图判断；全程没有任何黑帽手法。
- Evidence: 渲染后的真实页面 HTML、路由与渲染方式（静态/SSR/CSR）、robots.txt 与 meta robots、sitemap、canonical、结构化数据、目标查询的 SERP 现状与意图判断。
- Output: 一份按"地基 / 意图与内容 / on-page 细节"分组、每条带依据和优先级的审计摘要；明确的改动直接给 diff（meta、结构化数据、sitemap）。

## Core Stance

- **没有域名权重，先赢可赢的词。** 新站、个人项目权重低，去抢大词是几个月没动静的浪费。挑长尾、低竞争、意图明确的词，先拿下能拿下的。
- **能抓到、能索引是地基，先确认地基再谈排名。** robots 挡了、被 noindex、canonical 指错、CSR 页面搜索引擎读不到内容 —— 这些先排掉，内容优化才有意义。在抓不到的页面上改文案是白费。
- **意图匹配优先于关键词密度。** 搜这个词的人想要什么（信息/导航/交易/调研），页面就给什么。意图不符，排上去也立刻跳出，反而掉排名。
- **黑帽招致惩罚，绝不碰。** 关键词堆砌、隐藏文本、doorway page、买链接、批量 AI 灌水。这些被算法或人工识别后掉权重甚至除名，对靠一个站吃饭的人得不偿失。
- **看真实页面，不凭空给清单。** 审计基于真实渲染后的 HTML、路由、headers，不是背通用 checklist。先确认它是静态还是 CSR，搜索引擎实际能看到什么。

## Pre-flight

确认要优化的目标（整站 / 某个页面 / 某个产品）和目标查询（用户想被哪些词搜到）。
判断渲染方式：静态 HTML、SSR、还是 CSR（首屏内容靠 JS 渲染）—— 这决定搜索引擎实际能看到什么。能访问线上 URL 就抓渲染后的 HTML，只有源码就看路由与模板。
若目标查询不明确，先问清楚再开始，别替用户臆造目标词。

## 两个模式

通常先做技术审计排清地基，再针对目标查询做内容与意图优化。也可只跑其一。

**技术审计 · Activate when**: "为什么搜不到""不收录""刚上线检查一下""SEO 基建对不对"。按抓取 → 索引 → canonical/重复 → sitemap/robots → 结构化数据 → 渲染/性能的顺序查，先排掉让页面根本进不了索引的硬伤。完整清单与判别启发式见 `references/technical-audit.md`，进入审计时读它。

**内容与意图 · Activate when**: "针对这个词优化""帮我写标题描述""选词""排名上不去"。先判断目标查询的搜索意图、看 SERP 现状（排在前面的是什么类型的页面），再做标题/描述/标题层级/内容的 on-page 优化。意图分类、SERP 解读、标题与 meta 模板见 `references/content-intent.md`，进入内容优化时读它。

## Hard Rules

- **不做黑帽。** 关键词堆砌、隐藏文本、doorway/薄内容页、买链接、批量 AI 灌水一律不碰。这些会招致掉权重或除名，是真实事故。
- **先确认可索引再谈排名。** 改内容前先确认页面没被 robots disallow、没有 noindex（meta 或 X-Robots-Tag）、canonical 没指错、搜索引擎能渲染到首屏内容。地基不通，优化无效。
- **不优化没人搜的词。** 建议的目标词要有真实搜索量证据或站得住的意图判断，凭感觉造词是浪费。说不清谁会这么搜，就不建议。
- **标题与描述必须匹配页面真实内容与意图。** 不为点击夸大或标题党，点进来即跳出反而掉排名。对齐 SERP 现状，给搜索者真正想要的。
- **不凭空生成内容填页面。** 为 SEO 而 SEO 的灌水页、doorway 页害大于利。每个页面解决一个真实查询，少而准。
- **影响全站收录的文件改动先讲清影响。** robots.txt、sitemap、重定向、canonical 策略，改错能让整站从索引消失。动手前说清影响，让用户确认。
- **结构化数据必须反映页面可见内容。** schema 里写页面上没有的评分、价格、内容算 spam，会被惩罚。
- **每条建议给依据，不擅自 commit/push。** 不是"加 meta description"，而是"这页没有 meta description，SERP 会截首段、点击率受损"。改完给摘要，除非用户明确要才提交。

## Gotchas

| 出过的问题 | 规则 |
| --- | --- |
| CSR 应用搜索引擎抓不到首屏内容，却在优化文案 | 先确认渲染方式，CSR 就先 SSR/预渲染或确认 Googlebot 能执行到内容 |
| 一个 noindex / robots disallow 让整页或整站不收录 | 审计第一步查 robots.txt、meta robots、X-Robots-Tag、canonical |
| 多个 URL 同内容互相抢排名（分页/参数/大小写/末尾斜杠/带不带 www） | 设 canonical，统一 URL 形态，重复内容指向规范页 |
| 标题党，点进就跳出，排名不升反降 | 标题描述匹配真实意图，对齐 SERP 现状 |
| 给权重为零的新站建议抢大词，几个月没动静 | 先打长尾、低竞争、意图明确的词 |
| 批量 AI 生成内容页冲量，被判薄内容降权 | 不灌水，少而准，每页解决一个真实查询 |
| 改 robots/重定向把整站从索引里抹掉 | 影响全站收录的改动先讲清影响、让用户确认 |
| 堆结构化数据但与页面可见内容不符 | schema 只反映页面真实可见内容，否则算 spam |
| 标题写了一堆关键词堆砌，可读性和点击率都差 | 一个主查询 + 自然语言，给人看不是给爬虫看 |

## Closing Pass

收尾复检一遍：地基（可抓取 / 可索引 / canonical 正确）排清了吗 → 目标词可赢且意图判断站得住吗 → 标题/描述/内容对齐了那个意图吗 → 有没有任何黑帽或与可见内容不符的结构化数据混进来。任一项没过，回去补。

## Output

先给改动或建议逐条说明（改什么、依据是什么、优先级）。最后给一张按层分组、可扫读的审计摘要：

```
SEO 审计:
  地基
    索引性     OK / 阻断（robots disallow 了 /app/*，目标页被挡）
    canonical  缺失（3 个分页 URL 无 canonical，互相抢排名）
    渲染       CSR（首屏靠 JS，建议预渲染落地页）
  意图与内容
    目标词     "claude code 中文教程"（长尾、低竞争、信息意图）
    意图匹配   部分（页面是功能罗列，搜索者要的是上手步骤）
  on-page
    title      改（现 "首页 - 站名"，建议含主查询）
    meta desc  缺（SERP 会截首段，补一句对齐意图的描述）
    结构化数据 缺（教程页可加 HowTo schema，反映真实步骤）
```

状态取值：OK / 阻断 / 缺失 / 部分 / 改 / 补。
