#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="/home/usapcool/.openclaw/workspace/reports"
LOG_FILE="$LOG_DIR/halfhour-system-check.log"
TS="$(date -Is)"

mkdir -p "$LOG_DIR"

echo "[$TS] === 30m SYSTEM CHECK START ===" >> "$LOG_FILE"

# 1) Obsidian CLI
if command -v obsidian-cli >/dev/null 2>&1; then
  if obsidian-cli print-default --path-only >/tmp/obsidian_check.out 2>/tmp/obsidian_check.err; then
    echo "[$TS] [OK] obsidian-cli: $(cat /tmp/obsidian_check.out)" >> "$LOG_FILE"
  else
    echo "[$TS] [WARN] obsidian-cli failed: $(tr '\n' ' ' </tmp/obsidian_check.err)" >> "$LOG_FILE"
  fi
else
  echo "[$TS] [WARN] obsidian-cli not found" >> "$LOG_FILE"
fi

# 2) Heartbeat file presence/status
HB_FILE="/home/usapcool/.openclaw/workspace/HEARTBEAT.md"
if [[ -f "$HB_FILE" ]]; then
  non_comment_lines=$( (grep -Ev '^\s*#|^\s*$' "$HB_FILE" || true) | wc -l | tr -d ' ' )
  if [[ "$non_comment_lines" -gt 0 ]]; then
    echo "[$TS] [OK] HEARTBEAT.md active tasks: $non_comment_lines" >> "$LOG_FILE"
  else
    echo "[$TS] [OK] HEARTBEAT.md present (no active tasks)" >> "$LOG_FILE"
  fi
else
  echo "[$TS] [WARN] HEARTBEAT.md missing" >> "$LOG_FILE"
fi

# 3) Trading health snapshot
pm2_summary=$(pm2 ls | egrep 'drift-auto-trader|drift-short-bot|hyperliquid-bot|entry-optimizer|regime-switcher' | sed 's/|/ /g' | tr '\n' '; ' || true)
echo "[$TS] [INFO] pm2: ${pm2_summary:-no-matching-processes}" >> "$LOG_FILE"

# refresh hot ops status + monitors
/home/usapcool/.openclaw/workspace/scripts/update_ops_status.sh >/tmp/update_ops_status.out 2>/tmp/update_ops_status.err || true
node /home/usapcool/clawd/scripts/trading/regime-validator.mjs >/tmp/regime_validator.out 2>/tmp/regime_validator.err || true
node /home/usapcool/clawd/scripts/trading/execution-monitor.mjs >/tmp/execution_monitor.out 2>/tmp/execution_monitor.err || true
node /home/usapcool/clawd/scripts/trading/trade-analytics.mjs >/tmp/trade_analytics.out 2>/tmp/trade_analytics.err || true

if [ -f /home/usapcool/clawd/data/regime-validator-status.json ]; then
  rv_status=$(python3 - <<'PY'
import json
p='/home/usapcool/clawd/data/regime-validator-status.json'
d=json.load(open(p))
print(d.get('status','unknown'))
PY
)
  echo "[$TS] [INFO] regime_validator_status=$rv_status" >> "$LOG_FILE"
  if [ "$rv_status" != "healthy" ]; then
    echo "[$TS] [WARN] regime validator degraded" >> "$LOG_FILE"
  fi
fi

python3 - <<'PY' >> "$LOG_FILE" 2>/dev/null || true
import json, os, datetime
TS=datetime.datetime.now().isoformat()
for name,path in [
 ('drift_auto','/home/usapcool/clawd/data/drift-auto-state.json'),
 ('drift_short','/home/usapcool/clawd/data/drift-short-state.json'),
 ('hyper','/home/usapcool/clawd/data/hyperliquid-paper-state.json')
]:
    if not os.path.exists(path):
        print(f"[{TS}] [WARN] {name}: missing state file")
        continue
    d=json.load(open(path))
    if name.startswith('drift'):
        ds=d.get('dailyStats',{})
        print(f"[{TS}] [INFO] {name}: open={bool(d.get('position'))} today={ds.get('wins',0)}W/{ds.get('losses',0)}L pnl=${ds.get('pnl',0):.2f}")
    else:
        s=d.get('stats',{})
        print(f"[{TS}] [INFO] hyper: open={bool(d.get('position'))} trades={s.get('totalTrades',0)} pnl=${s.get('realizedPnl',0):.2f}")
PY

# 4) Task progress
TODO_FILE="/home/usapcool/serphim obsidian vault/tasks/todo.md"
if [[ -f "$TODO_FILE" ]]; then
  open_count=$(grep -c "^- \[ \]" "$TODO_FILE" || true)
  done_count=$(grep -c "^- \[x\]" "$TODO_FILE" || true)
  active=$( (grep -m1 '^### ' "$TODO_FILE" || true) | sed 's/^### //' )
  echo "[$TS] [INFO] task_progress: open=$open_count done=$done_count active='${active:-none}'" >> "$LOG_FILE"
else
  echo "[$TS] [WARN] task_progress: todo.md missing" >> "$LOG_FILE"
fi

# 5) Memory hygiene + graph scoring
/home/usapcool/.openclaw/workspace/scripts/memory_archive.sh >/tmp/memory_archive.out 2>/tmp/memory_archive.err || true
python3 /home/usapcool/.openclaw/workspace/scripts/skill_graph_score.py >/tmp/graph_score.out 2>/tmp/graph_score.err || true
python3 /home/usapcool/.openclaw/workspace/scripts/outcome_backlinker.py >/tmp/outcome_backlinker.out 2>/tmp/outcome_backlinker.err || true

# 6) Freshness checks for hot docs
python3 - <<'PY' >> "$LOG_FILE" 2>/dev/null || true
import os,time
hot=['/home/usapcool/.openclaw/workspace/MEMORY.md','/home/usapcool/.openclaw/workspace/memory/ops-status.md','/home/usapcool/.openclaw/workspace/memory/bot-params.md','/home/usapcool/.openclaw/workspace/memory/trading-rules.md']
now=time.time()
for p in hot:
  if not os.path.exists(p):
    print(f"[WARN] missing hot doc: {p}")
    continue
  age_h=(now-os.path.getmtime(p))/3600
  level='WARN' if age_h>24 else 'OK'
  print(f"[{level}] hot_doc_age_hours {os.path.basename(p)}={age_h:.1f}")
PY

echo "[$TS] === 30m SYSTEM CHECK END ===" >> "$LOG_FILE"
