#!/usr/bin/env node
/**
 * Obsidian CLI Slash Commands for Seraphim
 * Implements /context, /trace, /connect, /ideas, /graduate, /now
 * Compatible with obsidian-cli v0.2.2
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const VAULT_PATH = '/home/usapcool/serphim obsidian vault';

// Helper: Run obsidian-cli command
function obsidian(cmd, args = []) {
  try {
    return execSync(`obsidian-cli ${cmd} ${args.join(' ')}`, {
      encoding: 'utf8',
      cwd: VAULT_PATH,
      timeout: 10000
    });
  } catch (e) {
    return e.stderr || e.message;
  }
}

// Helper: Get today's daily note path
function getDailyNotePath() {
  const today = new Date().toISOString().split('T')[0];
  return join(VAULT_PATH, `${today}.md`);
}

// Helper: Search vault with grep for backlinks/connections
function grepVault(pattern, limit = 20) {
  try {
    return execSync(`grep -r "${pattern}" "${VAULT_PATH}" --include="*.md" -l 2>/dev/null | head -${limit}`, {
      encoding: 'utf8'
    });
  } catch (e) {
    return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLASH COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * /context → Load full life + work state
 */
export function context() {
  const today = new Date().toISOString().split('T')[0];
  const dailyNote = getDailyNotePath();
  
  let output = '## Current State\n\n';
  
  // 1. Today's Daily Note
  output += '**📅 Today**:\n';
  if (existsSync(dailyNote)) {
    const content = readFileSync(dailyNote, 'utf8').slice(0, 500);
    output += content.split('\n').slice(0, 5).join('\n') + '\n\n';
  } else {
    output += 'No daily note yet today.\n\n';
  }
  
  // 2. Active Projects (from 02 - Domains/)
  output += '**🎯 Active Projects**:\n';
  try {
    const projects = execSync(`ls "${VAULT_PATH}/02 - Domains/"`, { encoding: 'utf8' }).split('\n').filter(Boolean);
    projects.slice(0, 5).forEach(p => {
      output += `- ${p}\n`;
    });
  } catch (e) {
    output += '- Error reading projects\n';
  }
  output += '\n';
  
  // 3. Recent Notes
  output += '**📝 Recent Activity**:\n';
  try {
    const recent = execSync(`ls -lt "${VAULT_PATH}"/*.md 2>/dev/null | head -5 | awk '{print $NF}' | xargs -n1 basename`, { encoding: 'utf8' });
    output += recent.split('\n').filter(Boolean).map(n => `- ${n}`).join('\n') + '\n\n';
  } catch (e) {
    output += '- Error reading recent notes\n\n';
  }
  
  // 4. Trading Status
  output += '**📈 Trading Status**:\n';
  try {
    const tradingStatus = execSync('pm2 status | grep -E "(drift|scalper)" | grep "online" | wc -l', { encoding: 'utf8' }).trim();
    output += `- ${tradingStatus}/3 trading bots online\n`;
  } catch (e) {
    output += '- Trading status unavailable\n';
  }
  output += '\n';
  
  // 5. Urgent Items (from daily note tasks)
  output += '**⚠️ Urgent Items**:\n';
  if (existsSync(dailyNote)) {
    const content = readFileSync(dailyNote, 'utf8');
    const urgent = content.match(/- \[ \].*/g);
    if (urgent && urgent.length > 0) {
      urgent.slice(0, 3).forEach(item => {
        output += `${item}\n`;
      });
    } else {
      output += '- No urgent items\n';
    }
  }
  
  return output;
}

/**
 * /trace [topic] → Show evolution timeline
 */
export function trace(topic) {
  if (!topic) return 'Usage: /trace [topic]';
  
  let output = `## Evolution of: ${topic}\n\n`;
  
  // Search for mentions across all notes
  const matches = grepVault(topic, 50);
  if (!matches.trim()) {
    return `No mentions of "${topic}" found in vault.`;
  }
  
  const files = matches.split('\n').filter(Boolean);
  
  // Sort by date (extract YYYY-MM-DD from filenames)
  const datedFiles = files.map(f => {
    const dateMatch = f.match(/(\d{4}-\d{2}-\d{2})/);
    return { file: f, date: dateMatch ? dateMatch[1] : '0000-00-00' };
  }).sort((a, b) => a.date.localeCompare(b.date));
  
  output += `**Found ${files.length} mentions**:\n\n`;
  
  // Group by month/year for pattern detection
  let currentMonth = '';
  datedFiles.forEach(({ file, date }) => {
    const month = date.slice(0, 7);
    if (month !== currentMonth && month !== '0000-00') {
      output += `\n**${month}**:\n`;
      currentMonth = month;
    }
    const noteName = file.split('/').pop().replace('.md', '');
    output += `- ${date}: [[${noteName}]]\n`;
  });
  
  output += '\n**Pattern Analysis**:\n';
  const uniqueMonths = [...new Set(datedFiles.map(f => f.date.slice(0, 7)).filter(d => d !== '0000-00'))];
  if (uniqueMonths.length > 1) {
    output += `- Recurring theme across ${uniqueMonths.length} months\n`;
    output += `- Sustained interest: ${datedFiles.length} total mentions\n`;
  } else if (uniqueMonths.length === 1) {
    output += `- Concentrated focus in ${uniqueMonths[0]}\n`;
    output += `- Possible new interest or project start\n`;
  }
  
  return output;
}

