#!/usr/bin/env bash
# kaelen/skills 不变量自检。任一项不过即非零退出。
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

fail=0

# 1. 禁英文破折号：落单 em-dash(U+2014)、en-dash(U+2013)、连接号分隔符(U+2E3A/U+2E3B)。
#    中文破折号 —— (两个连续 U+2014) 是合法标点，放行。用 python 精确区分。
if python3 - <<'PY'
import os,re,sys
em='—'; en='–'; s1='⸺'; s2='⸻'
bad=[]
for root,_,files in os.walk('.'):
    if os.sep+'.git' in root: continue
    if 'node_modules' in root.split(os.sep): continue
    for fn in files:
        if not fn.endswith('.md'): continue
        p=os.path.join(root,fn)
        for i,l in enumerate(open(p,encoding='utf-8').read().splitlines(),1):
            why=set()
            for m in re.finditer(em+'+',l):
                if len(m.group())==1: why.add('落单em-dash')
            if en in l: why.add('en-dash')
            if s1 in l or s2 in l: why.add('分隔符')
            if why: bad.append(f"    {p}:{i} {sorted(why)}")
if bad:
    print('\n'.join(bad)); sys.exit(1)
sys.exit(0)
PY
then
  echo "[ok] 无英文破折号（中文 —— 放行）"
else
  echo "[FAIL] 发现英文破折号，上列行需改用逗号/句号/冒号（中文 —— 可保留）"
  fail=1
fi

# 2. 每个 SKILL.md：name 必须等于目录名，且含 Not for 边界
nf_ok=1
for f in skills/*/SKILL.md; do
  [ -f "$f" ] || continue
  dir=$(basename "$(dirname "$f")")
  name=$(grep -m1 '^name:' "$f" | sed 's/name:[[:space:]]*//' | tr -d '"'"'"' ')
  if [ "$name" != "$dir" ]; then
    echo "[FAIL] name 与目录名不一致：$f (name=$name, dir=$dir)"; fail=1; nf_ok=0
  fi
  if ! grep -q 'Not for' "$f"; then
    echo "[FAIL] description 缺 'Not for' 邻居边界：$f"; fail=1; nf_ok=0
  fi
done
[ $nf_ok -eq 1 ] && echo "[ok] 所有 SKILL.md：name==目录名 且 Not for 边界齐全"

# 3. 文档引用无断链（复用 health 采集脚本）
if [ -f skills/health/scripts/check-doc-refs.sh ]; then
  out=$(bash skills/health/scripts/check-doc-refs.sh . 2>&1 | grep -v 'node_modules')
  if echo "$out" | grep -qiE 'missing|broken|not found|fail'; then
    echo "[FAIL] 文档引用断链："; echo "$out" | sed 's/^/    /'; fail=1
  else
    echo "[ok] 文档引用无断链"
  fi
else
  echo "[warn] 未找到 health/scripts/check-doc-refs.sh，跳过断链检查"
fi

# 4. 版本一致：plugin.json 与 marketplace.json 必须同版本（git tag 是发版时的事，不在此校验）
pj=.claude-plugin/plugin.json
mj=.claude-plugin/marketplace.json
if [ -f "$pj" ] && [ -f "$mj" ]; then
  vp=$(python3 -c "import json;print(json.load(open('$pj')).get('version',''))" 2>/dev/null)
  vm=$(python3 -c "import json;print(json.load(open('$mj')).get('metadata',{}).get('version',''))" 2>/dev/null)
  if [ -n "$vp" ] && [ "$vp" = "$vm" ]; then
    echo "[ok] 版本一致：plugin.json 与 marketplace.json 同为 $vp"
  else
    echo "[FAIL] 版本不一致：plugin.json=$vp marketplace.json=$vm（发版前两者需相等）"; fail=1
  fi
else
  echo "[warn] 缺 .claude-plugin manifest，跳过版本一致性检查"
fi

echo
if [ $fail -eq 0 ]; then
  echo "全部通过。"
else
  echo "有未通过项，见上。"
fi
exit $fail
