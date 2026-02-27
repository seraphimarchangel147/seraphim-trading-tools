# Hyperliquid Bot - Cherubim Setup Bundle

Included:
- `scripts/trading/hyperliquid-bot.mjs` (bot runtime)
- `config/hyperliquid-bot.env` (wallet + mode config)
- `package.json` (dependencies)
- `data/*` (state/journals if present)

## Quick start
1. Install deps in project root:
   - `npm install`
2. Verify env file:
   - `config/hyperliquid-bot.env`
3. Run bot:
   - `node scripts/trading/hyperliquid-bot.mjs`
4. PM2 (optional):
   - `pm2 start scripts/trading/hyperliquid-bot.mjs --name hyperliquid-bot --update-env`

## Live mode gates
- `TEST_MODE=false`
- `LIVE_TRADING_CONFIRM=yes`

If either is missing, live execution should be blocked.
