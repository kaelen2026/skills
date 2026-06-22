---
name: migrate
description: "Plans and gates schema and data migrations so each step is backward-compatible, rehearsed on a copy, and reversible, ordered expand-then-contract with a verified restore path before any destructive change. Use when a solo dev asks 数据迁移/改表结构/加字段/回填数据/迁库/schema migration/backfill or is about to run ALTER/DROP/UPDATE on production data. Not for splitting general code changes into steps (use ship-small) or tracing why production data looks wrong (use hunt)."
when_to_use: "数据迁移, 迁移, 改表结构, 改 schema, 加字段, 删字段, 改字段类型, 重命名列, 回填, 回填数据, backfill, 迁库, 换数据库, 数据变更, 不停机迁移, 历史数据, 跑迁移脚本, 改生产数据, schema migration, database migration, alter table, drop column, data migration, zero downtime migration"
dispatch_intent: "Schema or data change on a live system that must stay backward-compatible, rehearsable, reversible, and ordered so production never breaks mid-migration"
---

# Migrate: 改数据要可回滚、向后兼容、先在副本演练

一个人开发，迁移崩在生产上没人帮你抢救，被 DROP 的数据也没人帮你找回来。所以更要把"先有还原路径，再动数据"刻进流程。失败模式有三个：一是一步到位地 rename/drop 旧结构同时上线新代码，回滚必然两边都崩；二是没有备份、没有 dry-run 就对生产跑不可逆操作；三是一条 `UPDATE` 扫全表回填，锁死大表把站点拖垮。

**先扩张，后收缩（expand-contract）。** 加新结构时让旧代码仍能跑，回填、切换、确认无残留之后，才在下一个发布里删旧。任何"改 schema 和用它的代码必须同时上"的迁移都是隐藏的大爆炸，把它拆成兼容的两步。

## Outcome Contract

- Outcome: 迁移按 expand-contract 拆成有序、各自向前向后都安全的步骤，每步有还原路径。
- Done when: 每步向后兼容（旧代码遇到新 schema 不崩）、有可回滚的 down、在生产数据副本上 dry-run 过并量了时长与锁、改数据的步骤前有已验证能恢复的备份、删旧结构隔了至少一个发布周期。
- Evidence: DB 类型与是否支持事务型 DDL、目标表的行数与读写 QPS、能否停机、用什么迁移工具（框架自带 / 手写 SQL）、现有的备份与回滚机制。
- Output: 一张迁移计划表，标注每步动什么、向前怎么上、向后怎么回滚、副本演练结果、备份确认、删旧的 grace period。

## Core Stance

- **先有还原路径，再动数据。** 不可逆操作（DROP / TRUNCATE / 不带 WHERE 的破坏性 UPDATE）跑之前，必须有快照或备份，且验证过它真能恢复。"应该有备份"不算。
- **schema 与代码分两次发。** 先发同时兼容新旧两边的 schema，再发用新 schema 的代码。耦合成一次发布，回滚时 schema 和代码必有一方对不上。
- **大表操作先看锁与时长。** 加索引、改类型、回填，在大表上可能锁表几分钟到几小时。用 online DDL、分批、避免长事务，先在副本上量清楚再上。
- **回填分批、限流、可续跑。** 大表回填一条全表 `UPDATE` 会锁死、会超时、崩在中间无从续。按主键分批、每批提交、记录进度，能中断能从断点重跑。
- **迁移脚本幂等。** 同一脚本重跑不该出错也不该重复写。崩在中间能再跑一遍补齐，而不是手工清理残局。

## Pre-flight

- 先认清环境：哪种 DB，DDL 是否在事务里（Postgres 多数 DDL 可回滚，MySQL 的 DDL 不进事务、失败会留半截）。这决定了"崩在中间"会留下什么。
- 量目标表：行数、读写 QPS、能否短暂停机或必须不停机。决定能不能直接 ALTER，还是必须分批 + online。
- 弄清工具与回滚单位：框架自带 migration（有 up/down）还是手写 SQL？回滚是反向迁移、还是恢复备份？没有 down 的迁移等于没有回滚。
- 确认备份现状：最近一次备份多久前、恢复演练过没有。改数据前这一步不能省。

## 模式

**Expand-Contract · Activate when**: 改表结构（加/删/改列、改类型、加约束、拆表）且系统在线、不能长时间停。

