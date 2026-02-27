---
last_updated: 2026-02-23T21:00:01-05:00
status: active
owner: ophanim
scope: shared
tags: [ops, live, bots, status]
---

# Ops Status (Hot Path)

## Live Snapshot
- Drift Auto: open=False today=4W/2L pnl=$-16.81
- Drift Short: open=True today=3W/1L pnl=$2.08
- Hyperliquid (Cherubim): open=False trades=0 pnl=$0.00
- Regime Validator: healthy
- Execution Monitor: healthy

## Current Risks
- If Regime Validator != healthy, treat entries as degraded.
- If Execution Monitor == warning, inspect logs before scaling risk.

## Pointers
- [[memory/bot-params]]
- [[memory/trading-rules]]
- [[memory/ownership-map]]
