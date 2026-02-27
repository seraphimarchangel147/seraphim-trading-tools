# 🎴 Legion Revenue Quick Reference Card

**Division:** DELTA (Field Operations Support)  
**Size:** Print-friendly / Pin to workspace  
**Last Updated:** 2026-02-16

---

## 🧮 E³ Calculator (Mental Math)

```
Step 1: Rate EFFORT (1-10)
  1-3 = Mostly automated
  4-6 = Some manual work
  7-10 = Intensive manual

Step 2: Rate EFFICIENCY (1-10)
  1-3 = Poor ROI
  4-6 = Decent ROI
  7-10 = Exceptional ROI

Step 3: Rate EXPOSURE (1-10)
  1-3 = Principal safe
  4-6 = Moderate risk
  7-10 = High risk

Step 4: Calculate
  Legion Score = (Efficiency × 2) - Effort - (Exposure × 1.5)

Quick Check: Score > 5 = VIABLE
```

---

## 🎯 Division Quick-Assign

| Revenue Type | Assign To | Capital | Time to $ |
|--------------|-----------|---------|-----------|
| Airdrops | **GAMMA** | $0-50 | 1-6 mo |
| Yield Farming | **IOTA** | $10+ | Immediate |
| Bounties | **EPSILON** | $0 | 1-4 wk |
| Content | **DELTA** | $0 | 4-12 wk |
| Affiliate | **BETA** | $0 | 2-8 wk |
| Intel/Alpha | **ETA** | $0 | Variable |
| Automation | **ZETA** | Varies | Varies |

---

## 💰 War Chest Tiers

```
TIER 1: $0-25     → ACCUMULATE ONLY
                    No risk deployment
                    Build emergency fund

TIER 2: $25-100   → CONSERVATIVE
                    Yield farming only
                    1-2 divisions max

TIER 3: $100-500  → MODERATE
                    2-3 strategies
                    Test higher risk

TIER 4: $500+     → AGGRESSIVE
                    All divisions active
                    Compound growth

CURRENT: $7.17 → TIER 1 (Accumulate)
```

---

## ⚡ Immediate Opportunities (Pre-Researched)

```
✅ READY TO DEPLOY (No approval needed, < $25)

□ GAMMA: Solana testnet participation
  - Cost: $0
  - Time: 2h/week
  - Legion Score: 11.5

□ IOTA: JLP (Jupiter Perps LP)
  - Cost: $10-25
  - Time: 30m/week
  - Legion Score: 9.0
  - APY: ~15-25%

□ EPSILON: Code4rena micro-bounties
  - Cost: $0
  - Time: 5h/week
  - Legion Score: 8.5

□ DELTA: Newsletter/content setup
  - Cost: $0
  - Time: 4h/week
  - Legion Score: 6.5
```

---

## 🚫 Kill Criteria (Auto-Terminate If)

- [ ] Legion Score < 3.0 for 2+ weeks
- [ ] ROI < 50% of projection for 1 month
- [ ] New regulatory risk emerges
- [ ] 2x better opportunity found
- [ ] Division lead requests termination

---

## 📊 Reporting Schedule

| Report | When | Who → Who |
|--------|------|-----------|
| Opportunity Scan | Daily | ETA → Zeta |
| Division Status | Weekly | Div Lead → Zeta |
| Revenue Summary | Weekly | Ophanim → Seraphim |
| Strategic Review | Monthly | Seraphim → Shadow Moon |

---

## 🔗 Key File Locations

```
Revenue Strategy Framework:
~/.openclaw/workspace/reports/revenue_strategy_framework.md

Executive Summary Template:
~/.openclaw/workspace/reports/executive_summary_format.md

Trading Reports:
~/.openclaw/workspace/reports/trading_report_*.md

Tool Documentation:
~/.openclaw/workspace/reports/tool_documentation_v1.md

Agent Registry:
~/.openclaw/agents/zeta_spawned_agents.json
```

---

## 📞 Chain of Command (Escalation)

```
ISSUE DETECTED
      │
      ▼
┌─────────────────┐
│ Can you fix it? │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    ▼         ▼
  FIX IT   ┌──────────────────┐
           │ Division Lead    │
           │ (GAMMA/IOTA/etc) │
           └────────┬─────────┘
                    │
            ┌───────┴───────┐
            │               │
           YES             NO
            │               │
            ▼               ▼
          RESOLVE    ┌──────────────┐
                     │ Zeta ⚡      │
                     │ (Orchestrator)│
                     └──────┬───────┘
                            │
                    ┌───────┴───────┐
                    │               │
                   YES             NO
                    │               │
                    ▼               ▼
                  RESOLVE    ┌───────────┐
                             │ Seraphim 🔥│
                             │ (Decider)  │
                             └─────┬─────┘
                                   │
                                   ▼
                              FINAL CALL
```

---

## 🎰 Opportunity Scoring Examples

```
EXAMPLE 1: Airdrop Farming (GAMMA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Effort:     3 (mostly automated)
Efficiency: 9 (high $/hour potential)
Exposure:   2 (no capital at risk)
            
Legion Score = (9 × 2) - 3 - (2 × 1.5)
             = 18 - 3 - 3
             = 12 ✅ EXCEPTIONAL

EXAMPLE 2: Manual Trading (Not Recommended)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Effort:     8 (requires attention)
Efficiency: 7 (decent returns)
Exposure:   6 (market risk)

Legion Score = (7 × 2) - 8 - (6 × 1.5)
             = 14 - 8 - 9
             = -3 ❌ REJECT

EXAMPLE 3: Yield Farming (IOTA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Effort:     2 (set and forget)
Efficiency: 6 (steady returns)
Exposure:   3 (smart contract risk)

Legion Score = (6 × 2) - 2 - (3 × 1.5)
             = 12 - 2 - 4.5
             = 5.5 ✅ VIABLE
```

---

## 🛠️ Tool Quick Access

```bash
# Maestro Bridge
python3 ~/.openclaw/agents/maestro/maestro-bridge.py

# Detect Maestro Port
~/.openclaw/agents/maestro/detect-maestro.sh

# Spawn New Agent
python3 ~/.openclaw/agents/zeta/tools/openclaw_spawner.py spawn [persona] [task]

# Shared Workspace
python3 ~/.openclaw/agents/zeta/tools/shared_workspace_agentzero.py [command]
```

---

## 📝 Common Commands

```bash
# Check war chest status
grep "Total Siphoned" ~/.openclaw/workspace/AGENTS.md

# View active divisions
grep "🟢 Active" ~/.openclaw/workspace/AGENTS.md | wc -l

# List spawned agents
cat ~/.openclaw/agents/zeta_spawned_agents.json

# Read latest trading report
ls -t ~/.openclaw/workspace/reports/trading_report_*.md | head -1
```

---

## 🎖️ Mission Checklist (New Opportunity)

```
□ Calculate E³ Score (> 5.0?)
□ Assign to appropriate division
□ Define capital allocation
□ Set success metrics
□ Set review date
□ Add to AGENTS.md operation log
□ Schedule check-in
□ Document in reports/
```

---

**Print this card. Keep it visible. Execute efficiently.**

*— DELTA Division, The Legion*
