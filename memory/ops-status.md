---
last_updated: 2026-02-22T01:03:49-05:00
status: active
owner: ophanim
scope: shared
tags: [ops, live, bots, status]
---

# Ops Status (Hot Path)

## Live Snapshot
- Drift Auto: open=True today=0W/0L pnl=$0.00
- Drift Short: open=True today=0W/0L pnl=$0.00
- Hyperliquid (Cherubim): open=False trades=0 pnl=$0.00
- Regime Validator: healthy
- Execution Monitor: warning

## Current Risks
- If Regime Validator != healthy, treat entries as degraded.
- If Execution Monitor == warning, inspect logs before scaling risk.

## Pointers
- [[memory/bot-params]]
- [[memory/trading-rules]]
- [[memory/ownership-map]]
