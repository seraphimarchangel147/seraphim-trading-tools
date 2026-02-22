---
last_updated: 2026-02-22T01:00:00-05:00
status: active
owner: seraphim
scope: shared
tags: [trading-rules, risk, playbook]
---

# Trading Rules (Canonical)

## Rule IDs
- R001: Never record realized P&L without confirmed close path.
- R002: If local state diverges from on-chain state, reconcile or flatten.
- R003: No execution when regime is stale/unknown beyond tolerance.
- R004: Keep hard stop active on every opened position.
- R005: Reduce risk after repeated execution/reliability errors.
- R006: One owner per execution lane (avoid hidden overlap).

## Outcome Backlinks
- Add references from trade outcomes as: `[[R001]]`, `[[R002]]`, ...

## Validation cadence
- Validate hot rules every 7 days (`last_validated` in outcome notes).
