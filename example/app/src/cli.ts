#!/usr/bin/env node
// urlshort CLI 入口。把 argv 解析后交给 shorten.ts 的纯函数。
// 用法：
//   node src/cli.ts shorten <url>
//   node src/cli.ts expand <code>
//   node src/cli.ts list

import { dbPath, expand, load, shorten } from "./shorten.ts";

function main(argv: string[]): number {
  const [cmd, arg] = argv;
  const path = dbPath();

  switch (cmd) {
    case "shorten": {
      if (!arg) return usage("shorten <url>");
      console.log(shorten(arg, path));
      return 0;
    }
    case "expand": {
      if (!arg) return usage("expand <code>");
      const url = expand(arg, path);
      if (url === undefined) {
        console.error(`未知短码：${arg}`);
        return 1;
      }
      console.log(url);
      return 0;
    }
    case "list": {
      const store = load(path);
      for (const code of Object.keys(store).sort()) {
        console.log(`${code}\t${store[code]}`);
      }
      return 0;
    }
    default:
      return usage("shorten|expand|list");
  }
}

function usage(detail: string): number {
  console.error(`用法：urlshort ${detail}`);
  return 2;
}

process.exit(main(process.argv.slice(2)));
