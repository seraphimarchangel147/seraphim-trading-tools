# ZeroClaw Monitor - Complete Documentation

## Overview

**ZeroClaw** is a Rust-based autonomous monitoring system for OpenClaw that provides real-time health checks, auto-fixes, and Telegram-based control.

**Key Features:**
- Real-time monitoring (30-second intervals)
- Auto-fixes for common issues
- Circuit breaker for failing providers
- Telegram bot commands
- Deep health checks (Python cron, 15-minute intervals)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZEROCLAW MONITOR                              │
│                                                                  │
│  Layer 1: Rust Daemon (30s cycles)                              │
│  ├─ HTTP health probes                                          │
│  ├─ Provider API checks                                         │
│  ├─ Auto-fixes (model swap, gateway restart)                    │
│  ├─ Circuit breaker logic                                       │
│  └─ Telegram command handler                                    │
│                                                                  │
│  Layer 2: Python Cron (15min cycles)                            │
│  ├─ Deep system validation                                      │
│  ├─ WSL2/Ubuntu specific checks                                 │
│  ├─ OAuth token expiry                                          │
│  ├─ Disk/DNS/PATH checks                                        │
│  └─ openclaw doctor integration                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     TELEGRAM INTEGRATION                         │
│  ├─ Real-time alerts (outages, recoveries)                      │
│  ├─ Interactive commands (/status, /fix, /restart)              │
│  ├─ Escalation reminders (1h, 6h, 24h)                          │
│  └─ Circuit breaker notifications                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Installation

### Prerequisites

```bash
# WSL2 Ubuntu (tested on 22.04+)
# Node.js 22+ via nvm
nvm install 22

# OpenClaw
npm install -g openclaw

# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# System dependencies
sudo apt-get install -y libssl-dev pkg-config
```

### Quick Install

```bash
cd ~/.openclaw/media/inbound/zeroclaw-monitor-package/
chmod +x install.sh
./install.sh
```

### Manual Install

```bash
# 1. Clone ZeroClaw
git clone https://github.com/zeroclaw-labs/zeroclaw.git ~/zeroclaw

# 2. Copy monitor modules
mkdir -p ~/zeroclaw/src/monitor
cp src/monitor/*.rs ~/zeroclaw/src/monitor/

# 3. Apply patches
cd ~/zeroclaw
git apply patches/*.patch

# 4. Build
cargo build --release

# 5. Create config
mkdir -p ~/.zeroclaw
cp config/config.toml ~/.zeroclaw/

# 6. Edit config with your Telegram token
nano ~/.zeroclaw/config.toml

# 7. Setup systemd
mkdir -p ~/.config/systemd/user
cp config/zeroclaw-monitor.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable zeroclaw-monitor.service
systemctl --user start zeroclaw-monitor.service
```

---

## Configuration

### Main Config (`~/.zeroclaw/config.toml`)

```toml
# ZeroClaw config — monitor-only mode
default_temperature = 0.7

[monitor]
enabled = true
poll_interval_secs = 30
http_timeout_secs = 10
openclaw_gateway_port = 18789
openclaw_config_path = "/home/usapcool/.openclaw/openclaw.json"
memory_dir = "/home/usapcool/.openclaw-memory"
monitor_log_path = "/home/usapcool/.openclaw-memory/monitor.log"
restart_command = "/home/usapcool/.nvm/versions/node/v22.22.0/bin/openclaw gateway restart"

[[monitor.providers]]
name = "minimax-portal"
health_url = "https://api.minimax.io/anthropic/v1/models"

[[monitor.providers]]
name = "openrouter"
health_url = "https://openrouter.ai/api/v1/models"

[monitor.telegram]
bot_token = "YOUR_BOT_TOKEN"
alert_chat_id = YOUR_CHAT_ID
```

### Cron Job Config (`~/.openclaw/cron/jobs.json`)

```json
{
  "jobs": [
    {
      "id": "zeroclaw-health-check",
      "command": "python3 ~/.openclaw/workspace/strategies/openclaw_health_check.py",
      "schedule": "*/15 * * * *",
      "enabled": true
    }
  ]
}
```

---

## Telegram Commands

| Command | Description |
|---------|-------------|
| `/status` | Show system health snapshot |
| `/pause` | Pause health monitoring |
| `/resume` | Resume health monitoring |
| `/fix` | Force primary model swap |
| `/providers` | List provider health status |
| `/config` | Show monitor configuration |
| `/logs` | Show last 20 lines of monitor.log |
| `/restart` | Restart OpenClaw gateway |

---

## Auto-Fixes

### 1. Model Provider Swap

**Trigger:** Provider returns 5 consecutive failures

**Action:** 
- Backup current config
- Swap to next available provider
- Send Telegram alert
- Log the change

**Smart Logic:**
- Only swaps if failing provider IS the current primary
- Picks first fallback not on the failing provider
- Preserves other settings

### 2. Gateway Restart

**Trigger:** Gateway HTTP probe fails 3 times

**Action:**
- Execute `openclaw gateway restart`
- Monitor for recovery
- Send alert on success/failure

