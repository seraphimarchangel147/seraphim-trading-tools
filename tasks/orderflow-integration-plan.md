# Orderflow Trading Integration Plan
## Fabervaale Framework → Drift Bots

---

## Phase 1: Infrastructure (Week 1)

### Day 1-2: Data Pipeline
- [ ] Add volume data to Drift market data feed
- [ ] Store 24h volume profile in Redis/memory
- [ ] Calculate POC, VAH, VAL every hour
- [ ] Log LVN detection

### Day 3-4: VSA Detection
- [ ] Integrate VSADetector into entry logic
- [ ] Test absorption signals on historical data
- [ ] Calibrate volume/ratio thresholds
- [ ] Add to state files

### Day 5-7: IVB Model
- [ ] Create session-based IVB tracker
- [ ] Detect opening range (first 60 min)
- [ ] Breakout confirmation logic
- [ ] Backtest on 30 days of data

---

## Phase 2: Entry Logic Upgrade (Week 2)

### Enhanced Entry Signals

Current Logic:
```javascript
if (rsi < 30 && trend === 'UP') enterLong();
```

New Logic:
```javascript
let confidence = 0;

// Base signal
if (rsi < 30 && trend === 'UP') confidence += 0.4;

// Orderflow confirmation
if (vsa.type === 'ABSORPTION' && price > vwap) confidence += 0.3;
if (volumeProfile.isNearLevel(price, 'VAL')) confidence += 0.2;
if (ivb.phase === 'BREAKOUT' && ivb.direction === 'LONG') confidence += 0.4;

// Enter only if confidence > 0.7
if (confidence > 0.7) {
    enterLong({
        size: baseSize * confidence,
        stop: calculateStop(),
        target: volumeProfile.VAH // Take profit at VAH
    });
}
```

---

## Phase 3: Exit Logic Upgrade (Week 2-3)

### Smart Exits

**Current**: Fixed R-multiples (1R, 2R, 3R)

**New**: Volume-profile aware

```javascript
// Scale out at key levels
if (position.side === 'LONG') {
    if (price >= volumeProfile.VAH) {
        scaleOut(0.5); // 50% at VAH
    }
    if (price >= volumeProfile.VAH + (ATR * 0.5)) {
        scaleOut(0.25); // 25% above VAH
    }
    if (vsa.type === 'EXHAUSTION') {
        closeAll(); // Full exit on exhaustion
    }
}

// Trailing stop below VAL
if (price < volumeProfile.VAL) {
    closeAll(); // Invalidation
}
```

---

## Phase 4: Position Sizing (Week 3)

### Confidence-Weighted Sizing

```javascript
function calculatePositionSize(signal) {
    let size = accountBalance * 0.02; // 2% base risk
    
    // Orderflow adjustments
    if (signal.absorption) size *= 1.25;
    if (signal.ivbBreakout) size *= 1.3;
    if (signal.volumeConfirmation > 2) size *= 1.2;
    
    // Risk adjustments
    if (signal.confidence < 0.6) size *= 0.5;
    
    return Math.min(size, maxPositionSize);
}
```

---

## Phase 5: Testing & Optimization (Week 4)

### Paper Trading Checklist
- [ ] 1 week paper trade all signals
- [ ] Track win rate by signal type
- [ ] Measure R-multiple improvements
- [ ] Verify no overfitting

### Metrics to Beat
| Metric | Current | Target |
|--------|---------|--------|
| Win Rate | 66.7% | >70% |
| Avg R-Multiple | 1.5R | >2.0R |
| Max Drawdown | -$50 | <-$30 |
| Profit Factor | 1.8 | >2.2 |

---

## Quick Implementation (Start Today)

### Step 1: Add Volume Profile Module
```bash
# Copy the orderflow module
cp ~/.openclaw/clawd/scripts/trading/orderflow-volume.mjs \
   ~/.openclaw/clawd/scripts/trading/modules/

# Import in bot
import { VolumeProfile, VSADetector, IVBModel } from './modules/orderflow-volume.mjs';
```

### Step 2: Patch drift-auto-trader.mjs
```javascript
// At top of file
import { VolumeProfile, VSADetector } from './modules/orderflow-volume.mjs';

// Initialize
const volumeProfile = new VolumeProfile('SOL-PERP', 0.05, 24);
const vsa = new VSADetector(14);

// In main loop
vsa.addCandle(open, high, low, close, volume);
const vsaSignal = vsa.analyzeLastCandle();

if (vsaSignal.type === 'ABSORPTION' && vsaSignal.confidence > 0.7) {
    console.log(`🎯 ABSORPTION detected at ${close}`);
    // Add to entry logic
}
```

### Step 3: Test Single Signal
Run bot for 1 day, watch for:
- Absorption patterns at support
- Volume spikes without price movement
- POC gravity pulls

---

## Expected Improvements

| Scenario | Before | After |
|----------|--------|-------|
| False breakout | Enter on momentum | Wait for absorption confirmation |
| Trend continuation | Exit at fixed R | Hold through VAH test |
| Range bound | Random entries | Trade POC reversion only |
| Breakout | Miss or late entry | IVB confirmation entry |

---

## Risk Warnings

⚠️ **DO NOT**:
- Trade on volume profile alone
- Ignore broader market context
- Over-size on absorption signals
- Chase IVB breakouts without volume

✅ **ALWAYS**:
- Confirm with price action
- Use proper stop losses
- Paper test for 1 week minimum
- Monitor win rate degradation

---

## Next Action

**Want me to**:
1. Patch `drift-auto-trader.mjs` with orderflow logic?
2. Create backtest script for the framework?
3. Set up volume data ingestion?
4. All of the above?

*Framework loaded. Ready to upgrade the bots.* 🎯
