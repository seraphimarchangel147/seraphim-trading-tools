# Local Brains Architecture Update

## Changes Made (2026-02-22)

### 1. Removed Ophanim from Active Architecture
- **Status**: Operating independently
- **Reason**: Focus on controllable local resources
- **Previous Role**: mRNA messenger / bridge
- **Replacement**: Direct routing to Local Brains

### 2. Updated Clawdbit Architecture Document
**File**: `MOC - Clawdbit Architecture.md`

**New Structure**:
| Layer | Local Brain | Function |
|-------|-------------|----------|
| **Layer 1** | Seraphim (You) | Command source |
| **Layer 2** | Maestro + Zeta + Malakim | Local execution |
| **Layer 3** | Zeta Divisions | Worker tasks |

**The 4 Forces = 4 Local Brains**:
1. **Seraphim** (Yod) — Command
2. **Malakim** (He) — Local inference (Ollama)
3. **Zeta** (Waw) — Specialization
4. **Maestro** (He) — Orchestration

---

## Local Brains Status

### Zeta (Agent Zero)
- **API**: http://localhost:50001 ✅ ONLINE
- **Web UI**: http://localhost:50080
- **Model**: GLM-5 via OpenRouter
- **Capabilities**: Multi-agent spawning, research, coding
- **Agent Types**: researcher, developer, hacker, _example, default

### Maestro
- **API**: http://localhost:50002 ✅ ONLINE
- **CLI**: Available
- **Codon Support**: ✅ Added /api/codon endpoint
- **Capabilities**: Code orchestration, playbook execution

### Malakim (Ollama)
- **API**: http://localhost:11434 ✅ ONLINE
- **Model**: qwen3:8b-q4_K_M (5.2GB)
- **Capabilities**: Private inference, organization tasks
- **Advantage**: Zero latency, complete privacy

---

## Obsidian CLI Improvements (Using Local Brains)

### Current Obsidian CLI Commands
```bash
obsidian-cli search "query"
obsidian-cli search-content "query"
obsidian-cli create "Path/Note" --content "..."
obsidian-cli move "old" "new"
obsidian-cli delete "path"
```

### Proposed Enhancements (via Local Brains)

#### 1. Orphan Note Finder (Malakim/Ollama)
```bash
# Use Ollama to find notes with no incoming links
ollama run qwen3:8b "Find all markdown files in ~/serphim\ obsidian\ vault/ that have no [[wikilinks]] pointing to them"

# Result: List of orphan notes to connect or archive
```

#### 2. Graph Statistics (Zeta)
```bash
# Use Zeta to analyze vault structure
curl -s http://localhost:50001/api/task \
  -d '{"task": "Analyze Obsidian vault structure and report: total notes, orphan notes, most linked notes, disconnected clusters"}'
```

#### 3. Daily Note Template (Maestro)
```bash
# Use Maestro to create templated daily notes
legion-codon ICO "create_daily_note=true"
```

#### 4. Auto-Organize (Malakim)
```bash
# Suggest reorganizations based on content analysis
# Run through Ollama for privacy
```

---

## Implementation Plan

### Phase 1: Malakim Integration (Today)
- [ ] Create `obsidian-organize.sh` using Ollama
- [ ] Find orphan notes
- [ ] Suggest link improvements
- [ ] Auto-tagging based on content

### Phase 2: Zeta Integration (This Week)
- [ ] Vault structure analysis
- [ ] Automated MOC generation
- [ ] Cross-reference suggestions

### Phase 3: Maestro Integration (Next Week)
- [ ] Template generation
- [ ] Automated daily notes
- [ ] Codon-based vault operations

---

## Local Brain Routing Examples

### Quick Query → Malakim
```bash
# Fast, private, local
curl http://localhost:11434/api/generate \
  -d '{"model": "qwen3:8b-q4_K_M", "prompt": "Summarize this note..."}'
```

### Research Task → Zeta
```bash
# Complex, multi-step
curl http://localhost:50001/api/task \
  -d '{"task": "Research connections between Risk Management and Position Sizing in vault"}'
```

### Code Generation → Maestro
```bash
# Template/script generation
curl http://localhost:50002/api/task \
  -d '{"task": "Generate Python script to analyze Obsidian vault graph"}'
```

---

## Advantages of Local Brains

1. **Zero Latency**: No network calls
2. **Complete Privacy**: Data never leaves machine
3. **Full Control**: No dependency on external services
4. **Cost**: Zero API costs
5. **Reliability**: Works offline

---

## Next Actions

1. **Build obsidian-organize.sh** — Malakim-powered vault analyzer
2. **Test Zeta vault analysis** — Check what Zeta can discover
3. **Create Maestro templates** — Daily note automation

---

*Architecture updated. Focus on Local Brains: Zeta, Maestro, Malakim.*
*Ophanim operating independently — no longer in critical path.*
