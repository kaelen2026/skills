// urlshort 测试。用 Node 内置 node:test + node:assert，零依赖。
//   node --test
//
// 注意：前两组都在单个进程内跑 —— 这正是 hunt 要揭示的盲区。
// 进程内 SESSION_SALT 是常量，所以全绿；跨进程才崩。
// 末尾的跨进程组是 hunt 补的回归测试。

import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ALPHABET,
  CODE_LEN,
  base62,
  codeFor,
  expand,
  shorten,
  SPACE,
} from "../src/shorten.ts";

function tmpDb(): string {
  return join(mkdtempSync(join(tmpdir(), "urlshort-")), "links.json");
}

test("base62 长度固定为 CODE_LEN", () => {
  assert.equal(base62(0n).length, CODE_LEN);
  assert.equal(base62(SPACE - 1n).length, CODE_LEN);
});

test("base62 只用字母表内字符", () => {
  for (const c of base62(123456789n)) assert.ok(ALPHABET.includes(c));
});

test("shorten 返回定长短码", () => {
  assert.equal(shorten("https://example.com", tmpDb()).length, CODE_LEN);
});

test("shorten -> expand 往返还原", () => {
  const db = tmpDb();
  const code = shorten("https://example.com/a", db);
  assert.equal(expand(code, db), "https://example.com/a");
});

test("同进程内幂等：同一 URL 同一短码", () => {
  const db = tmpDb();
  assert.equal(
    shorten("https://example.com/x", db),
    shorten("https://example.com/x", db),
  );
});

test("expand 未知短码返回 undefined", () => {
  assert.equal(expand("zzzzzz", tmpDb()), undefined);
});

// ---- hunt 补的回归测试：曾经红，根因是模块加载时随机生成的 SESSION_SALT ----
test("确定性：同一 URL 跨进程必须得到同一短码", () => {
  const cli = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
  const url = "https://example.com/stable";
  const run = () =>
    execFileSync(process.execPath, [cli, "shorten", url], {
      env: { ...process.env, URLSHORT_DB: tmpDb() },
      encoding: "utf8",
    }).trim();
  assert.equal(run(), run(), "同一 URL 跨进程短码不一致：确定性前提被破坏");
});

// 这条不依赖进程，纯函数层面也钉一下确定性
test("codeFor 对固定 URL 给出稳定值", () => {
  assert.equal(codeFor("https://example.com/a"), codeFor("https://example.com/a"));
});
