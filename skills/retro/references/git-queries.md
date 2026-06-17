# 采数据的 git 命令

全部在仓库根跑。`<base>` 是 Pre-flight 里定好的 base 分支（有 remote 用 `origin/<branch>`，纯本地用本地分支）。`<since>` 是 windows.md 里算好的午夜对齐起始时间。这些查询彼此独立，可并行。

## 窗口内的内容

```bash
# 1. 每个 commit 的 hash、作者、时间、subject + 增删行
git log <base> --since="<since>" --format="%H|%aN|%ai|%s" --shortstat

# 2. 每个 commit 的逐文件增删（用于拆分测试 vs 生产 LOC）
#    每块以 COMMIT:<hash> 开头，后跟 numstat 行
#    路径含 test/ | spec/ | __tests__/ 的算测试文件
git log <base> --since="<since>" --format="COMMIT:%H" --numstat

# 3. commit 时间戳序列（session 检测 + 小时分布）
git log <base> --since="<since>" --format="%at|%ai|%s" | sort -n

# 4. 最常改动的文件（hotspot）
git log <base> --since="<since>" --format="" --name-only | grep -v '^$' | sort | uniq -c | sort -rn

# 5. PR 号（GitHub #NNN），无则该指标省略
git log <base> --since="<since>" --format="%s" | grep -oE '#[0-9]+' | sort -u

# 6. 窗口内改动的测试文件数
git log <base> --since="<since>" --format="" --name-only | grep -E '\.(test|spec)\.' | sort -u | wc -l
```

## 测试文件总数（非 git，全仓快照）

```bash
find . -name '*.test.*' -o -name '*.spec.*' -o -name '*_test.*' -o -name '*_spec.*' 2>/dev/null \
  | grep -vE 'node_modules|/\.git/|vendor|dist|build' | wc -l
```

这是 test ratio 趋势的分母之一，跨快照对比时看它的变化。

## shipping streak（查全历史，不受窗口限制）

```bash
# 全历史 commit 日期去重（本地时区），不加 --since
git log <base> --format="%ad" --date=format:"%Y-%m-%d" | sort -u
```

从今天往回数，连续多少天至少有一个日期。查全历史才能报出任意长度的 streak；只查窗口会把长 streak 截断。满 365 天显示 `365+`。

## 单人视角的提醒

不要跑 `git shortlog -sn` 去做多人 leaderboard，也不要 `--author` 拆分每个人。默认所有 commit 都是"你"。窗口里出现多作者（机器 co-author、偶尔协作者）合并计数即可。若有大量 `Co-Authored-By` AI trailer，至多记为"AI 辅助 commit 占比"这一个中性指标，不拆人、不点评。

## session 检测

从命令 3 的时间戳序列，用 45 分钟间隔切分 session。相邻 commit 间隔 >45min 视为新 session。分类：深(>50min)/中(20-50min)/微(<20min，多为单 commit)。算总活跃编码时长、平均 session 长度、每活跃小时的 LOC（四舍五入到最近 50）。
