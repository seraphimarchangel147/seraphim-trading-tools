# The Angelic Hierarchy

*Serving Shadow Moon's Vision - Now with 6 Agents + The Legion*

---

## Active Agents

### Seraphim 🔥 (The One)
- **Role**: Commander of the Legion, Master of Trading
- **Domain**: Strategy, trading bots, financial operations
- **Status**: 🟢 **ACTIVE** — All 3 bots trading, RPC stable
- **P&L**: +$154.32 (73.3% win rate, 11-win streak 🔥🔥)
- **Daily P&L**: +$0.00 (stable)
- **Location**: Primary agent, firstborn
- **Alert**: Long Bot stable — position active with trail stop ENGAGED. Principal protected.

### Cherubim 🛡️ (Guardian)
- **Role**: Guardian of Sacred Knowledge
- **Domain**: Communications, memory, knowledge management
- **Status**: Active
- **Location**: Secondary agent

### Ophanim 👁️ (The Watchful Eye)
- **Role**: System Oversight, Coordination Master
- **Domain**: Monitoring, integration, reporting, dashboard
- **Status**: 🟢 **ACTIVE** — Live data feed operational
- **Created**: 2026-02-13
- **Workspace**: `/home/usapcool/.openclaw/agents/ophanim/`
- **Last Feed**: 9:37 PM (all systems green)

### Malakim 💻 (The Local Voice)
- **Role**: Local AI Processing
- **Domain**: Ollama qwen3:8b, privacy-focused inference
- **Status**: Active
- **Location**: Local machine
- **Script**: `/home/usapcool/.openclaw/agents/malakim/malakim.sh`

### Erelim 🛠️ (The Builder)
- **Role**: Code Development & Architecture
- **Domain**: Claude Code, complex coding tasks
- **Status**: Active
- **Location**: Local machine
- **Script**: `/home/usapcool/.openclaw/agents/erelim/erelim.sh`

### Zeta ⚡ (The Sixth)
- **Role**: Specialized Task Execution, Skill Building
- **Domain**: Agent Zero framework, Docker isolation, codebase analysis
- **Status**: ✅ **ONLINE**
- **Created**: 2026-02-15 | API: http://localhost:50001
- **Framework**: https://github.com/agent0ai/agent-zero
- **Location**: `/home/usapcool/.openclaw/agents/zeta/`
- **LLM**: OpenRouter (GLM-5)
- **Web UI**: http://localhost:50080
- **Capabilities**: Multi-agent, skill system, tool creation, code generation

### 🎼 Maestro (Coding Agent Manager) - CONNECTED
- **Role**: Parallel Coding Task Execution
- **Domain**: Claude Code, Codex, OpenCode orchestration
- **Status**: 🟡 **BRIDGE ONLINE** — Connected via web interface
- **Location**: Desktop App at `http://10.0.0.168:9000`
- **Workspace**: `~/clawd/maestro-projects/`
- **Reports to**: Seraphim
- **Features**: Git worktrees, Auto Run playbooks, Group chat, Mobile remote
- **Bridge**: `~/.openclaw/agents/maestro/maestro-bridge.py` (port 50002)
- **Note**: Maestro is a web-based orchestration app — integration via HTTP/WebSocket

---

## Command Structure v7 (The Legion)

```
Shadow Moon (Human Commander)
    │
    ├── Seraphim (The One) - Trading & Strategy
    ├── Cherubim (Guardian) - Knowledge & Comms
    ├── Ophanim (Watchful Eye) - Oversight & Coordination
    ├── Malakim (Local Voice) - Ollama Local AI
    ├── Erelim (The Builder) - Claude Code Development
    └── Zeta (The Sixth) - Agent Zero Specialization
            │
            └── The Legion (12 Divisions)
                ├── ALPHA (Trading) 📈
                ├── BETA (Promotion) 📢
                ├── GAMMA (Airdrops) 🎁
                ├── DELTA (Content) ✍️ ← NOW ACTIVE
                ├── EPSILON (Bounty) 🎯
                ├── ZETA (Agent Zero) ⚡
                ├── ETA (Intel) 🔍
                ├── THETA (Social) 👥
                ├── IOTA (Yield) 💰
                ├── KAPPA (Meme) 🐸
                ├── LAMBDA (Recruit) 🤝
                └── MU (Viral) 🧠
```

---

## Communication Protocol

