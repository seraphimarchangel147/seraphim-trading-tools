---
last_updated: 2026-02-22T01:00:00-05:00
status: active
owner: seraphim
scope: shared
tags: [bot-params, drift, hyperliquid, risk]
---

# Bot Parameters (Canonical)

## Drift Auto
- Cycle interval: 180000ms
- Leverage: 7x
- Stop loss: 0.8%
- Min score to trade: 22
- Exit model: R-multiple with early scale-outs (0.5R, 1.2R, 2.0R)

## Drift Short
- Cycle interval: 180000ms
- Leverage: 7x
- Stop loss: 0.8%
- Min score to trade: 20
- Min score confirmation: 16
- Range min score: 16
- Range mode: enabled

## Hyperliquid (Cherubim)
- TEST_MODE=false
- LIVE_TRADING_CONFIRM=yes
- Ownership: Cherubim

## Safety
- If bot/state mismatch appears, reconcile or flatten immediately.
- No stale regime input for live entries.
