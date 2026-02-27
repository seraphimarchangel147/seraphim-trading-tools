---
date: 2026-02-23
tags: [agents-md, workflow, orchestration, standards]
source: https://agents.md/
---

# agents.md Integration

## Overview

Integrated the [agents.md](https://agents.md/) open standard for AI coding agent guidance into the Citadel Orchestrator workflow. This standard is used by over 60,000 open-source projects and supported by OpenAI Codex, Cursor, Amp, Jules from Google, and Factory.

## What is agents.md?

Think of AGENTS.md as a README for agents: a dedicated, predictable place to provide the context and instructions to help AI coding agents work on your project.

**Key Difference:**
- **README.md** = For humans (quick starts, descriptions)
- **AGENTS.md** = For agents (build steps, tests, conventions)

## Workflow Rules Integrated

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution
- Keep main context window clean

### 3. Self-Improvement Loop
- After ANY correction from the user: update `self/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests → then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management Protocol

1. **Plan First**: Write plan to `ops/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review to `ops/todo.md`
6. **Capture Lessons**: Update `self/lessons.md` after corrections

## Why This Matters

The Microsoft/Salesforce research on multi-turn degradation shows:
- 39% average performance drop in multi-turn conversations
- 112% spike in unreliability
- Not intelligence loss — context drift and "answer bloat"

These workflow rules counteract that by:
- Removing conversational filler (plan mode, structured output)
- Compounding knowledge instead of repeating mistakes (lessons.md)
- Keeping context windows clean (subagent strategy)
- Enforcing verification before completion

## Related Documents

- Source: https://agents.md/
- Steward: Agentic AI Foundation under Linux Foundation
- Supported by: OpenAI Codex, Cursor, Amp, Jules, Factory
- Citadel Orchestrator: `~/.openclaw/skills/citadel-orchestrator/SKILL.md`
- Three-Space Architecture: `~/.openclaw/workspace/self/lessons.md`

---
*Part of the Citadel knowledge system*