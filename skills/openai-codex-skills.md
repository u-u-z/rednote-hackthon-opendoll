# OpenAI Codex Agent Skills
# Fetched: 2026-04-08
# Source: https://developers.openai.com/codex/skills

## Overview
Agent skills extend Codex with task-specific capabilities by packaging instructions,
resources, and optional scripts. They build on the open agent skills standard and are
available across CLI, IDE extension, and Codex app.

## Skill Structure
A skill requires a directory containing:
- **SKILL.md** (required): Instructions and metadata with `name` and `description` fields
- **scripts/** (optional): Executable code
- **references/** (optional): Documentation
- **assets/** (optional): Templates and resources
- **agents/openai.yaml** (optional): UI configuration and dependencies

## Progressive Disclosure
Codex loads skill metadata initially, then full SKILL.md instructions only when needed.

## Invocation Methods
1. Explicit: Users directly reference skills via `/skills` or `$` mention
2. Implicit: Codex autonomously selects skills matching task descriptions

## Storage Locations

| Scope | Path | Purpose |
|-------|------|---------|
| REPO (local) | `.agents/skills` | Working folder-specific skills |
| REPO (parent) | `../.agents/skills` | Shared area skills in nested repos |
| REPO (root) | `$REPO_ROOT/.agents/skills` | Organization-wide repository skills |
| USER | `$HOME/.agents/skills` | Personal cross-repository skills |
| ADMIN | `/etc/codex/skills` | System-level shared skills |
| SYSTEM | Bundled | OpenAI-provided default skills |

## Creating Skills

Use the built-in creator: `$skill-creator`

Or manually create a folder with SKILL.md:
```yaml
---
name: skill-name
description: Trigger scope and boundaries
---

Skill instructions here.
```

## Optional Metadata (agents/openai.yaml)

Configure UI presentation, invocation policy, and tool dependencies:
- `interface`: Display name, icon, brand color, default prompt
- `policy`: `allow_implicit_invocation` (default: true)
- `dependencies`: Tools like MCP servers

## Best Practices
- Keep skills focused on single tasks
- Favor instructions over scripts unless deterministic behavior needed
- Use imperative steps with explicit inputs/outputs
- Test prompts against skill descriptions for correct triggering
- Distribute reusable skills as plugins rather than direct folders
