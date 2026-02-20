#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/usapcool/.openclaw/workspace"
LEGION="/home/usapcool/.openclaw/agents/legion"
VAULT="/home/usapcool/serphim obsidian vault"

WARN=0
CRIT=0

echo "== Memory Health Check =="

check_exists(){
  local p="$1"; local label="$2"
  if [ ! -e "$p" ]; then
    echo "[CRIT] Missing: $label ($p)"; CRIT=1
  else
    echo "[OK] $label"
  fi
}

age_hours(){
  python3 - <<PY
import os,time
p='$1'
print((time.time()-os.path.getmtime(p))/3600)
PY
}

check_exists "$ROOT/MEMORY.md" "Curated memory"
check_exists "$ROOT/memory" "Daily memory dir"
check_exists "$LEGION/shared/outputs/alpha/monitor.jsonl" "ALPHA monitor output"
check_exists "$VAULT/tasks/todo.md" "Task tracker"

if [ -f "$ROOT/MEMORY.md" ]; then
  h=$(age_hours "$ROOT/MEMORY.md")
  awk -v h="$h" 'BEGIN{if(h>72){printf("[WARN] MEMORY.md stale: %.1fh\n",h); exit 1}else{printf("[OK] MEMORY.md freshness: %.1fh\n",h)}}' || WARN=1
fi

# Check for date gaps in last 7 days (best-effort)
python3 - <<'PY' || WARN=1
import os,datetime
base='/home/usapcool/.openclaw/workspace/memory'
today=datetime.date.today()
missing=[]
for i in range(1,8):
 d=today-datetime.timedelta(days=i)
 fn=os.path.join(base,d.isoformat()+'.md')
 if not os.path.exists(fn): missing.append(d.isoformat())
if missing:
 print('[WARN] Missing daily memory files (last 7d):', ', '.join(missing))
 raise SystemExit(1)
print('[OK] Daily memory continuity (last 7d)')
PY

# Secret leak scan (memory + legion docs)
if grep -RInE "(api[_-]?key|private[_-]?key|secret|BEGIN PRIVATE KEY)" \
  "$ROOT"/memory "$ROOT"/MEMORY.md "$LEGION" 2>/dev/null | grep -vE "example|template|dummy" >/tmp/memory_secret_scan.txt; then
  if [ -s /tmp/memory_secret_scan.txt ]; then
    echo "[CRIT] Potential secret leak patterns found:"; head -n 10 /tmp/memory_secret_scan.txt
    CRIT=1
  fi
else
  echo "[OK] Secret leak scan clean"
fi

if [ "$CRIT" -eq 1 ]; then
  echo "RESULT=CRITICAL"; exit 2
elif [ "$WARN" -eq 1 ]; then
  echo "RESULT=WARNING"; exit 1
else
  echo "RESULT=HEALTHY"; exit 0
fi
