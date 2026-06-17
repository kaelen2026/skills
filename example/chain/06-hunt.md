# 06 · hunt：根因调试 —— 同一链接每次短码不同

> skill：`hunt` —— 先建可信反馈回路，定位根因再修，拒绝"试一下看看"。
> 触发：「线上同一个链接，今天缩出来的短码和昨天不一样，以前是好的」

hunt 的铁律：**不建可复现回路不动手，不定位根因不修**。下面是真实的排查过程。

## 现象

`shorten https://example.com/stable` 每次重跑给出不同短码。但这工具的命根子就是"同一 URL 同码"。单进程测试却全绿，所以问题不在"我以为测过的地方"。

## 第一步：建可复现回路（这是 hunt 和"试一下"的分界）

把现象压成一个**确定会红**的测试 —— 同一 URL，两个**独立进程**各缩一次，比对：

```ts
test("确定性：同一 URL 跨进程必须得到同一短码", () => {
  const run = () =>
    execFileSync(process.execPath, [cli, "shorten", url], {
      env: { ...process.env, URLSHORT_DB: tmpDb() },
    }).trim();
  assert.equal(run(), run());
});
```

跑，真的红了，而且红得很具体：

```
✖ 确定性：同一 URL 跨进程必须得到同一短码
  AssertionError: 同一 URL 跨进程短码不一致：确定性前提被破坏
  'Soj389' !== 'NsFeac'
```

`'Soj389' !== 'NsFeac'`：同一 URL、两进程、两短码。现在有了一个**确定能复现**的回路。

## 第二步：定位根因（而不是改症状）

回路稳定后，缩小变量。短码 = `base62(urlHash(url))`，`base62` 是纯函数无嫌疑，问题在 `urlHash`：

```ts
const SESSION_SALT = randomBytes(8).toString("hex");   // ← 模块加载时随机
export function urlHash(url: string): bigint {
  const digest = createHash("sha256").update(SESSION_SALT + url).digest();
  ...
}
```

根因明确：**`SESSION_SALT` 在模块加载时随机生成**。同进程内它是常量（所以单进程幂等测试全绿，这就是盲区来源），换进程就变，散列随之变，短码随之漂。

翻 [decision-log ADR-0002](04-decision-log.md)：随机 salt 是**早就被否决过**的方案 —— "不可预测"不是需求，确定性才是。根因和早先的判断对上了，修复方向零犹豫。

## 第三步：修根因，加回归测试

去掉 salt，让散列退回纯函数：

```diff
-import { createHash, randomBytes } from "node:crypto";
+import { createHash } from "node:crypto";
-
-const SESSION_SALT = randomBytes(8).toString("hex");
-
 export function urlHash(url: string): bigint {
-  const digest = createHash("sha256").update(SESSION_SALT + url).digest();
+  const digest = createHash("sha256").update(url).digest();
   return digest.readBigUInt64BE(0) % SPACE;
 }
```

把第一步那条跨进程测试**留在测试套件里**当回归网（不是修完就删）。再跑：

```
ℹ tests 8
ℹ pass 8
ℹ fail 0
```

实机再验一次，两个独立进程缩同一 URL：

```
进程1: SNZbLH  进程2: SNZbLH   ✓ 一致
```

## 根因报告（一句话版）

> 短码跨进程漂移，根因是 `urlHash` 掺了模块加载时随机生成的 `SESSION_SALT`，破坏了散列的纯函数性。单进程测试因 salt 在进程内恒定而全绿，掩盖了问题。修复：移除 salt；回归：新增跨进程同码测试。

## 这一步的教训（喂给 retro）

- **测试绿 ≠ 行为对**：盲区是"单进程测了幂等，没测跨进程幂等"。
- **plan-review 早就点过名**（架构视角："散列别掺运行时状态"），仍被实现踩中 —— 所以需要测试当兜底，光靠评审嘱咐不够。

## 交给下一步

→ `check`：修复连同工具一起，发布前对抗式自审。
