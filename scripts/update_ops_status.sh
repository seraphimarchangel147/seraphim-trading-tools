#!/usr/bin/env bash
set -euo pipefail
python3 - <<'PY'
import json,os,datetime
out='/home/usapcool/.openclaw/workspace/memory/ops-status.md'

def load(p):
  try: return json.load(open(p))
  except: return {}

a=load('/home/usapcool/clawd/data/drift-auto-state.json')
s=load('/home/usapcool/clawd/data/drift-short-state.json')
h=load('/home/usapcool/clawd/data/hyperliquid-paper-state.json')
rv=load('/home/usapcool/clawd/data/regime-validator-status.json')
em=load('/home/usapcool/clawd/data/execution-monitor.json')

now=datetime.datetime.now(datetime.timezone.utc).astimezone().isoformat(timespec='seconds')

def line_drift(d):
  ds=d.get('dailyStats',{})
  return f"open={bool(d.get('position'))} today={ds.get('wins',0)}W/{ds.get('losses',0)}L pnl=${ds.get('pnl',0):.2f}"

def line_hyper(d):
  st=d.get('stats',{})
  return f"open={bool(d.get('position'))} trades={st.get('totalTrades',0)} pnl=${st.get('realizedPnl',0):.2f}"

text=f'''---
last_updated: {now}
status: active
owner: ophanim
scope: shared
tags: [ops, live, bots, status]
---

# Ops Status (Hot Path)

## Live Snapshot
- Drift Auto: {line_drift(a)}
- Drift Short: {line_drift(s)}
- Hyperliquid (Cherubim): {line_hyper(h)}
- Regime Validator: {rv.get('status','unknown')}
- Execution Monitor: {em.get('status','unknown')}

## Current Risks
- If Regime Validator != healthy, treat entries as degraded.
- If Execution Monitor == warning, inspect logs before scaling risk.

## Pointers
- [[memory/bot-params]]
- [[memory/trading-rules]]
- [[memory/ownership-map]]
'''
open(out,'w').write(text)
print(f'updated {out}')
PY