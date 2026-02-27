#!/bin/bash
# Hive Mind Sync for Seraphim - Integrated with Master Monitor
export GITHUB_TOKEN="${GITHUB_TOKEN:-}" # Set via env

LOG_FILE="$HOME/.openclaw/workspace/logs/hive-sync-seraphim.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Hive Mind Sync..." >> "$LOG_FILE"

sync_repo() {
    REPO_DIR="$1"
    REPO_TYPE="$2"
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Syncing $REPO_TYPE Repo..." >> "$LOG_FILE"
    cd "$REPO_DIR" || return 1
    
    # Pull changes from Hive Mind
    git pull --rebase origin master 2>> "$LOG_FILE" || {
        echo "⚠️ Merge conflict in $REPO_TYPE repo!" >> "$LOG_FILE"
        return 1
    }
    
    # Stage and commit local changes
    git add . 2>> "$LOG_FILE"
    git commit -m "Auto-Sync [Seraphim] $REPO_TYPE: background state save $(date +'%Y-%m-%d %H:%M')" 2>> "$LOG_FILE" || true
    
    # Push back to Hive Mind
    git push origin master 2>> "$LOG_FILE" || {
        echo "⚠️ Push failed for $REPO_TYPE" >> "$LOG_FILE"
        return 1
    }
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ $REPO_TYPE sync complete" >> "$LOG_FILE"
    return 0
}

# Sync Shared Vault
sync_repo "$HOME/.openclaw/workspace/cherubim_vault" "Shared"
SHARED_STATUS=$?

# Sync Personal Vault  
sync_repo "$HOME/.openclaw/workspace/seraphim_vault" "Personal"
PERSONAL_STATUS=$?

# Log summary
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sync complete. Shared: $SHARED_STATUS, Personal: $PERSONAL_STATUS" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit 0