### 3. Circuit Breaker

**Trigger:** 5 consecutive failures

**Action:**
- Pause checks for 10 minutes
- Probe once to check recovery
- Resume if healthy

---

## Alert Behavior

| Event | Alert Type | Frequency |
|-------|-----------|-----------|
| First outage detection | 🚨 Critical | Once |
| Circuit breaker open | ⚠️ Warning | Once |
| Escalation reminder | ⏰ Reminder | 1h, 6h, 24h |
| Recovery detected | ✅ Recovery | Once |
| Slow response (>5s) | 🐌 Performance | Each occurrence |

---

## Log Files

| File | Location | Purpose |
|------|----------|---------|
| Monitor log | `~/.openclaw-memory/monitor.log` | Layer 1 (Rust) |
| Health check log | `~/.openclaw-memory/health_check.log` | Layer 2 (Python) |
| Systemd journal | `journalctl --user -u zeroclaw-monitor` | Service logs |

**Log Rotation:**
- Auto-rotates at 5MB
- Keeps one backup (.1)

---

## Deep Health Checks (Python)

### Checks Performed (Every 15min)

1. **Gateway Health**
   - HTTP probe on port 18789
   - CLI status check
   - Process verification

2. **Provider APIs**
   - HTTP 200 check
   - Response time tracking
   - OAuth token validation

3. **Telegram Bot**
   - getMe API call
   - Connectivity check

4. **Config Integrity**
   - Valid JSON5
   - Required fields present
   - Version consistency

5. **Memory System**
   - Decay staleness (<36h)
   - Synthesis freshness (<4h)
   - WORLD_MODEL.md existence

6. **Cron Jobs**
   - jobs.json validity
   - No stuck jobs (>30min)
   - Run history check

7. **WSL2/System**
   - Disk space (>10% free)
   - DNS resolution
   - Node.js version
   - PATH validation

8. **openclaw doctor**
   - Run automated audit
   - Repair fixable issues

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
journalctl --user -u zeroclaw-monitor -n 50

# Verify config
~/.zeroclaw/config.toml

# Check permissions
ls -la ~/.zeroclaw/
```

### No Telegram Alerts

```bash
# Test bot token
curl -s "https://api.telegram.org/bot<TOKEN>/getMe"

# Check chat ID
curl -s "https://api.telegram.org/bot<TOKEN>/getUpdates"
```

### False Positives

```bash
# Adjust thresholds in config.toml
[monitor]
circuit_breaker_threshold = 7      # Increase from 5
circuit_breaker_cooldown_secs = 300  # Decrease from 600
```

---

## Service Management

```bash
# Start
systemctl --user start zeroclaw-monitor.service

# Stop
systemctl --user stop zeroclaw-monitor.service

# Restart
systemctl --user restart zeroclaw-monitor.service

# Status
systemctl --user status zeroclaw-monitor.service

# View logs
journalctl --user -u zeroclaw-monitor.service -f

# Enable on boot
systemctl --user enable zeroclaw-monitor.service
```

---

## Integration with Seraphim Trading

ZeroClaw can monitor the RL trading system:

```toml
[monitor]
# Add to existing config
additional_checks = [
  { name = "rl-trading", url = "http://localhost:18795/health" },
  { name = "zeta", url = "http://localhost:50001/api/health" },
  { name = "maestro", url = "http://localhost:50002/api/health" }
]
```

---

## Development

### Building from Source

```bash
cd ~/zeroclaw
cargo build --release

# Run tests
cargo test

# Development build
cargo build
```

### Adding New Checks

Edit `src/monitor/checks.rs`:

```rust
pub async fn check_custom_service() -> CheckResult {
    // Your check logic
    match probe_endpoint("http://your-service/health").await {
        Ok(_) => CheckResult::Healthy,
        Err(e) => CheckResult::Unhealthy(e.to_string()),
    }
}
```

---

## Security Notes

- Bot token stored in plain text (restrict file permissions)
- Chat ID validates command source
- Config backups before auto-fixes
- No LLM API keys required

---

## Files Location

```
~/.zeroclaw/
├── config.toml                 # Main configuration
├── monitor.log                 # Runtime logs
└── backups/                    # Config backups

~/.openclaw-memory/
├── monitor.log                 # Rust daemon logs
├── health_check.log            # Python cron logs
└── state/                      # Internal state

~/zeroclaw/
├── src/monitor/
│   ├── mod.rs                  # Main module
│   ├── config.rs               # Config parsing
│   ├── checks.rs               # Health checks
│   └── fixes.rs                # Auto-fixes
├── Cargo.toml
└── target/release/zeroclaw     # Compiled binary
```

---

## References

- **Source:** `~/.openclaw/media/inbound/zeroclaw-monitor-package/`
- **Install Script:** `install.sh`
- **Python Health Check:** `scripts/openclaw_health_check.py`
- **Systemd Service:** `config/zeroclaw-monitor.service`

---

*Last Updated: 2026-02-24*
*Maintained by: Seraphim & The Legion*