分三段，跨多次发布：

1. Expand：加新列/新表/新索引，可空或带默认，旧代码完全不受影响。新约束先以"不强制校验"方式加。
2. Migrate：双写（新旧字段同时写）+ 分批回填历史数据 + 把读切到新结构，逐步验证。
3. Contract：确认无代码再读写旧结构、观察一个发布周期后，才删旧列/旧表、强制约束。
每段之间能停、能回滚到上一段，不会让线上处于半迁移的不可用态。

**Data Backfill · Activate when**: 给已有行补字段、清洗历史数据、批量改值。

先写一个幂等、分批、可续跑的回填任务（按主键范围或游标分页，每批小事务提交，落地进度）。在副本上跑一遍量单批耗时与总时长，估算对生产负载的影响并限流。跑生产前确认备份。中途可暂停、可从已处理位置续跑。

**One-shot / Offline · Activate when**: 可以接受短暂停机，或数据量小、表不繁忙、迁移秒级完成。

仍然先备份、先在副本 dry-run。停机窗口内：备份 → 跑迁移 → 跑一个 pass/fail 校验（行数、关键不变量）→ 确认后放流量。校验不过就回滚，别带着可疑数据放量。

## Hard Rules

- **没有验证过的还原路径，不许跑不可逆操作。** DROP / TRUNCATE / 破坏性 UPDATE 之前必须有备份或快照，且确认过它能恢复。
- **不在一次迁移里同时删旧结构和上线新代码。** 走 expand-contract，删旧至少隔一个发布周期，确认线上无任何代码再读写它。
- **删列/删表先 grace period。** 即使代码已不用，也先观察一个周期再删，给回滚和漏网的引用留余地。
- **回填不许一条全表 UPDATE。** 必须分批、限流、可中断续跑，并先在副本量过时长。
- **迁移脚本必须幂等且崩了能续跑。** 跑到一半失败再跑一遍要能补齐，不能要求手工善后。
- **上生产前先在生产数据的副本上 dry-run。** 量真实时长与锁影响。在空表或小测试库上"跑通了"不算数。
- **迁移不是重新设计数据模型。** 数据模型该怎么改是 think 的事；这里只负责把已定的改动安全落地。改着改着发现模型本身不对，停下回 think。

## Gotchas

| 出过的问题 | 规则 |
| --- | --- |
| 一个迁移里 rename 列 + 上线读新名的代码，回滚时旧代码找不到新列 | 拆成 expand（加新列双写）→ contract（删旧列），分两次发 |
| 在大表上直接 `ALTER` 加索引，锁表几分钟站点 504 | 先在副本量锁与时长，用 online DDL 或分批 |
| 一条 `UPDATE table SET ...` 回填百万行，超时锁死 | 按主键分批、每批提交、限流、可续跑 |
| MySQL 迁移崩在中间，DDL 不回滚，表留半截 | 事先知道 DDL 不进事务，脚本设计成可重跑补齐 |
| 跑了破坏性迁移才发现备份是三周前的 | 改数据前确认最近备份并验证能恢复 |
| 在测试库跑通就上生产，生产数据量大十倍超时 | dry-run 必须在生产数据的副本上 |
| 删了"没人用"的列，结果某个后台任务还在读 | 删前 grep 全部读写方 + 隔一个发布周期观察 |
| 迁移和回滚都写了，但 down 从没跑过 | 副本上把 up→down→up 跑一遍，确认 down 真能回 |

## Output

一张迁移计划表，按发布顺序：

```
迁移计划（按上线顺序）

环境: [DB 类型 / DDL 是否事务型 / 目标表行数与 QPS / 能否停机 / 备份现状]

1. [步骤名] · Expand / Migrate / Contract
   - 动什么: 具体的 DDL / 数据操作
   - 向前: 怎么上，为什么旧代码不受影响
   - 向后: 回滚单位（反向迁移 / 恢复备份），不牵连前序步
   - 演练: 副本 dry-run 的时长 / 锁影响 / 校验结果
   - 备份: 改数据步骤前的备份确认（无 / 已验证可恢复）

2. ...

Contract（删旧）: 在第 N 步上线并观察 [grace period] 后执行
```

收尾这句：

```
迁移计划已就绪。逐步执行，每步上生产前确认副本 dry-run 通过、备份可恢复。改数据的步骤跑完先校验再放量。
```
