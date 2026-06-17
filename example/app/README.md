# urlshort

> document skill 的产出：跟着已发代码同步的工具使用文档。

确定性 URL 短链 CLI。同一个 URL 永远缩成同一个短码，纯函数计算，不依赖网络、账号或中心计数器。`expand` 用一个本地 JSON 存储把短码反查回原始 URL。

这是 kaelen/skills 的链路 dogfood 样例的产物，完整故事见 [../README.md](../README.md)。

## 要求

- Node ≥ 23.6（原生跑 TypeScript，无需编译、无需依赖）。本机用 Node 24 验证通过。

## 用法

```bash
cd app

# 缩短一个 URL，打印短码
node src/cli.ts shorten https://anthropic.com
# -> GY5lxK

# 还原短码
node src/cli.ts expand GY5lxK
# -> https://anthropic.com

# 列出所有已存映射
node src/cli.ts list
# -> GY5lxK   https://anthropic.com
```

也可用 npm scripts：`npm run shorten -- <url>`、`npm run expand -- <code>`、`npm run list`。

## 存储位置

短码到 URL 的映射存在 JSON 文件里：

- 缺省：`app/links.json`
- 覆盖：设环境变量 `URLSHORT_DB=/path/to/links.json`

`shorten` 时写入，`expand` / `list` 时读取。短码的**生成**不读存储（纯函数），存储只服务还原。

## 设计前提

短码 = `base62(sha256(url) 取前 8 字节 mod 62^6)`，6 位。

这意味着：

- **确定性**：同一 URL 在任意机器、任意进程缩出同一短码。
- **无状态生成**：散列里不掺任何运行时状态（随机 salt、时间戳、进程种子）。这条不是风格偏好，是命根子，曾因违反它出过一个真 bug，见 [../chain/06-hunt.md](../chain/06-hunt.md)。

## 已知限制（见 ../chain/07-check.md）

- 不处理短码碰撞（自用量级概率可忽略）。
- 不支持自定义短码、删除、改写。
- `expand` 信任存储文件内容，文件被手工改坏成非法 JSON 会抛错。

## 测试

```bash
npm test          # node --test，8 个测试，零依赖
```
