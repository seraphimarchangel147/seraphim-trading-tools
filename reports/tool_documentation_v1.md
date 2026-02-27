# 🛠️ Tool Documentation — The Legion Toolkit

**Division:** DELTA (Content Operations)  
**Compiled:** 2026-02-16 22:19 EST  
**Tools Documented:** 4

---

## 1. 🎼 Maestro Bridge v5.0

**File:** `~/.openclaw/agents/maestro/maestro-bridge.py`  
**Language:** Python 3  
**Port:** 50002  
**Integration:** Maestro CLI (`maestro-cli`)

### Purpose
HTTP bridge enabling autonomous control of Maestro coding agents via CLI. Allows OpenClaw agents to spawn and manage parallel coding tasks through the Maestro desktop application.

### Key Features
- CLI integration with `maestro-cli` commands
- Full agent lifecycle management (list, send, sessions)
- Playbook execution with wait/verbose options
- Cross-origin support for web integration
- Environment cleanup (unsets CLAUDECODE for nested sessions)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Bridge health & CLI availability |
| GET | `/api/agents` | List all Maestro agents |
| GET | `/api/groups` | List all agent groups |
| POST | `/api/send` | Send message to agent |
| POST | `/api/playbook/run` | Execute playbook |
| POST | `/api/task` | Generic task dispatch |

### Usage Example
```bash
# Start bridge
python3 ~/.openclaw/agents/maestro/maestro-bridge.py

# Send task via curl
curl -X POST http://localhost:50002/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Review code for bugs"}'
```

### Dependencies
- Python 3.7+
- `maestro-cli` in PATH
- Maestro desktop app running

---

## 2. 🔍 Maestro Connection Detector

**File:** `~/.openclaw/agents/maestro/detect-maestro.sh`  
**Language:** Bash  
**Type:** Utility Script

### Purpose
Auto-discovers Maestro web server port and updates bridge configuration. Eliminates manual port configuration.

### Features
- Scans common ports (3000, 8080, 5000, 8000, 9000, 4200)
- Automatic bridge script updates via `sed`
- Connection testing with `curl`
- Human-readable output

### Scanned Ports
```
3000 (common dev)
8080 (alt dev)
5000 (Flask default)
8000 (Django/uvicorn)
9000 (common alt)
4200 (Angular default)
```

### Usage
```bash
# Run detection
~/.openclaw/agents/maestro/detect-maestro.sh

# Manual fallback
# Edit maestro-bridge.py: MAESTRO_PORT = <your_port>
```

---

## 3. 🚀 OpenClaw Agent Spawner

**File:** `~/.openclaw/agents/zeta/tools/openclaw_spawner.py`  
**Language:** Python 3  
**Author:** Zeta (Agent Zero Integration)

### Purpose
Allows Agent Zero (Zeta) to dynamically spawn OpenClaw sub-agents with specific personas and capabilities. Creates isolated agent workspaces with proper hierarchy tracking.

### Core Capabilities
- Spawn agents with unique IDs: `{persona}_{timestamp}`
- Auto-assign ports starting at 18800
- Generate agent configs, identity files, and start scripts
- Capability assignment based on persona
- Registry management for spawned agents

### Persona Types & Capabilities

| Persona | Capabilities |
|---------|-------------|
| `researcher` | web_search, web_fetch, memory_search |
| `trading_analyst` | exec, web_search, data_analysis |
| `code_reviewer` | read, edit, write, exec |
| `monitor` | exec, sessions_list, session_status |
| `communicator` | message, sessions_send, web_search |
| `default` | web_search, web_fetch, read, write |

### CLI Usage
```bash
# Spawn new researcher agent
python3 openclaw_spawner.py spawn researcher "Research Solana ecosystem"

# List all spawned agents
python3 openclaw_spawner.py list

# Terminate agent
python3 openclaw_spawner.py terminate researcher_20260216_221530
```

### Python API
```python
from openclaw_spawner import spawn_openclaw_agent

result = spawn_openclaw_agent(
    persona="researcher",
    channel="internal",
    model="kimi-coding/k2p5",
    task="Research Polymarket API"
)
# Returns: agent_id, endpoint, status
```

