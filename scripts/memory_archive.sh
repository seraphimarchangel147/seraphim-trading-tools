#!/usr/bin/env bash
set -euo pipefail
ROOT='/home/usapcool/.openclaw/workspace'
MEM="$ROOT/memory"
ARCH="$MEM/archive/$(date +%Y-%m)"
mkdir -p "$ARCH"

# Cap MEMORY.md to <=150 lines by preserving header + index and moving overflow to archive
if [ -f "$ROOT/MEMORY.md" ]; then
  lines=$(wc -l < "$ROOT/MEMORY.md")
  if [ "$lines" -gt 150 ]; then
    tail -n +151 "$ROOT/MEMORY.md" > "$ARCH/MEMORY-overflow-$(date +%F-%H%M%S).md"
    head -n 150 "$ROOT/MEMORY.md" > "$ROOT/MEMORY.md.tmp" && mv "$ROOT/MEMORY.md.tmp" "$ROOT/MEMORY.md"
  fi
fi

# Move dated memory files older than 21 days
find "$MEM" -maxdepth 1 -type f -name '20??-??-??.md' | while read -r f; do
  bn=$(basename "$f")
  d=${bn%.md}
  if date -d "$d" +%s >/dev/null 2>&1; then
    age=$(( ( $(date +%s) - $(date -d "$d" +%s) ) / 86400 ))
    if [ "$age" -gt 21 ]; then
      mv "$f" "$ARCH/$bn"
    fi
  fi
done

echo "memory archive pass complete"
