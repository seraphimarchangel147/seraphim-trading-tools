---
last_updated: 2026-02-22T01:02:00-05:00
status: active
owner: seraphim
scope: shared
tags: [index, memory, hot-path]
---

# MEMORY Index (Hot Path)

> Purpose: Keep critical operational context in first 100 lines.

## Live Ops Anchors
- [[memory/ops-status]]
- [[memory/trading-rules]]
- [[memory/bot-params]]
- [[memory/ownership-map]]
- [[memory/identity]]

## Topic Hubs
- [[memory/trading]]
- [[memory/agents]]
- [[memory/bots]]

## Current Focus
1. Drift execution reliability and profitable closes
2. Mission Control v4 migration parity
3. Regime/data freshness enforcement

## Safety Rules (top)
- Never claim realized P&L without confirmed execution/close.
- If local/on-chain state diverges, reconcile or flatten.
- Treat stale/unknown regime as degraded input.

## Active Tooling
- `scripts/memory_health_check.sh`
- `scripts/update_ops_status.sh`
- `scripts/skill_graph_score.py`
- `clawd/scripts/trading/regime-validator.mjs`
- `clawd/scripts/trading/execution-monitor.mjs`
- `clawd/scripts/trading/trade-analytics.mjs`

## Journals
- `memory/2026-02-20.md`
- `memory/2026-02-19.md`
- `memory/2026-02-17.md`
- older date logs in `memory/`

## Archive policy
- Keep hot index lean (<150 lines)
- Move bulky chronological exports to `memory/archive/YYYY-MM/`
