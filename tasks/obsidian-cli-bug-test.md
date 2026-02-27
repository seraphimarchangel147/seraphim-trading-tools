# Obsidian CLI Bug Test Report

## Test Date: 2026-02-22

## Configuration
- **CLI Version**: v0.2.2
- **Default Vault**: serphim-obsidian-vault
- **Vault Path**: /home/usapcool/serphim obsidian vault
- **Config Location**: ~/.config/obsidian-cli/config.json

## Tests Performed

### ✅ Working Commands

| Command | Result | Notes |
|---------|--------|-------|
| `obsidian-cli --version` | ✅ PASS | Returns v0.2.2 |
| `obsidian-cli --help` | ✅ PASS | Shows all commands |
| `obsidian-cli print-default` | ✅ PASS | Shows default vault |
| `obsidian-cli create` | ✅ PASS | File created successfully |
| `obsidian-cli print` | ✅ PASS | Reads file content |

### ⚠️ Issues Found

| Command | Result | Issue |
|---------|--------|-------|
| `obsidian-cli search "Auto-Heal"` | ❌ FAIL | Treats quoted string as command flag |
| `obsidian-cli search Auto-Heal` | ❌ FAIL | Treats hyphenated string as command flag |
| `obsidian-cli search-content "proactive monitoring"` | ⚠️ PARTIAL | Returns no results (content exists) |
| `obsidian-cli list` | ❌ FAIL | Command doesn't exist |

### Root Causes

1. **Search Command Bug**: The CLI parser incorrectly handles hyphenated or quoted search terms, interpreting them as command flags instead of arguments.

2. **Search-Content Indexing**: The search-content command may not index new files immediately or has limited indexing scope.

3. **Missing Commands**: No `list` command available (workaround: use shell `ls` instead).

## Trading Bots Status

| Bot | Position | P&L | Status |
|-----|----------|-----|--------|
| **drift-auto-trader** | SHORT | $1.24 (4W/2L) | ✅ Online |
| **drift-short-bot** | No position | $10.49 (11W/0L) | ✅ Online |
| **mission-control-api** | — | — | ✅ Online |

### Notes
- drift-auto-trader has active SHORT position, monitoring for exits
- drift-short-bot is in waiting mode (no clear downtrend detected)
- Both bots stable after auto-heal restart

## Recommendations

1. **For Obsidian CLI**:
   - Use `print` command to read specific files (works reliably)
   - Use shell `ls` and `grep` for listing/searching instead of CLI
   - File creation works well via `create` command
   - Avoid `search` command until parser bug is fixed

2. **Alternative Tools**:
   - `obsidian-organize` (custom script) - Better for vault analysis
   - `obsidian-research` (custom script) - Better for research tasks
   - Direct file operations via bash - Most reliable

## Conclusion

**Obsidian CLI**: Partially functional. Create/print work, search is buggy.
**Trading Bots**: All online and operational.
**Workaround**: Use custom scripts (`obsidian-organize`, `obsidian-research`) or direct file operations for reliable vault management.
