#!/usr/bin/env node
/**
 * Trade Logger Module - Obsidian Integration
 * Automatically logs all trading activity to Obsidian vault
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const OBSIDIAN_VAULT = "/home/usapcool/serphim obsidian vault";
const TRADE_NOTES_DIR = path.join(OBSIDIAN_VAULT, "notes", "trades");

/**
 * Log a trade event to Obsidian daily note and trade-specific file
 */
function logTradeEvent(eventType, data) {
    const timestamp = new Date().toISOString();
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Format the log entry
    const entry = {
        timestamp,
        event: eventType,
        ...data
    };
    
    // 1. Append to daily note via Obsidian CLI
    const dailyContent = `- **${eventType}** @ ${new Date().toLocaleTimeString()}\n  - Market: ${data.market || 'N/A'}\n  - PnL: ${data.pnl || 'N/A'}\n  - Position: ${data.side || 'N/A'} ${data.size || ''}\n`;
    
    exec(`obsidian daily:append content="${dailyContent.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`, 
        { cwd: OBSIDIAN_VAULT },
        (err) => {
            if (err) console.error("[TradeLogger] Daily note append failed:", err.message);
        }
    );
    
    // 2. Write to trade-specific file for detailed tracking
    const tradeFile = path.join(TRADE_NOTES_DIR, `trade-${dateStr}-${eventType.toLowerCase().replace(/\s+/g, '-')}.md`);
    
    const tradeContent = `---
date: ${dateStr}
event: ${eventType}
market: ${data.market || 'SOL-PERP'}
side: ${data.side || 'N/A'}
size: ${data.size || 0}
pnl: ${data.pnl || 0}
pnlPct: ${data.pnlPct || 0}
price: ${data.price || 0}
leverage: ${data.leverage || 5}
---

# ${eventType} - ${dateStr}

## Details
- **Timestamp**: ${timestamp}
- **Market**: ${data.market || 'SOL-PERP'}
- **Side**: ${data.side || 'N/A'}
- **Size**: $${data.size || 0}
- **Price**: $${data.price || 0}
- **PnL**: $${data.pnl || 0} (${data.pnlPct || 0}%)
- **Leverage**: ${data.leverage || 5}x

## Context
${data.context || 'No additional context provided.'}

## Notes
- Logged automatically by Seraphim Trade Logger
- Source: drift-short-bot

---
*Part of the Citadel trading system*
`;

    fs.appendFile(tradeFile, tradeContent, (err) => {
        if (err) console.error("[TradeLogger] Trade file write failed:", err.message);
        else console.log(`[TradeLogger] Trade logged: ${eventType}`);
    });
}

/**
 * Log bot status/cycle information
 */
function logBotStatus(botName, status, metrics) {
    const timestamp = new Date().toISOString();
    const statusEntry = `- [${timestamp}] ${botName}: ${status} | PnL: $${metrics.pnl || 0} | Position: ${metrics.position || 'None'}\n`;
    
    exec(`obsidian daily:append content="${statusEntry.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
        { cwd: OBSIDIAN_VAULT },
        (err) => {
            if (err) console.error("[TradeLogger] Status log failed:", err.message);
        }
    );
}

module.exports = { logTradeEvent, logBotStatus };

// If run directly, test the logger
if (require.main === module) {
    console.log("[TradeLogger] Testing Obsidian integration...");
    logTradeEvent("POSITION_OPEN", {
        market: "SOL-PERP",
        side: "SHORT",
        size: 24.59,
        price: 78.17,
        pnl: 0,
        pnlPct: 0,
        leverage: 5,
        context: "Test log from trade-logger.js"
    });
}
