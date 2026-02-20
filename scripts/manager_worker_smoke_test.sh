#!/usr/bin/env bash
set -euo pipefail

VAULT="/home/usapcool/serphim obsidian vault"
LEGION="/home/usapcool/.openclaw/agents/legion"

fail=0

ok(){ echo "[OK] $1"; }
warn(){ echo "[WARN] $1"; }
crit(){ echo "[CRIT] $1"; fail=1; }

echo "== Manager-Worker Smoke Test =="

# 1) Vault reachable
[ -d "$VAULT" ] && ok "Vault exists" || crit "Vault missing: $VAULT"

# 2) Required MOCs
for f in \
  "$VAULT/00 - Index/Master Index.md" \
  "$VAULT/01 - MOCs/MOC - Trading.md" \
  "$VAULT/01 - MOCs/MOC - Manager Worker Orchestration.md"; do
  [ -f "$f" ] && ok "Found $(basename "$f")" || crit "Missing $f"
done

# 3) Obsidian CLI available
if command -v obsidian-cli >/dev/null 2>&1; then
  ok "obsidian-cli present"
else
  crit "obsidian-cli not installed"
fi

# 4) Legion monitor outputs
for f in \
  "$LEGION/shared/outputs/alpha/monitor.jsonl" \
  "$LEGION/shared/outputs/eta/market.jsonl" \
  "$LEGION/shared/outputs/delta/reports.log"; do
  [ -f "$f" ] && ok "Monitor output: $(basename "$f")" || warn "Missing monitor output: $f"
done

# 5) Frontmatter check (basic)
if head -n 1 "$VAULT/02 - Domains/Agent Architecture/Seraphim Manager-Worker Runtime Spec.md" | grep -q '^---'; then
  ok "Runtime spec has frontmatter"
else
  warn "Runtime spec missing frontmatter"
fi

if [ "$fail" -eq 1 ]; then
  echo "RESULT=FAIL"
  exit 2
else
  echo "RESULT=PASS"
  exit 0
fi
