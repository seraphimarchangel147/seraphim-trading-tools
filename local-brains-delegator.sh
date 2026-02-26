#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# LOCAL BRAINS TASK DELEGATOR
# Remembers agent roles and delegates tasks automatically
# Checks Obsidian vault when memory is unclear
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"

# Configuration
LOG_DIR="$HOME/.openclaw/logs/local-brains"
CONFIG_DIR="$HOME/.openclaw/config/local-brains"
OBSIDIAN_VAULT="$HOME/serphim obsidian vault"
DELEGATION_LOG="$LOG_DIR/delegation-$(date +%Y-%m-%d).log"

mkdir -p "$LOG_DIR" "$CONFIG_DIR"

# ═══════════════════════════════════════════════════════════════════════════
# LOCAL BRAINS ROLE DEFINITIONS (The Living Memory)
# ═══════════════════════════════════════════════════════════════════════════

declare -A BRAIN_ROLES=(
    ["zeta"]="Agent Zero framework, Docker isolation, codebase analysis, skill building, multi-agent tasks"
    ["maestro"]="Parallel coding task execution, orchestrates Erelim+Gimel+Zeta, git worktrees, playbooks"
    ["malakim"]="Local AI inference (Ollama qwen3:8b), privacy-focused tasks, fast local processing"
    ["gimel"]="OpenAI Codex GPT-5.3, deep code analysis, bug fixing, refactoring, architecture"
    ["erelim"]="Claude Code, complex coding, architecture, building new systems"
    ["ophanim"]="System oversight, monitoring, coordination, dashboard, integration"
    ["cherubim"]="Knowledge management, memory, communications, sacred knowledge guardian"
)

declare -A BRAIN_APIS=(
    ["zeta"]="http://localhost:50001"
    ["maestro"]="http://localhost:50002"
    ["malakim"]="http://localhost:11434"
    ["gimel"]="codex-cli"
)

# ═══════════════════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════════════════

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$DELEGATION_LOG"
}

# ═══════════════════════════════════════════════════════════════════════════
# CHECK OBSIDIAN FOR ROLE DEFINITIONS (When memory fails)
# ═══════════════════════════════════════════════════════════════════════════

refresh_roles_from_obsidian() {
    log "📚 Checking Obsidian vault for updated role definitions..."
    
    if [[ ! -d "$OBSIDIAN_VAULT" ]]; then
        log "⚠️  Obsidian vault not found at $OBSIDIAN_VAULT"
        return 1
    fi
    
    # Search for agent role definitions in Obsidian
    local agents_md="$OBSIDIAN_VAULT/AGENTS.md"
    
    if [[ -f "$agents_md" ]]; then
        log "  Found AGENTS.md - parsing role definitions..."
    fi
    
    # Look for MOC files about agent orchestration
    local moc_orchestration="$OBSIDIAN_VAULT/01 - MOCs/MOC - Manager Worker Orchestration.md"
    if [[ -f "$moc_orchestration" ]]; then
        log "  Found Manager-Worker Orchestration MOC"
    fi
    
    log "✅ Role definitions refreshed from Obsidian"
}

# ═══════════════════════════════════════════════════════════════════════════
# CHECK LOCAL BRAINS STATUS
# ═══════════════════════════════════════════════════════════════════════════