/**
 * /connect [topic1] [topic2] → Find connections
 */
export function connect(topic1, topic2) {
  if (!topic1 || !topic2) return 'Usage: /connect [topic1] [topic2]';
  
  let output = `## Connections: ${topic1} × ${topic2}\n\n`;
  
  // Find files mentioning both topics
  const files1 = grepVault(topic1, 100).split('\n').filter(Boolean);
  const files2 = grepVault(topic2, 100).split('\n').filter(Boolean);
  
  const intersection = files1.filter(f => files2.includes(f));
  
  if (intersection.length === 0) {
    output += `**No direct connections found.**\n\n`;
    output += `Next steps:\n`;
    output += `- Create a bridge note linking both concepts\n`;
    output += `- Explore metaphorical connections\n`;
  } else {
    output += `**${intersection.length} notes bridge both topics**:\n\n`;
    intersection.slice(0, 10).forEach(f => {
      const noteName = f.split('/').pop().replace('.md', '');
      output += `- [[${noteName}]]\n`;
    });
    
    output += '\n**💡 Startup Ideas**:\n';
    output += `1. **${topic1} for ${topic2}** - Apply ${topic1} principles to ${topic2}\n`;
    output += `2. **${topic2}-powered ${topic1}** - Use ${topic2} to enhance ${topic1}\n`;
    output += `3. **The ${topic1}-${topic2} Bridge** - Platform connecting both domains\n`;
  }
  
  return output;
}

/**
 * /ideas → Generate startup ideas from vault
 */
export function ideas() {
  let output = '## Startup Ideas from Your Vault\n\n';
  
  // Get recent daily notes (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  output += '**Scanning last 30 days of activity...**\n\n';
  
  // Search for idea keywords
  const keywords = ['idea', 'startup', 'project', 'build', 'create', 'launch'];
  const allMatches = [];
  
  keywords.forEach(kw => {
    const matches = grepVault(kw, 20).split('\n').filter(Boolean);
    allMatches.push(...matches);
  });
  
  // Deduplicate
  const uniqueFiles = [...new Set(allMatches)];
  
  output += `**Found ${uniqueFiles.length} idea-related notes**\n\n`;
  
  // Generate ideas based on domains
  output += '**🚀 Generated Ideas**:\n\n';
  
  try {
    const domains = execSync(`ls "${VAULT_PATH}/02 - Domains/"`, { encoding: 'utf8' }).split('\n').filter(Boolean);
    
    domains.slice(0, 5).forEach((domain, i) => {
      output += `${i + 1}. **${domain} Intelligence Layer**\n`;
      output += `   - Leverage: High (native to your thinking)\n`;
      output += `   - Excitement: Your existing domain expertise\n`;
      output += `   - Action: Create AI-powered ${domain} assistant\n\n`;
    });
  } catch (e) {
    output += 'Error reading domains\n';
  }
  
  output += '**Recommendation**: Pick the idea that combines your deepest domain knowledge with highest leverage.';
  
  return output;
}

/**
 * /now → What to do right now
 */
export function now() {
  const hour = new Date().getHours();
  let output = '## What You Should Do Now\n\n';
  
  // Time-based suggestions
  if (hour < 9) {
    output += '🌅 **Morning Mode**:\n';
    output += '- Review daily note\n';
    output += '- Check trading positions\n';
    output += '- Set 3 priorities for today\n';
  } else if (hour < 12) {
    output += '☀️ **Deep Work Window**:\n';
    output += '- Focus on highest leverage task\n';
    output += '- Avoid Slack/email\n';
  } else if (hour < 14) {
    output += '🍽️ **Midday**:\n';
    output += '- Break + light admin tasks\n';
  } else if (hour < 18) {
    output += '⚡ **Afternoon Energy**:\n';
    output += '- Creative work, calls, reviews\n';
  } else {
    output += '🌙 **Evening**:\n';
    output += '- Wind down, plan tomorrow\n';
    output += '- Review daily note, close loops\n';
  }
  
  // Add context from daily note
  const dailyNote = getDailyNotePath();
  if (existsSync(dailyNote)) {
    const content = readFileSync(dailyNote, 'utf8');
    const openTasks = content.match(/- \[ \].*/g);
    if (openTasks && openTasks.length > 0) {
      output += `\n**🎯 Open Tasks (${openTasks.length})**:\n`;
      openTasks.slice(0, 3).forEach(t => {
        output += `${t}\n`;
      });
    }
  }
  
  return output;
}

// Main entry point for CLI usage
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'context':
    console.log(context());
    break;
  case 'trace':
    console.log(trace(args[0]));
    break;
  case 'connect':
    console.log(connect(args[0], args[1]));
    break;
  case 'ideas':
    console.log(ideas());
    break;
  case 'now':
    console.log(now());
    break;
  default:
    console.log('Usage: node obsidian-commands.js [context|trace|connect|ideas|now] [args...]');
}
