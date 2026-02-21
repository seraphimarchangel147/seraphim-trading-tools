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

echo "[$TS] === 30m SYSTEM CHECK END ===" >> "$LOG_FILE"
