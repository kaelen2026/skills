# 快照持久化与趋势对比

复盘的价值在于跨次对比。每次跑都把这次的指标存成一个 JSON 快照，下次自己跟自己比。

## 位置与命名

存在仓库根的 `.retro/` 目录（不是全局目录，跟着仓库走，可选择性提交或 gitignore）。

```bash
mkdir -p .retro
```

命名 `.retro/<date>-<seq>.json`，`<date>` 是今天（`YYYY-MM-DD`），`<seq>` 是当天第几次跑（从 1 起，同日多跑递增）：

```bash
today=$(date +%Y-%m-%d)
existing=$(ls .retro/${today}-*.json 2>/dev/null | wc -l | tr -d ' ')
next=$((existing + 1))
# 写到 .retro/${today}-${next}.json
```

## 存前先对比

写盘前先读 `.retro/` 下最新的那个 JSON（按文件名排序取最后一个）。

有上次快照：算关键指标 delta，输出 Trends vs Last Retro 小节，用箭头标方向。

```
                Last      Now       Delta
Test ratio:     22%   →   41%       ↑19pp
Commits:        32    →   47        ↑47%
Fix ratio:      54%   →   30%       ↓24pp（改善）
Streak:         40d   →   47d       ↑7d
Sessions:       10    →   14        ↑4
```

无上次快照：跳过对比，append 一句"首次记录，下次再跑就能看趋势"。

## schema

只包含有数据的字段。无 PR 号则省略 `prs`；无测试文件（find 计数为 0）则省略 `test_health`。

```json
{
  "date": "2026-06-17",
  "window": "7d",
  "metrics": {
    "commits": 47,
    "insertions": 3200,
    "deletions": 800,
    "net_loc": 2400,
    "test_loc": 1300,
    "test_ratio": 0.41,
    "active_days": 6,
    "sessions": 14,
    "deep_sessions": 5,
    "avg_session_minutes": 42,
    "loc_per_session_hour": 350,
    "feat_pct": 0.40,
    "fix_pct": 0.30,
    "peak_hour": 22,
    "ai_assisted_commits": 32
  },
  "streak_days": 47,
  "tweetable": "Week of Jun 10: 47 commits, +2.4k net LOC, 41% tests, peak 10pm | Streak: 47d"
}
```

测试文件存在时加：

```json
  "test_health": {
    "total_test_files": 47,
    "test_files_changed": 8
  }
```

`compare` 模式同样只存当前窗口这一个快照，不持久化上一个窗口的指标。
