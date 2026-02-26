#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# LEGION MASTER MONITOR v2.1 - FIXED
# Comprehensive monitoring of all fixes and improvements
# Runs every 15 minutes via cron
# ═══════════════════════════════════════════════════════════════════════════════

export PATH="$HOME/.local/bin:$PATH"

LOG_DIR="$HOME/.openclaw/logs/master-monitor"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/monitor-$(date +%Y-%m-%d).log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔥 LEGION MASTER MONITOR v2.1" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ═════════════════════════════════════════════════════════════════════════════════
# SECTION 1: BOT HEALTH CHECK
# ═════════════════════════════════════════════════════════════════════════════════

echo "🔍 SECTION 1: Bot Health Check" | tee -a "$LOG_FILE"

CRITICAL_BOTS=("drift-auto-trader" "drift-short-bot" "regime-switcher" "5min-scalper")
BOT_ISSUES=0

for bot in "${CRITICAL_BOTS[@]}"; do
    STATUS=$(pm2 show "$bot" 2>/dev/null | grep "status" | awk '{print $4}')
    
    if [ "$STATUS" != "online" ]; then
        echo "  🔴 CRITICAL: $bot is $STATUS" | tee -a "$LOG_FILE"
        BOT_ISSUES=$((BOT_ISSUES + 1))
        
        # Auto-heal attempt
        echo "  🔄 Attempting restart..." | tee -a "$LOG_FILE"
        pm2 restart "$bot" 2>/dev/null || echo "  ❌ Restart failed" | tee -a "$LOG_FILE"
    else
        echo "  🟢 $bot: online" | tee -a "$LOG_FILE"
    fi
done

# ═════════════════════════════════════════════════════════════════════════════════
# SECTION 2: REGIME SWITCHER VALIDATION
# ═════════════════════════════════════════════════════════════════════════════════

echo "" | tee -a "$LOG_FILE"
echo "🔍 SECTION 2: Regime Switcher Validation" | tee -a "$LOG_FILE"

if [ -f "/home/usapcool/clawd/data/regime-state.json" ]; then
    echo "  🟢 Regime state file exists" | tee -a "$LOG_FILE"
    REGIME=$(cat /home/usapcool/clawd/data/regime-state.json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('regime', 'UNKNOWN'))" 2>/dev/null || echo "UNKNOWN")
    echo "  📊 Current Regime: $REGIME" | tee -a "$LOG_FILE"
else
    echo "  🔴 CRITICAL: No regime state file!" | tee -a "$LOG_FILE"
    # Try to restart regime-switcher
    pm2 restart regime-switcher 2>/dev/null
    BOT_ISSUES=$((BOT_ISSUES + 1))
fi

# ═════════════════════════════════════════════════════════════════════════════════
# SECTION 3: TRADING PERFORMANCE CHECK
# ═════════════════════════════════════════════════════════════════════════════════

echo "" | tee -a "$LOG_FILE"
echo "🔍 SECTION 3: Trading Performance" | tee -a "$LOG_FILE"

if [ -f "/home/usapcool/clawd/data/drift-auto-state.json" ]; then
    DAILY_PNL=$(cat /home/usapcool/clawd/data/drift-auto-state.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{d.get('dailyStats', {}).get('pnl', 0):.2f}\")" 2>/dev/null)
    DAILY_WINS=$(cat /home/usapcool/clawd/data/drift-auto-state.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('dailyStats', {}).get('wins', 0))" 2>/dev/null)
    DAILY_LOSSES=$(cat /home/usapcool/clawd/data/drift-auto-state.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('dailyStats', {}).get('losses', 0))" 2>/dev/null)
    TOTAL_PNL=$(cat /home/usapcool/clawd/data/drift-auto-state.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{d.get('totalStats', {}).get('totalPnl', 0):.2f}\")" 2>/dev/null)
    
    echo "  📈 Daily PnL: \$$DAILY_PNL" | tee -a "$LOG_FILE"
    echo "  📊 Daily Trades: ${DAILY_WINS}W / ${DAILY_LOSSES}L" | tee -a "$LOG_FILE"
    echo "  💰 Total PnL: \$$TOTAL_PNL" | tee -a "$LOG_FILE"
    
    # Check for critical losses
    if (( $(echo "$DAILY_PNL < -10" | bc -l) )); then
        echo "  🔴 CRITICAL: Daily loss exceeds \$10!" | tee -a "$LOG_FILE"
        BOT_ISSUES=$((BOT_ISSUES + 1))
    fi
else
    echo "  ❌ No drift-auto-state.json found" | tee -a "$LOG_FILE"
fi

# ═════════════════════════════════════════════════════════════════════════════════
# SECTION 4: SUMMARY
# ═════════════════════════════════════════════════════════════════════════════════

echo "" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "📋 SUMMARY REPORT" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"

if [ $BOT_ISSUES -eq 0 ]; then
    echo "✅ ALL SYSTEMS OPERATIONAL" | tee -a "$LOG_FILE"
else
    echo "🔴 $BOT_ISSUES ISSUES DETECTED" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "Next check: $(date -d '+15 minutes' '+%H:%M')" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
