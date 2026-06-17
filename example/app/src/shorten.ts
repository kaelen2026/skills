// urlshort 核心：确定性 URL 短链。
//
// 设计前提（见 ../../chain/01-think-plan.md）：同一个 URL 永远映射到同一个
// 短码 —— 不依赖中心计数器，可在任意机器、任意进程复算得到相同结果。
// expand 用一个本地 JSON 存储把短码反查回原始 URL。
//
// 存储路径：环境变量 URLSHORT_DB，缺省为 app 目录下的 links.json。

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const CODE_LEN = 6;
const BASE = BigInt(ALPHABET.length);
export const SPACE = BASE ** BigInt(CODE_LEN); // 62^6 ≈ 568 亿

export function base62(n: bigint): string {
  let x = n;
  const chars: string[] = [];
  for (let i = 0; i < CODE_LEN; i++) {
    chars.push(ALPHABET[Number(x % BASE)]);
    x = x / BASE;
  }
  return chars.reverse().join("");
}

// 把 URL 散列到 [0, SPACE) 区间。这是整个工具确定性的根：sha256 是纯
// 函数，对同一输入跨机器、跨进程恒定。不要在这里掺任何运行时生成的状态
// （随机 salt、时间戳、进程级 hash 种子），否则确定性前提就破了。
export function urlHash(url: string): bigint {
  const digest = createHash("sha256").update(url).digest();
  return digest.readBigUInt64BE(0) % SPACE;
}

// URL -> 短码，纯函数，不读存储。
export function codeFor(url: string): string {
  return base62(urlHash(url));
}

export function dbPath(): string {
  return (
    process.env.URLSHORT_DB ??
    fileURLToPath(new URL("../links.json", import.meta.url))
  );
}

type Store = Record<string, string>;

export function load(path: string): Store {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
}

export function save(path: string, store: Store): void {
  writeFileSync(path, JSON.stringify(store, null, 2));
}

export function shorten(url: string, path: string): string {
  const store = load(path);
  const code = codeFor(url);
  store[code] = url;
  save(path, store);
  return code;
}

export function expand(code: string, path: string): string | undefined {
  return load(path)[code];
}
