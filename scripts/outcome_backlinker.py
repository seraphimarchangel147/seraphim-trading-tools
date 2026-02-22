#!/usr/bin/env python3
import json,datetime,os
state='/home/usapcool/clawd/data/drift-auto-state.json'
out='/home/usapcool/.openclaw/workspace/memory/trade-outcomes.md'

try:
    d=json.load(open(state))
    hist=d.get('tradeHistory',[])[:25]
except Exception:
    hist=[]

lines=[
'---',
f'last_updated: {datetime.datetime.now().astimezone().isoformat(timespec="seconds")}',
'status: active',
'owner: seraphim',
'scope: shared',
'tags: [outcomes, rules, backlinks]',
'---\n',
'# Trade Outcomes → Rule Backlinks\n',
'Use rule IDs from [[memory/trading-rules]] (R001..R006).\n'
]
if not hist:
    lines.append('- No recent closed trades in state window.')
else:
    for t in hist:
        pnl=float(t.get('pnlUsd') or t.get('pnl') or 0)
        ts=t.get('timestamp')
        lines.append(f"- {ts}: pnl=${pnl:.2f} reason={t.get('reason') or t.get('closeReason') or 'n/a'} refs=[[R001]] [[R002]]")

os.makedirs(os.path.dirname(out),exist_ok=True)
open(out,'w').write('\n'.join(lines)+'\n')
print(out)