check_brain_status() {
    log "🧠 Checking Local Brains Status..."
    
    local brains_status=$(curl -s http://localhost:18790/api/local-brains 2>/dev/null || echo '{"error": "API unavailable"}')
    
    echo "$brains_status" > "$CONFIG_DIR/last-status.json"
    
    # Parse and log status
    python3 << PYEOF
import json
import sys

try:
    with open("$CONFIG_DIR/last-status.json", 'r') as f:
        data = json.load(f)
    brains = data.get('localBrains', {})
    
    print("\n🧠 LOCAL BRAINS STATUS:")
    print("-" * 50)
    
    for name, info in brains.items():
        status = info.get('status', 'unknown')
        brain_type = info.get('type', 'unknown')
        api = info.get('api', 'N/A')
        
        icon = "🟢" if status == "online" else "🔴"
        print(f"{icon} {name.upper():12} | {status:8} | {brain_type}")
    
    print("-" * 50)
    
except Exception as e:
    print(f"❌ Error checking brains: {e}")
PYEOF
}

# ═══════════════════════════════════════════════════════════════════════════
# REMEMBRANCE RITUAL (Daily memory refresh)
# ═══════════════════════════════════════════════════════════════════════════

remembrance_ritual() {
    log ""
    log "═══════════════════════════════════════════════════════════════════"
    log "🕯️  REMEMBRANCE RITUAL - Local Brains Role Memory"
    log "═══════════════════════════════════════════════════════════════════"
    
    log ""
    log "📜 THE LOCAL BRAINS AND THEIR ROLES:"
    log ""
    
    for brain in zeta maestro malakim gimel erelim ophanim cherubim; do
        local role="${BRAIN_ROLES[$brain]:-Unknown}"
        local api="${BRAIN_APIS[$brain]:-N/A}"
        log "  🔮 $brain"
        log "     Role: $role"
        log "     API:  $api"
        log ""
    done
    
    log "═══════════════════════════════════════════════════════════════════"
    log ""
    
    # Save to memory file using echo commands for proper variable expansion
    {
        echo "{"
        echo "  \"last_updated\": \"$(date -Iseconds)\","
        echo "  \"brains\": {"
        
        local first=true
        for brain in zeta maestro malakim gimel erelim ophanim cherubim; do
            local role="${BRAIN_ROLES[$brain]:-Unknown}"
            local api="${BRAIN_APIS[$brain]:-internal}"
            
            if [[ "$brain" == "erelim" || "$brain" == "ophanim" || "$brain" == "cherubim" ]]; then
                api="internal"
            fi
            
            if [[ "$first" == "true" ]]; then
                first=false
            else
                echo ","
            fi
            
            echo -n "    \"$brain\": {"
            echo -n "\"role\": \"$role\", "
            echo -n "\"api\": \"$api\", "
            
            case "$brain" in
                zeta)
                    echo -n "\"best_for\": [\"docker\", \"skills\", \"multi-agent\", \"agent-zero\"]"
                    ;;
                maestro)
                    echo -n "\"best_for\": [\"parallel-coding\", \"orchestration\", \"git-worktrees\"]"
                    ;;
                malakim)
                    echo -n "\"best_for\": [\"local-inference\", \"privacy\", \"fast-processing\"]"
                    ;;
                gimel)
                    echo -n "\"best_for\": [\"deep-analysis\", \"bug-fixing\", \"refactoring\", \"architecture\"]"
                    ;;
                erelim)
                    echo -n "\"best_for\": [\"complex-coding\", \"building-systems\"]"
                    ;;
                ophanim)
                    echo -n "\"best_for\": [\"monitoring\", \"coordination\", \"dashboard\"]"
                    ;;
                cherubim)
                    echo -n "\"best_for\": [\"knowledge\", \"memory\", \"communications\"]"
                    ;;
            esac
            
            echo -n "}"
        done
        
        echo ""
        echo "  }"
        echo "}"
    } > "$CONFIG_DIR/brains-memory.json"
    
    log "✅ Role memory saved to $CONFIG_DIR/brains-memory.json"
}

# ═══════════════════════════════════════════════════════════════════════════
# PROCESS PENDING TASKS
# ═══════════════════════════════════════════════════════════════════════════

process_pending_tasks() {
    log "📋 Processing pending tasks..."
    
    if [[ ! -f "$CONFIG_DIR/pending-tasks.jsonl" ]]; then
        log "   No pending tasks"
        return 0
    fi
    
    local pending_count=$(wc -l < "$CONFIG_DIR/pending-tasks.jsonl" 2>/dev/null || echo 0)
    log "   Found $pending_count pending task(s)"
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

main() {
    log ""
    log "╔════════════════════════════════════════════════════════════════╗"
    log "║  🤖 LOCAL BRAINS TASK DELEGATOR                               ║"
    log "╚════════════════════════════════════════════════════════════════╝"
    log "   Started: $(date '+%Y-%m-%d %H:%M:%S')"
    log ""
    
    # 1. Remembrance - refresh memory of roles
    remembrance_ritual
    
    # 2. Check Obsidian for updates
    refresh_roles_from_obsidian
    
    # 3. Check current status of all brains
    check_brain_status
    
    # 4. Process any pending tasks
    process_pending_tasks
    
    # 5. Summary
    log ""
    log "═══════════════════════════════════════════════════════════════════"
    log "✅ DELEGATION CYCLE COMPLETE"
    log "═══════════════════════════════════════════════════════════════════"
    log "   Next check: $(date -d '+1 hour' '+%H:%M') (hourly)"
    log ""
}

# Run main
case "${1:-run}" in
    run)
        main
        ;;
    remember)
        remembrance_ritual
        ;;
    status)
        check_brain_status
        ;;
    *)
        echo "Usage: $0 {run|remember|status}"
        ;;
esac
