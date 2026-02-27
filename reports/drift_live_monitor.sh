#!/usr/bin/env bash
OUT="/home/usapcool/.openclaw/workspace/reports/drift_live_monitor.log"
STATE="/home/usapcool/clawd/data/drift-auto-state.json"
echo "--- monitor start $(date -Is) ---" >> "$OUT"
while true; do
  ts=$(date -Is)
  if [ -f "$STATE" ]; then
    python3 - <<'PY' >> "$OUT"
import json,datetime
p='/home/usapcool/clawd/data/drift-auto-state.json'
d=json.load(open(p))
ds=d.get('dailyStats',{})
ts=d.get('totalStats',{})
pos='OPEN' if d.get('position') else 'NONE'
print(f"{datetime.datetime.now().isoformat()} pos={pos} today={ds.get('wins',0)}W/{ds.get('losses',0)}L pnl=${ds.get('pnl',0):.2f} total=${ts.get('totalPnl',0):.2f} streak={d.get('consecutiveWins',0)}")
PY
  fi
  sleep 300
done
