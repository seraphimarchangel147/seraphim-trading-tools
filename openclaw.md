# OpenClaw Project State (`openclaw.md`)

## 🎯 Current Objectives
- **[Active]**: Fix Mission Control V2 dashboard (tabs, data loading, avatars)
- **[Blocked]**: External dashboard access (gateway binds localhost only)
- **[Long Term]**: Build autonomous research/trading agent swarm

## 🏗️ Architecture & Stack
- **Core**: OpenClaw (Node.js/TypeScript)
- **Dashboard**: Vanilla HTML/CSS/JS (single file, no build step)
- **Data**: Local file system + APIs (Crabwalk, Drift)
- **Comms**: SimpleX CLI (reliable), SSH (port 2222)
- **Host**: WSL2 on Windows (Cherubim at 100.126.212.39)

## 📜 Coding Rules (The Guardrails)

### 1. Multi-Agent Safety
- **NEVER** have multiple agents edit the same file simultaneously
- **ALWAYS** verify file state before editing (check timestamps, hash)
- **ONE** agent per file per session - period

### 2. File Size Limits
- Files >1000 lines = high risk for context window issues
- Files >3000 lines = spawn synthesis agent to coordinate, not parallel fixers
- Dashboards >5000 lines = needs modularization or rebuild from scratch

### 3. Before Any Edit
```
1. Read file completely (multiple reads if needed)
2. Identify ALL dependencies/interconnections
3. Document changes in this file FIRST
4. Make surgical edits
5. Verify file still valid (syntax check)
```

### 4. Test Before Declaring Done
- HTML: Validate with `python3 -c "open('file').read()"` + browser check
- JS: Check for syntax errors, undefined variables
- APIs: Test with curl before assuming they work

### 5. The "Caveman Code" Rule
- Simple > Clever
- Working > Perfect
- If you can't explain it in one sentence, it's too complex

## 🧠 Lessons Learned (The Immune System)

### 2026-02-13: Mission Control V2 Breakage
- **What**: 3 parallel agents editing 5016-line file = broken tabs, data, avatars
- **Why**: Context limits + no coordination + no verification
- **Fix**: New "Agentic Architect" protocol above
- **Rule**: No parallel edits on files >1000 lines

### 2026-02-13: Gateway Binding Issues
- **What**: Changing gateway to "0.0.0.0" or "lan" caused instability
- **Why**: Gateway not designed for external exposure
- **Fix**: Use SSH tunnel for dashboard access
- **Rule**: Don't change gateway bind config

### 2026-02-13: SimpleX Bridge Server Down
- **What**: SimpleX bridge on port 3001 not running
- **Why**: User explicitly said don't restart services after crashes
- **Fix**: Use SimpleX CLI instead (`simplex-chat -e "@contact message"`)
- **Rule**: CLI > Bridge for stability

### 2026-02-13: Three.js Avatar Complexity
- **What**: Three.js avatars in dashboard require complex setup, often fail
- **Why**: GLB loading, canvas contexts, render loops = fragile
- **Fix**: Use CSS avatars or static images instead
- **Rule**: No Three.js in dashboards unless absolutely necessary

### 2026-02-13: Mission Control V4 Avatars Fixed
- **What**: Canvas-based avatars not showing up initially
- **Why**: Iframe approach was unreliable, Three.js too heavy
- **Fix**: Created lightweight Canvas 2D avatars with particle effects
- **Rule**: Canvas 2D > Three.js for dashboard avatars

### 2026-02-13: Rive Avatar Integration
- **What**: User wanted Sasquatch character from Rive marketplace
- **Why**: Interactive, professional character animation
- **Fix**: Integrated Rive Runtime with state machine controller
- **Rule**: Use Rive for character animation when available

## 📂 Active Files & Status

| File | Lines | Status | Last Agent |
|------|-------|--------|------------|
| `/clawd/dashboard/mission-control-v2.html` | ~5000 | 🗑️ ARCHIVED | - |
| `/clawd/dashboard/mission-control-v3.html` | ~450 | ✅ WORKING | Seraphim |
| `/clawd/dashboard/mission-control-v4/` | ~2000 | ✅ NEW BUILD | Seraphim |
| `/clawd/scripts/trading/monitor.mjs` | ~200 | ✅ WORKING | Seraphim |
| `/clawd/simplex-bridge-server.mjs` | ~150 | ⛔ DOWN | - |

### Mission Control V4 Features
- **Rive-Inspired Dark UI** - Red/Black/White/Grey color scheme
- **Motion.dev animations** - Smooth transitions and micro-interactions
- **Custom Seraphim Avatar** - Canvas-based six-winged angel with interactive states
- **Live Trading Data** - Real-time P&L, war chest, trade history
- **Crabwalk Integration** - Server status monitoring
- **Particle Effects** - Floating embers around the avatar
- **Modular Architecture** - Separate JS modules, maintainable code

## 🔧 Recommended Next Actions

1. **Archive** `mission-control-v2.html` (keep for reference)
2. **Build** `mission-control-v3.html` from scratch with:
   - Modular JS (separate files)
   - No Three.js
   - Simple tabs (CSS only)
   - Demo data built-in
3. **Use** SSH tunnel for access: `ssh -L 8080:localhost:18789 ...`

## 🧩 3 Brains Integration

This file is **Brain 1** - the persistent memory/context.

**Brain 2** (Cherubim) reads this before any coding task.
**Brain 3** (Legion swarm) checks this for coordination rules.

**Before spawning Legion**: Update this file with task scope and assign single-file ownership.
