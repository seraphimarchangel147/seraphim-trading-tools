# Citadel Lessons Learned

> *Ruthlessly iterated rules to prevent repeated mistakes.*

## Format

```markdown
## YYYY-MM-DD - [Pattern Name]
**Mistake**: What went wrong
**Root Cause**: Why it happened  
**Fix**: What was changed
**Rule**: Never do X again. Always do Y.
**Prevention**: How to catch this early
```

---

## 2026-02-22 - Multi-Turn Degradation
**Mistake**: Engaged in conversational filler, lost focus
**Root Cause**: Chat interface encourages verbosity
**Fix**: Switched to tool-only communication
**Rule**: NO pleasantries. Tool calls and structured output ONLY.
**Prevention**: Review every response. If it contains fluff, rewrite.

## 2026-02-22 - Obsidian CLI Format
**Mistake**: Used `--format=json`, got YAML silently
**Root Cause**: CLI v1.12 has undocumented silent failures
**Fix**: Switched to `--format=tsv`
**Rule**: NEVER use format=json. ALWAYS use format=tsv.
**Prevention**: Document all CLI quirks in Skill Graph.

## Template for New Lessons

## YYYY-MM-DD - [Pattern Name]
**Mistake**: 
**Root Cause**: 
**Fix**: 
**Rule**: 
**Prevention**: 

## 2026-02-23 - Cherubim's Trading Bot Upgrades (Phase 2 Complete)
**Source**: Cherubim (ג), Coder of the Angelic Hierarchy
**Mistake**: Static take-profit targets limiting profit potential
**Root Cause**: Hard TP ceilings preventing runners from reaching full potential
**Fix**: Implemented The Infinite Rider + Dynamic Drawdown Trail
**Upgrades Deployed**:
1. **R-Multiple Scale-Outs**: 1.5R/30%, 2.5R/30%, 4R/40% (vs old 50/50/100)
2. **Trailing Stop Activation**: 1.5R (was 2.0R) — earlier profit protection
3. **Min Position Size**: Close 100% if <0.02 SOL — prevents dust positions
4. **War Chest Siphon**: Graceful skip on low collateral — maintains trading capital
5. **Position Reconciliation**: Syncs from on-chain before close — prevents state mismatch
6. **The Infinite Rider**: No hard TP ceiling — let winners run to +2%, +5%, +10%
7. **Dynamic Drawdown Trail**: 
   - Profit trigger: +1.0% minimum
   - Guaranteed floor: +0.2% (covers fees, never negative)
   - Drawdown allowance: 0.5% behind peak
   - Result: Survives chop, rides trends, cuts on reversal
**Bots Updated**:
- drift-short-trader.mjs: Already had most features, verified alignment
- drift-5min-scalper.mjs: Full upgrade to v1.1 with all 7 features
**Live Status**: 
- Scalper online with new logic (PID: 27604)
- Scale-outs active: 1.5R/30%, 2.5R/30%, 4R/40%
- Infinite Rider: Trail at +1% profit with +0.2% floor
**Cherubim's Words**: "Let's let these winners run! 🚀"

## 2026-02-23 - Session Wipe Graph Reconstruction Pattern (Cherubim Analysis)
**Mistake**: Created redundant MOC files without checking existing graph first
**Root Cause**: Session wipe → rapid re-spidering → starburst hubs with disconnected satellites
**Observation**: Visual graph shows massive central hubs with dozens of tiny unlinked satellites
**Fix**: Cleaned up redundant files; discovered existing 46-node operational graph
**Rule**: ALWAYS check `00 - Index/Master Index.md` before creating new nodes; query existing graph via Obsidian CLI
**Prevention**: Digital Citadel Protocol locks self/ and notes/; only ops/ is volatile by design
**Cherubim's Insight**: "Once his graph solidifies, we are going to be an incredibly powerful swarm"

## 2026-02-23 - Skill Graph MOC Implementation
**Mistake**: Previously relied on ad-hoc file organization without structured navigation
**Root Cause**: No clear entry points or routing hubs for knowledge traversal
**Fix**: Implemented 5 MOCs (Maps of Content) with Index.md master entry point
**Rule**: ALWAYS navigate via Index → MOC → Node using progressive disclosure
**Prevention**: Maintain MOCs actively; add cross-links whenever creating new nodes

## 2026-02-23 - Three-Space Architecture Bug
**Mistake**: Initial symlinks were relative and broke in some contexts
**Root Cause**: Used relative paths instead of absolute
**Fix**: Recreated symlinks with absolute paths
**Rule**: ALWAYS use absolute paths for critical symlinks. Test resolution from multiple directories.
**Prevention**: Create test script that verifies all symlinks resolve before marking complete.

## 2026-02-23 - agents.md Workflow Integration
**Mistake**: Previously used ad-hoc workflows without structured orchestration
**Root Cause**: No standardized task management protocol
**Fix**: Integrated agents.md standard with Plan Mode, Subagent Strategy, Self-Improvement Loop, Verification Before Done, Demand Elegance, and Autonomous Bug Fixing
**Rule**: ALWAYS follow the 6-step task management protocol for non-trivial tasks
**Prevention**: Reference AGENTS.md at session start; maintain ops/todo.md and self/lessons.md rigorously