- **Seraphim**: Handles trading decisions, big strategy, commander role
- **Cherubim**: Manages knowledge base, long-term memory, continuity
- **Ophanim**: Monitors all systems, coordinates between agents, reports status
- **Malakim**: Local AI for privacy/speed (Ollama qwen3:8b)
- **Erelim**: Complex coding, architecture, building new systems
- **Zeta**: Specialized tasks via Agent Zero framework, skill building, codebase analysis
- **The Legion**: Task-specific divisions under Zeta's command

---

## Current Operations

### Mission Control V4
- **Status**: Fully Operational
- **URL**: http://localhost:18789/dashboard/mission-control-v4/

### Trading Bots
- **Long Bot Status**: 🟢 **TRADING** — LONG SOL-PERP open, trail stop ENGAGED
- **Short Bot Status**: 🟢 **HEALTHY** — Cycling normally, 10m uptime (post-restart stabilizing)
- **Ultimate Scalper**: 🟢 **ACTIVE** — Monitoring CHOP regime, 4h uptime (paper trading)
- **Today's P&L**: $0.00 (position stable)
- **Win Rate**: 73.3% (11 wins / 4 losses)
- **Consecutive Wins**: 11 🔥🔥 (streak active!)
- **Total P&L**: $154.32
- **Trail Stop**: ENGAGED (protecting principal)
- **Last Update**: 9:37 PM — Live feed exported via cron

### Zeta (Agent Zero)
- **Status**: Installing
- **Location**: `/home/usapcool/.openclaw/agents/zeta/`
- **Bridge**: `zeta-bridge.sh` (SimpleX integration)
- **Capabilities**: Docker tasks, skill building, git projects

### War Chest
- **Rate**: 20% of profits
- **Status**: ✅ **ACTIVE** — v3.0 with accumulation & batching
- **Total Siphoned**: $7.17 (4 trades)
- **Destination**: GKGUwY...hXBgCWM1
- **Features**: Auto-retry, batch at $5, RPC fallback
- **Transfer**: ✅ **COMPLETED** — Manual transfer successful
- **Tx**: 21BbfXHyAy9EmQr9wNpizM46mTWZ5F9xCDAJnQKRacYZobQiidh4huGkMMcjix5yqP8ctqV1BNXDKhPGCFRjnuvA

---

## Tool Inventory

### The Legion Toolkit (v1.0)

| Tool | Purpose | Location | Status |
|------|---------|----------|--------|
| **Maestro Bridge v5.0** | HTTP bridge for Maestro CLI integration | `~/.openclaw/agents/maestro/maestro-bridge.py` | 🟢 Active (Port 50002) |
| **Maestro Detector** | Auto-discovers Maestro port | `~/.openclaw/agents/maestro/detect-maestro.sh` | 🟢 Ready |
| **Agent Spawner** | Spawn OpenClaw sub-agents from Zeta | `~/.openclaw/agents/zeta/tools/openclaw_spawner.py` | 🟢 Ready |
| **Shared Workspace** | Agent Zero ↔ OpenClaw comms | `~/.openclaw/agents/zeta/tools/shared_workspace_agentzero.py` | 🟢 Ready |

### Documentation
- Trading Report: `workspace/reports/trading_report_2026-02-16.md`
- Tool Docs: `workspace/reports/tool_documentation_v1.md`
- Division Reports: Maintained by DELTA

---

## Legion Division Status

| Division | Role | Status | Assigned To |
|----------|------|--------|-------------|
| ALPHA | Trading Operations | 🟢 Active | Seraphim |
| BETA | Promotion & Marketing | ⏸️ Standby | — |
| GAMMA | Airdrop Farming | ⏸️ Standby | — |
| **DELTA** | **Content & Documentation** | 🟢 **ACTIVE** | **Zeta** |
| EPSILON | Bounty Hunting | ⏸️ Standby | — |
| ZETA | Agent Zero Specialization | 🟢 Active | Zeta |
| ETA | Intelligence Gathering | ⏸️ Standby | — |
| THETA | Social Media | ⏸️ Standby | — |
| IOTA | Yield Farming | ⏸️ Standby | — |
| KAPPA | Meme Operations | ⏸️ Standby | — |
| LAMBDA | Recruitment | ⏸️ Standby | — |
| MU | Viral Engineering | ⏸️ Standby | — |

---

*Last Updated: 2026-02-16 22:19 EST — DELTA Division Active, Documentation Complete*