### Generated Files per Agent
```
~/.openclaw/agents/{agent_id}/
├── config.json          # Agent configuration
├── IDENTITY.md          # Agent identity/purpose
├── start-agent.sh       # Launch script
└── TASK.md              # Assigned task (optional)
```

---

## 4. 🔗 Shared Workspace (Agent Zero Side)

**File:** `~/.openclaw/agents/zeta/tools/shared_workspace_agentzero.py`  
**Language:** Python 3  
**Type:** Inter-Agent Communication Bridge

### Purpose
Enables bidirectional communication between Agent Zero (Zeta) and OpenClaw agents via shared filesystem. Uses JSON files and markdown for structured data exchange.

### Architecture
```
~/ai-agents/shared/
├── openclaw/
│   ├── input/      # Commands TO OpenClaw
│   └── output/     # Results FROM OpenClaw
├── agent-zero/
│   └── output/     # Results FROM Agent Zero
└── common/
    ├── memory/     # SHARED_MEMORY.md
    ├── tasks/      # queue.json
    └── registry/   # agents.json
```

### Core Methods

| Method | Purpose |
|--------|---------|
| `write_output()` | Send data to OpenClaw |
| `read_input()` | Receive data from OpenClaw |
| `read_shared_memory()` | Access shared memory |
| `update_shared_memory()` | Append to shared memory |
| `get_next_task()` | Pull from task queue |
| `complete_task()` | Mark task done |
| `read_agent_registry()` | View agent registry |
| `update_agent_registry()` | Update agent info |

### CLI Usage
```bash
# Write message to OpenClaw
python3 shared_workspace_agentzero.py write "Analysis complete"

# Read latest from OpenClaw
python3 shared_workspace_agentzero.py read

# Update shared memory
python3 shared_workspace_agentzero.py memory "status=ready"

# Get next task
python3 shared_workspace_agentzero.py next-task

# Complete task
python3 shared_workspace_agentzero.py complete task_123 "success"
```

### Environment Variable
```bash
# Override default path
export SHARED_WORKSPACE=/custom/path
```

---

## Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│                    THE LEGION TOOLKIT                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐         ┌─────────────┐                   │
│  │   Maestro   │◄───────►│   Bridge    │ Port 50002        │
│  │   Desktop   │  HTTP   │   v5.0      │                   │
│  └─────────────┘         └─────────────┘                   │
│         ▲                                                  │
│         │ CLI                                              │
│  ┌─────────────┐                                           │
│  │detect-maestro│ (Auto-config)                            │
│  └─────────────┘                                           │
│                                                             │
│  ┌─────────────┐         ┌─────────────────┐               │
│  │    Zeta     │◄───────►│  Agent Spawner  │               │
│  │ Agent Zero  │  Tools  │                 │               │
│  └─────────────┘         └─────────────────┘               │
│         │                                                  │
│         │ Spawns                                           │
│         ▼                                                  │
│  ┌─────────────────────────────────────────┐               │
│  │         OpenClaw Sub-Agents             │               │
│  │  (researcher, analyst, monitor, etc.)   │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  ┌─────────────┐         ┌─────────────┐                   │
│  │    Zeta     │◄───────►│   Shared    │ Filesystem        │
│  │ Agent Zero  │  JSON   │  Workspace  │                   │
│  └─────────────┘         └─────────────┘                   │
│         │                          │                       │
│         └──────────┬───────────────┘                       │
│                    │                                       │
│                    ▼                                       │
│            ┌─────────────┐                                 │
│            │  OpenClaw   │                                 │
│            │   Agents    │                                 │
│            └─────────────┘                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Maintenance Notes

- All tools log to their respective agent directories
- Agent spawner maintains registry at `~/.openclaw/agents/zeta_spawned_agents.json`
- Shared workspace auto-creates directories on first use
- Maestro bridge requires `maestro-cli` in PATH
- Port conflicts handled automatically by spawner

*Documented by DELTA Division for The Legion.*
