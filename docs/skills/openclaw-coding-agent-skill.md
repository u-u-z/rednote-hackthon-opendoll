# OpenClaw Coding Agent SKILL.md
# Fetched: 2026-04-08
# Source: https://github.com/openclaw/openclaw/blob/main/skills/coding-agent/SKILL.md

---
name: coding-agent
description: >
  Delegate coding tasks to Codex, Claude Code, or Pi agents via background process.
  Use when: (1) building/creating new features or apps, (2) reviewing PRs (spawn in temp dir),
  (3) refactoring large codebases, (4) iterative coding that needs file exploration.
  NOT for: simple one-liner fixes (just edit), reading code (use read tool),
  thread-bound ACP harness requests in chat, or any work in ~/clawd workspace.
metadata:
  openclaw:
    emoji: code
    requires:
      anyBins:
        - claude
        - codex
        - opencode
        - pi
    install:
      - id: node-claude
        kind: node
        package: "@anthropic-ai/claude-code"
        bins: [claude]
        label: "Install Claude Code CLI (npm)"
      - id: node-codex
        kind: node
        package: "@openai/codex"
        bins: [codex]
        label: "Install Codex CLI (npm)"
---

## Key Patterns

### PTY Mode Requirements
- Codex, Pi, OpenCode: PTY required (interactive terminal apps)
- Claude Code: Use `--print --permission-mode bypassPermissions` (no PTY)

### Bash Tool Parameters
command, pty (boolean), workdir (agent's context dir), background (monitoring via sessionId),
timeout (seconds), elevated (host-level execution)

### Execution Patterns
- Use `workdir` + `background:true` + `pty:true` for sustained tasks
- Returns sessionId for monitoring via process actions (log, poll, write, submit, kill)

### Codex CLI Flags
- `exec "prompt"` for one-shot execution
- `--full-auto` for sandboxed auto-approval
- `--yolo` for no sandbox/approvals (fastest, most dangerous)

### Parallel Execution
Deploy multiple agents simultaneously for batch PR reviews using background sessions.

### Critical Rules
- Use correct execution mode per agent type
- Respect user's tool choice
- Don't kill sessions prematurely
- Never spawn Codex in state dir or projects dir
- Parallel execution is acceptable
