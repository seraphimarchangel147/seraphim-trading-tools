#!/usr/bin/env node
/**
 * HYPERLIQUID TRADING BOT v2.1 - PAPER EXECUTION
 *
 * v2.1 additions:
 * - Paper position tracking with TP/SL/timeout
 * - Trade journal (append-only JSONL)
 * - Rolling stats per cycle
 * - Still TEST_MODE safe (no live orders)
 *
 * @author Seraphim (The Legion)
 * @version 2.1.0
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { HttpTransport, ExchangeClient, InfoClient } from '@nktkas/hyperliquid';
import { privateKeyToAccount } from 'viem/accounts';

dotenv.config({ path: '/home/usapcool/clawd/config/hyperliquid-bot.env', override: true });

const __dirname = dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  PRIVATE_KEY: process.env.HYPERLIQUID_PRIVATE_KEY,
  WALLET_ADDRESS: process.env.HYPERLIQUID_ADDRESS,
  INITIAL_CAPITAL: parseFloat(process.env.INITIAL_CAPITAL) || 45,
  MAX_LEVERAGE: parseFloat(process.env.MAX_LEVERAGE) || 2,
  RISK_PER_TRADE: parseFloat(process.env.RISK_PER_TRADE) || 0.02,
  STOP_LOSS_PCT: parseFloat(process.env.STOP_LOSS_PCT) || 0.01,
  TAKE_PROFIT_PCT: parseFloat(process.env.TAKE_PROFIT_PCT) || 0.03,
  MIN_POSITION_USD: 5,
  MAX_POSITION_PCT: 0.10,
  ASSETS: ['BTC', 'ETH', 'SOL'],
  CONFIDENCE_THRESHOLD: (() => {
    const raw = String(process.env.CONFIDENCE_THRESHOLD || '50');
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return 50;
    // Accept either 0-1 scale or 0-100 scale
    return n <= 1 ? Math.round(n * 100) : Math.round(n);
  })(),
  ENTRY_OPT_URL: process.env.ENTRY_OPT_URL || 'http://localhost:18794',
  TEST_MODE: String(process.env.TEST_MODE || 'true').toLowerCase() !== 'false',
  LIVE_TRADING_CONFIRM: String(process.env.LIVE_TRADING_CONFIRM || ''),

  // Paper execution config
  PAPER_TP_PCT: parseFloat(process.env.PAPER_TP_PCT) || 0.03,   // 3% take profit
  PAPER_SL_PCT: parseFloat(process.env.PAPER_SL_PCT) || 0.015,  // 1.5% stop loss
  PAPER_MAX_HOLD_MIN: parseInt(process.env.PAPER_MAX_HOLD_MIN) || 120, // 2 hour timeout
};

// Validate config
if (!CONFIG.PRIVATE_KEY || !CONFIG.WALLET_ADDRESS) {
  console.error('Missing HYPERLIQUID_PRIVATE_KEY or HYPERLIQUID_ADDRESS');
  process.exit(1);
}

if (!CONFIG.TEST_MODE && CONFIG.LIVE_TRADING_CONFIRM !== 'yes') {
  console.error('LIVE mode blocked: set LIVE_TRADING_CONFIRM=yes to enable real orders');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATHS
// ═══════════════════════════════════════════════════════════════════════════════

const DATA_DIR = '/home/usapcool/clawd/data';
const PAPER_STATE_FILE = join(DATA_DIR, 'hyperliquid-paper-state.json');
const PAPER_JOURNAL_FILE = join(DATA_DIR, 'hyperliquid-paper-trades.jsonl');
const LIVE_JOURNAL_FILE = join(DATA_DIR, 'hyperliquid-live-trades.jsonl');

// ═══════════════════════════════════════════════════════════════════════════════
// HYPERLIQUID API CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

class HyperliquidAPI {
  constructor() {
    this.baseUrl = 'https://api.hyperliquid.xyz';
    this.walletAddress = CONFIG.WALLET_ADDRESS;

    const pk = CONFIG.PRIVATE_KEY.startsWith('0x') ? CONFIG.PRIVATE_KEY : `0x${CONFIG.PRIVATE_KEY}`;
    this.wallet = privateKeyToAccount(pk);
    this.transport = new HttpTransport();
    this.infoClient = new InfoClient({ transport: this.transport });
    this.exchangeClient = new ExchangeClient({ transport: this.transport, wallet: this.wallet });
    this.assetIndexCache = new Map();
  }

  async getBalance() {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'clearinghouseState',
          user: this.walletAddress
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const value = parseFloat(data?.marginSummary?.accountValue || 0);
      return value;
    } catch (error) {
      console.error('Balance check failed:', error.message);
      return 0;
    }
  }

  async getPositions() {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'clearinghouseState',
          user: this.walletAddress
        })
      });

      const data = await response.json();
      return data?.assetPositions || [];
    } catch (error) {
      console.error('Positions check failed:', error.message);
      return [];
    }
  }

  async getMidPrice(coin = 'SOL') {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids' })
      });
      if (!response.ok) return null;
      const mids = await response.json();
      const price = parseFloat(mids[coin]);
      return Number.isFinite(price) ? price : null;
    } catch {
      return null;
    }
  }

  async getPerpAssetIndex(coin = 'SOL') {
    if (this.assetIndexCache.has(coin)) return this.assetIndexCache.get(coin);
    const meta = await this.infoClient.meta();
    const universe = meta?.universe || [];
    const idx = universe.findIndex((u) => u.name === coin);
    if (idx < 0) throw new Error(`Perp asset index not found for ${coin}`);
    this.assetIndexCache.set(coin, idx);
    return idx;
  }

  async placeOrder(order) {
    const { coin = 'SOL', side, notionalUsd, reduceOnly = false } = order;
    const isBuy = side === 'LONG';

    const mid = await this.getMidPrice(coin);
    if (!mid) throw new Error('Missing mid price for live order');

    const meta = await this.infoClient.meta();
    const asset = await this.getPerpAssetIndex(coin);
    const universe = meta?.universe || [];
    const szDecimals = universe[asset]?.szDecimals ?? 2;

    const rawSz = notionalUsd / mid;
    const szFactor = 10 ** szDecimals;
    const sz = (Math.floor(rawSz * szFactor) / szFactor).toFixed(szDecimals);

    if (parseFloat(sz) <= 0) throw new Error('Calculated size is zero');

    // Hyperliquid perp tick size for majors like SOL is 0.01
    const px = isBuy
      ? (Math.ceil(mid * 1.003 * 100) / 100).toFixed(2)
      : (Math.floor(mid * 0.997 * 100) / 100).toFixed(2);

    const payload = {
      orders: [{
        a: asset,
        b: isBuy,
        p: px,
        s: sz,
        r: !!reduceOnly,
        t: { limit: { tif: 'Ioc' } },
      }],
      grouping: 'na',
    };

    const response = await this.exchangeClient.order(payload);
    const status = response?.response?.data?.statuses?.[0] || null;

    if (!status) throw new Error('No order status returned');
    if (status.error) throw new Error(status.error);

    const filled = status.filled || null;
    const resting = status.resting || null;

    return {
      ok: true,
      coin,
      side,
      reduceOnly,
      requestedNotionalUsd: notionalUsd,
      requestedSz: sz,
      requestedPx: px,
      oid: filled?.oid || resting?.oid || null,
      fillPx: filled?.avgPx ? parseFloat(filled.avgPx) : null,
      fillSz: filled?.totalSz ? parseFloat(filled.totalSz) : null,
      raw: status,
    };
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT (FIXED)
// ═══════════════════════════════════════════════════════════════════════════════

class StateManager {
  constructor() {
    this.dataDir = join(__dirname, '../../data');
    this.stateFile = join(this.dataDir, 'hyperliquid-bot-state-v2.json');
    mkdirSync(this.dataDir, { recursive: true });
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (existsSync(this.stateFile)) {
        return JSON.parse(readFileSync(this.stateFile, 'utf8'));
      }
    } catch (e) {
      console.warn('Could not load state, starting fresh');
    }

    return {
      version: '2.0.0',
      createdAt: new Date().toISOString(),
      trades: [],
      stats: { totalTrades: 0, wins: 0, losses: 0 },
      totalPnl: 0
    };
  }

  saveState() {
    try {
      writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.error('Failed to save state:', e.message);
    }
  }

  // Only record REAL confirmed trades
  recordTrade(trade) {
    if (!trade.entryPrice || trade.entryPrice <= 0) {
      console.error('REFUSING to record invalid trade (no price)');
      return false;
    }

    if (!trade.txHash && !trade.orderId) {
      console.error('REFUSING to record unconfirmed trade (no tx/order ID)');
      return false;
    }

    this.state.trades.push(trade);
    this.state.stats.totalTrades++;

    if (trade.pnl > 0) this.state.stats.wins++;
    else if (trade.pnl < 0) this.state.stats.losses++;

    this.state.totalPnl += trade.pnl || 0;
    this.saveState();

    console.log(`Trade recorded: ${trade.asset} ${trade.direction} @ $${trade.entryPrice}`);
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAPER EXECUTION LAYER
// ═══════════════════════════════════════════════════════════════════════════════

function loadPaperState() {
  try {
    if (existsSync(PAPER_STATE_FILE)) {
      return JSON.parse(readFileSync(PAPER_STATE_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('  Paper state corrupt, resetting');
  }
  return { position: null, stats: { totalTrades: 0, wins: 0, losses: 0, realizedPnl: 0 } };
}

function savePaperState(ps) {
  writeFileSync(PAPER_STATE_FILE, JSON.stringify(ps, null, 2));
}

function appendJournal(entry) {
  appendFileSync(PAPER_JOURNAL_FILE, JSON.stringify(entry) + '\n');
}

function appendLiveJournal(entry) {
  appendFileSync(LIVE_JOURNAL_FILE, JSON.stringify(entry) + '\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN BOT
// ═══════════════════════════════════════════════════════════════════════════════

class HyperliquidBot {
  constructor() {
    this.api = new HyperliquidAPI();
    this.state = new StateManager();
    this.running = false;
    this.balance = 0;
    this.paper = loadPaperState();
  }

  async start() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  HYPERLIQUID BOT v2.1 - PAPER EXECUTION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Wallet: ${CONFIG.WALLET_ADDRESS}`);
    console.log(`Mode: ${CONFIG.TEST_MODE ? 'TEST (safe)' : 'LIVE (real trades)'}`);
    if (!CONFIG.TEST_MODE) console.log(`Live confirm: ${CONFIG.LIVE_TRADING_CONFIRM}`);
    console.log(`Paper TP: ${(CONFIG.PAPER_TP_PCT * 100).toFixed(1)}%  SL: ${(CONFIG.PAPER_SL_PCT * 100).toFixed(1)}%  MaxHold: ${CONFIG.PAPER_MAX_HOLD_MIN}min`);
    console.log('');

    // Check balance before starting
    this.balance = await this.api.getBalance();
    console.log(`Balance: $${this.balance.toFixed(2)}`);

    if (this.balance < CONFIG.MIN_POSITION_USD) {
      console.error('INSUFFICIENT BALANCE - CANNOT TRADE');
      console.error(`   Need: $${CONFIG.MIN_POSITION_USD}+  Have: $${this.balance.toFixed(2)}`);
      process.exit(1);
    }

    console.log('Balance sufficient for trading');
    console.log('');

    if (CONFIG.TEST_MODE) {
      console.log('RUNNING IN TEST MODE - paper execution only');
      console.log('');
    }

    if (this.paper.position) {
      if (CONFIG.TEST_MODE) {
        console.log(`Resuming paper position: ${this.paper.position.side} SOL @ $${this.paper.position.entryPrice}`);
      } else {
        this.paper.position = null;
        savePaperState(this.paper);
        console.log('Cleared legacy paper position (LIVE mode)');
      }
    }

    this.running = true;

    while (this.running) {
      try {
        await this.runCycle();
        await this.sleep(60000); // 1 minute
      } catch (error) {
        console.error('Cycle error:', error.message);
        await this.sleep(120000);
      }
    }
  }

  async runCycle() {
    const now = new Date();
    console.log(`\n--- Cycle: ${now.toISOString()} ---`);

    // Refresh balance
    this.balance = await this.api.getBalance();
    console.log(`Balance: $${this.balance.toFixed(2)}`);

    if (this.balance < CONFIG.MIN_POSITION_USD) {
      console.log('Low balance, skipping cycle');
      return;
    }

    // Get real positions (for monitoring)
    const positions = await this.api.getPositions();
    console.log(`Real positions: ${positions.length}`);

    // Get current SOL mid price (needed for paper eval + entry)
    const midPrice = await this.api.getMidPrice('SOL');
    if (!midPrice) {
      console.log('  No mid price available, skipping cycle');
      this.logPaperStats();
      return;
    }
    console.log(`  SOL mid: $${midPrice.toFixed(4)}`);

    // --- Evaluate open strategy position (paper in TEST, shadow in LIVE) ---
    if (this.paper.position) {
      const closed = await this.evaluatePaperPosition(midPrice, now);
      if (closed) {
        if (CONFIG.TEST_MODE) this.logPaperStats();
        console.log('Cycle complete');
        return;
      }
      // Position still open, don't open another
      const pos = this.paper.position;
      const unrealPct = pos.side === 'LONG'
        ? (midPrice - pos.entryPrice) / pos.entryPrice
        : (pos.entryPrice - midPrice) / pos.entryPrice;
      const unrealUsd = unrealPct * pos.notional;
      const holdMin = ((now.getTime() - new Date(pos.openedAt).getTime()) / 60000).toFixed(0);
      const label = CONFIG.TEST_MODE ? 'Paper' : 'Live-shadow';
      console.log(`  ${label} ${pos.side} open: entry $${pos.entryPrice.toFixed(4)} | unreal ${(unrealPct * 100).toFixed(2)}% ($${unrealUsd.toFixed(2)}) | held ${holdMin}min`);
      if (CONFIG.TEST_MODE) this.logPaperStats();
      console.log('Cycle complete');
      return;
    }

    // --- No open paper position: check for entry signal ---
    const [longSig, shortSig] = await Promise.all([
      this.fetchEntrySignal('long'),
      this.fetchEntrySignal('short')
    ]);

    if (longSig) {
      console.log(`  LONG signal: ${longSig.signal} (${longSig.confidence}%)`);
    }
    if (shortSig) {
      console.log(`  SHORT signal: ${shortSig.signal} (${shortSig.confidence}%)`);
    }

    const candidate = this.pickSignal(longSig, shortSig);
    if (candidate && this.isActionableSignal(candidate) && candidate.confidence >= CONFIG.CONFIDENCE_THRESHOLD) {
      const side = candidate.side === 'long' ? 'LONG' : 'SHORT';
      const minNotional = CONFIG.TEST_MODE ? CONFIG.MIN_POSITION_USD : 10;
      const notional = Math.max(minNotional, Math.min(this.balance * CONFIG.MAX_POSITION_PCT, 10));
      console.log(`  Trigger: ${side} @ ${candidate.confidence}% (threshold ${CONFIG.CONFIDENCE_THRESHOLD}%)`);
      console.log(`  Planned micro notional: $${notional.toFixed(2)}`);

      // Try to get entry price: prefer entry optimizer midpoint, fallback to exchange mid
      let entryPrice = null;
      if (candidate.midpoint && candidate.midpoint > 0) {
        entryPrice = candidate.midpoint;
        console.log(`  Entry price (optimizer midpoint): $${entryPrice.toFixed(4)}`);
      } else {
        entryPrice = midPrice;
        console.log(`  Entry price (exchange mid fallback): $${entryPrice.toFixed(4)}`);
      }

      // Open paper position
      this.paper.position = {
        side,
        entryPrice,
        notional,
        coin: 'SOL',
        openedAt: now.toISOString(),
        confidence: candidate.confidence,
      };
      savePaperState(this.paper);
      console.log(`  PAPER OPEN: ${side} SOL $${notional.toFixed(2)} @ $${entryPrice.toFixed(4)}`);

      // Live order execution (guarded)
      if (!CONFIG.TEST_MODE) {
        const order = { coin: 'SOL', side, notionalUsd: notional, leverage: CONFIG.MAX_LEVERAGE, reduceOnly: false };
        try {
          const result = await this.api.placeOrder(order);
          if (result?.ok) {
            this.paper.position.live = {
              oid: result.oid,
              side,
              openedAt: now.toISOString(),
              notional,
              requestedPx: result.requestedPx,
              requestedSz: result.requestedSz,
              fillPx: result.fillPx,
              fillSz: result.fillSz,
            };
            appendLiveJournal({
              ts: now.toISOString(),
              event: 'LIVE_OPEN',
              coin: 'SOL',
              side,
              oid: result.oid,
              requestedPx: result.requestedPx,
              requestedSz: result.requestedSz,
              fillPx: result.fillPx,
              fillSz: result.fillSz,
              notionalUsd: notional,
              verified: !!result.oid,
            });
            savePaperState(this.paper);
            console.log(`  LIVE OPEN accepted (oid=${result.oid || 'n/a'})`);
          }
        } catch (e) {
          console.log(`  LIVE OPEN failed: ${e.message}`);
        }
      }
    } else {
      if (candidate && !this.isActionableSignal(candidate)) {
        console.log(`  No trigger: non-actionable signal (${candidate.signal})`);
      } else {
        console.log(`  No trigger (need >= ${CONFIG.CONFIDENCE_THRESHOLD}%)`);
      }
    }

    if (CONFIG.TEST_MODE) this.logPaperStats();
    console.log('Cycle complete');
  }

  async evaluatePaperPosition(currentPrice, now) {
    const pos = this.paper.position;
    if (!pos) return false;

    const pctMove = pos.side === 'LONG'
      ? (currentPrice - pos.entryPrice) / pos.entryPrice
      : (pos.entryPrice - currentPrice) / pos.entryPrice;

    const holdMs = now.getTime() - new Date(pos.openedAt).getTime();
    const holdMin = holdMs / 60000;

    let closeReason = null;
    if (pctMove >= CONFIG.PAPER_TP_PCT) closeReason = 'TP';
    else if (pctMove <= -CONFIG.PAPER_SL_PCT) closeReason = 'SL';
    else if (holdMin >= CONFIG.PAPER_MAX_HOLD_MIN) closeReason = 'TIMEOUT';

    if (!closeReason) return false;

    // Close the paper position
    const pnlPct = pctMove;
    const pnlUsd = pctMove * pos.notional;

    const tradeRecord = {
      id: crypto.randomUUID(),
      coin: pos.coin,
      side: pos.side,
      entryPrice: pos.entryPrice,
      exitPrice: currentPrice,
      notional: pos.notional,
      pnlPct: parseFloat((pnlPct * 100).toFixed(4)),
      pnlUsd: parseFloat(pnlUsd.toFixed(4)),
      reason: closeReason,
      confidence: pos.confidence,
      openedAt: pos.openedAt,
      closedAt: now.toISOString(),
      holdMin: parseFloat(holdMin.toFixed(1)),
    };

    // If live mirror position exists, send reduce-only close
    if (!CONFIG.TEST_MODE && pos.live) {
      try {
        const closeSide = pos.side === 'LONG' ? 'SHORT' : 'LONG';
        const liveClose = await this.api.placeOrder({
          coin: pos.coin,
          side: closeSide,
          notionalUsd: pos.notional,
          reduceOnly: true,
        });
        tradeRecord.liveClose = {
          ok: !!liveClose?.ok,
          oid: liveClose?.oid || null,
          fillPx: liveClose?.fillPx || null,
          fillSz: liveClose?.fillSz || null,
          closedAt: now.toISOString(),
        };
        appendLiveJournal({
          ts: now.toISOString(),
          event: 'LIVE_CLOSE',
          coin: pos.coin,
          side: closeSide,
          reduceOnly: true,
          oid: liveClose?.oid || null,
          fillPx: liveClose?.fillPx || null,
          fillSz: liveClose?.fillSz || null,
          notionalUsd: pos.notional,
          verified: !!liveClose?.oid,
        });
      } catch (e) {
        tradeRecord.liveClose = { ok: false, error: e.message, closedAt: now.toISOString() };
        appendLiveJournal({
          ts: now.toISOString(),
          event: 'LIVE_CLOSE_ERROR',
          coin: pos.coin,
          error: e.message,
          verified: false,
        });
      }
    }

    // Update paper stats/journal only in TEST mode
    if (CONFIG.TEST_MODE) {
      this.paper.stats.totalTrades++;
      if (pnlUsd > 0) this.paper.stats.wins++;
      else if (pnlUsd < 0) this.paper.stats.losses++;
      this.paper.stats.realizedPnl = parseFloat((this.paper.stats.realizedPnl + pnlUsd).toFixed(4));
      appendJournal(tradeRecord);
    }

    // Clear strategy position (paper/shadow)
    this.paper.position = null;
    savePaperState(this.paper);

    const emoji = pnlUsd >= 0 ? 'W' : 'L';
    console.log(`  PAPER CLOSE [${closeReason}] ${pos.side} SOL: ${pnlPct >= 0 ? '+' : ''}${(pnlPct * 100).toFixed(2)}% ($${pnlUsd >= 0 ? '+' : ''}${pnlUsd.toFixed(2)}) [${emoji}] held ${holdMin.toFixed(0)}min`);

    return true;
  }

  logPaperStats() {
    const s = this.paper.stats;
    if (s.totalTrades === 0) {
      console.log(`  [Paper] No trades yet`);
      return;
    }
    const wr = s.totalTrades > 0 ? ((s.wins / s.totalTrades) * 100).toFixed(0) : '0';
    console.log(`  [Paper] Trades: ${s.totalTrades} | Win: ${s.wins} Loss: ${s.losses} | WR: ${wr}% | PnL: $${s.realizedPnl >= 0 ? '+' : ''}${s.realizedPnl.toFixed(2)}`);
  }

  async fetchEntrySignal(side) {
    try {
      const res = await fetch(`${CONFIG.ENTRY_OPT_URL}/api/entry-signal?side=${side}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  pickSignal(longSig, shortSig) {
    const normalize = (s, side) => s ? ({ ...s, side }) : null;
    const a = normalize(longSig, 'long');
    const b = normalize(shortSig, 'short');
    if (a && b) return (a.confidence >= b.confidence) ? a : b;
    return a || b || null;
  }

  isActionableSignal(sig) {
    if (!sig || !sig.signal) return false;
    const actionables = new Set(['BUY', 'SELL', 'WEAK_BUY', 'WEAK_SELL']);
    return actionables.has(String(sig.signal).toUpperCase());
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════════

const bot = new HyperliquidBot();

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  bot.running = false;
  process.exit(0);
});

bot.start().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
