# 技术 SEO 审计清单

按这个顺序查：让页面根本进不了索引的硬伤排在最前，先排掉它们，再往下。每一项都基于真实渲染后的 HTML、路由或 HTTP headers 判断，不凭通用印象。

## 1. 可抓取（爬虫能不能拿到这一页）

- **robots.txt**：取 `/robots.txt`，确认目标路径没被 `Disallow`。常见事故：上线时把 staging 的 `Disallow: /` 带到了生产，整站不被抓。
- **链接可达**：目标页有没有从站内其它页面链到？孤岛页（只有直接输 URL 能到）爬虫发现不了。
- **HTTP 状态**：目标 URL 返回 200，不是软 404（页面正常显示但实际内容是"找不到"）、不是 5xx、不是无谓的链式重定向。
- **服务端可访问性**：需要登录、被 WAF 拦 Googlebot、geo 限制，都会让爬虫拿不到内容。

## 2. 可索引（抓到了能不能进索引）

- **meta robots**：`<meta name="robots" content="noindex">` 会把页面排除出索引。检查目标页 HTML 里有没有，常见于从模板继承了 noindex。
- **X-Robots-Tag**：同样的 noindex 可能在 HTTP response header 里，HTML 看不到，要看 headers。
- **canonical 自指**：页面 `<link rel="canonical">` 指向自己（或正确的规范 URL），别指错到别的页面导致自己不被索引。

## 3. canonical 与重复内容

权重为零的站最怕自己跟自己抢排名。

- **URL 归一**：`http/https`、`www/非 www`、末尾斜杠有无、大小写、带 query 参数、分页 —— 同一内容多个 URL，要用 canonical 指向唯一规范形态，并用 301 把变体收敛。
- **跨页重复**：模板化页面（如多个标签页、筛选组合）内容高度雷同会被判薄内容。合并、canonical、或 noindex 低价值变体。
- **分页**：列表分页用 canonical 指向自身（不是都指第一页），保证深层内容可被索引。

## 4. sitemap 与 robots

- **sitemap.xml**：列出希望被索引的规范 URL，只放 200、可索引、canonical 自指的页面。别把 noindex / 重定向 / 404 塞进 sitemap。
- **robots.txt 里声明 sitemap**：`Sitemap: https://站点/sitemap.xml`。
- **改这两个文件影响全站**，动手前讲清影响、让用户确认（见 Hard Rules）。

## 5. 结构化数据（structured data）

- 用 JSON-LD（`<script type="application/ld+json">`），按页面类型选 schema：文章 `Article`、教程 `HowTo`、产品 `Product`、FAQ `FAQPage`、面包屑 `BreadcrumbList`、软件 `SoftwareApplication`。
- **只反映页面可见内容**：schema 里的评分、价格、步骤必须页面上真有，否则算 spam 被惩罚。
- 加完用 Google 富媒体结果测试 / Schema.org validator 验语法。

## 6. 渲染与性能

- **渲染方式**：CSR（首屏内容靠客户端 JS 渲染）的页面，搜索引擎可能拿到的是空壳。落地页优先 SSR / 静态生成 / 预渲染。判断方法：禁用 JS 或看 "查看源代码"（不是 DevTools 的 Elements），首屏正文在不在。
- **Core Web Vitals**：LCP（加载）、INP（交互）、CLS（布局偏移）是排名信号。大图、阻塞渲染的脚本、无尺寸的图片是常见拖累。
- **移动友好**：移动优先索引，确认 viewport meta、响应式、可点区域。
- **HTTPS**：全站 HTTPS，混合内容会降信任。

## 7. on-page 基础元素（与内容意图模式衔接）

- `<title>`：每页唯一，含主查询，自然语言。
- `<meta name="description">`：每页唯一，对齐意图，缺了 SERP 会截首段。
- 一个 `<h1>`，标题层级（h1→h2→h3）反映内容结构。
- 图片 `alt`：描述性、对视障与图片搜索都有用，不堆关键词。
- 内链：用描述性锚文本把相关页面连起来，把权重导给重点页。

这一层的判断与模板见 `content-intent.md`。
