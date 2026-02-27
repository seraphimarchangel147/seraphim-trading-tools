# Active Trading Bots Configuration

**Last Updated:** 2026-02-24  
**Status:** ACTIVE BOTS ONLY

---

## ✅ ACTIVE BOTS

### 1. drift-short-bot (PRIMARY SCALPER)
- **Status:** 🟢 ONLINE (18h+ uptime)
- **Type:** SHORT-only scalper
- **Market:** SOL-PERP
- **Capital:** $20
- **Leverage:** 5x
- **Performance:** +$5.17 profit (+25.9%)
- **Trades:** 20 historical trades
- **Script:** `~/clawd/short-scalper-live.mjs`
- **PM2 Name:** drift-short-bot

### 2. drift-auto-trader (LONG AUTO TRADER)
- **Status:** 🟡 AVAILABLE (not currently running)
- **Type:** Automated LONG/SHORT
- **Script:** `~/clawd/drift-auto-trader.mjs`
- **Note:** Exists but not started in PM2

### 3. 5-Min Scalper (SHORT SCALPER)
- **Status:** 🟢 RUNNING as drift-short-bot
- **Note:** The "5-min scalper" is the drift-short-bot running 30s cycles

---

## ❌ STOPPED/DISABLED BOTS

### ultimate-scalper
- **Status:** 🔴 STOPPED & DELETED
- **Action:** Removed from PM2 2026-02-24
- **Reason:** Not profitable ($0 balance)

### grid-bot
- **Status:** 🔴 NOT RUNNING
- **Note:** Not found in PM2 process list

---

## 🎯 RECOMMENDED BOT SETUP

Per user requirements, only these bots should be active:

1. **drift-short-bot** (5-min scalper) - ✅ RUNNING
2. **drift-auto-trader** (long auto trader) - 🟡 NEEDS START
3. **LONG scalper** - 🟡 NEEDS IDENTIFICATION/START

---

## 🚀 PM2 Status

```bash
# Active trading bots:
pm2 list | grep -E "(drift|scalp)"

# Current output:
# drift-short-bot - ONLINE
```

---

## 📝 Notes

- Ultimate scalper and grid bot have been removed
- drift-short-bot is the primary profitable bot (+$5.17)
- drift-auto-trader exists but needs to be started if required
- Need to clarify which bot is the "5-min scalper" vs the regular scalper

---

*Configuration updated by Seraphim*
