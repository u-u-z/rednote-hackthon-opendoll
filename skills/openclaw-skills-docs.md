# OpenClaw Skills Documentation
# Fetched: 2026-04-08
# Source: https://docs.openclaw.ai/tools/skills

## Core Concept
OpenClaw uses AgentSkills-compatible skill folders with SKILL.md files containing
YAML frontmatter and instructions.

## Skill Loading Locations (Priority Order, lowest to highest)
1. Extra skill folders (via `skills.load.extraDirs`)
2. Bundled skills (included with installation)
3. Managed/local skills (`~/.openclaw/skills`)
4. Personal agent skills (`~/.agents/skills`)
5. Project agent skills (`<workspace>/.agents/skills`)
6. Workspace skills (`<workspace>/skills`) -- highest priority

## SKILL.md Format Requirements

Minimum required frontmatter:
```markdown
---
name: skill-name
description: What the skill does
---
```

Optional frontmatter keys:
- `homepage` -- URL for Skills UI
- `user-invocable` -- boolean (default: true)
- `disable-model-invocation` -- boolean (default: false)
- `command-dispatch` -- set to `tool` for direct dispatch
- `command-tool` -- tool name for dispatch
- `command-arg-mode` -- raw (default)

Parser supports single-line frontmatter keys only. Metadata is a single-line JSON object.

## Load-Time Filtering (Gating)

Metadata under `metadata.openclaw` controls skill eligibility:

```markdown
---
name: image-lab
metadata:
  {
    "openclaw": {
      "requires": {
        "bins": ["uv"],
        "env": ["GEMINI_API_KEY"],
        "config": ["browser.enabled"]
      },
      "primaryEnv": "GEMINI_API_KEY"
    }
  }
---
```

Gate fields:
- `always: true` -- skip other gates
- `emoji` -- macOS Skills UI display
- `homepage` -- website link
- `os` -- platforms (`darwin`, `linux`, `win32`)
- `requires.bins` -- required executables on PATH
- `requires.anyBins` -- at least one required
- `requires.env` -- environment variables or config
- `requires.config` -- openclaw.json paths that must be truthy
- `primaryEnv` -- associated env variable
- `install` -- installer specifications

## Agent Skill Allowlists

```json5
{
  agents: {
    defaults: { skills: ["github", "weather"] },
    list: [
      { id: "writer" },
      { id: "docs", skills: ["docs-search"] },
      { id: "locked-down", skills: [] }
    ]
  }
}
```

## Token Impact Calculation

Skills inject a compact XML list into the system prompt:
- Base overhead (>=1 skill): 195 characters
- Per skill: 97 characters + XML-escaped name, description, location lengths
- Formula: `195 + sum(97 + len(name) + len(description) + len(location))`
- Rough estimate: 97 chars ~ 24 tokens per skill

## Session Snapshots
OpenClaw snapshots eligible skills when a session starts and reuses the list
for subsequent turns. Changes take effect on new sessions.

## Security Notes
- Treat third-party skills as untrusted code
- Use sandboxed runs for risky tools
- Gateway-backed installs run dangerous-code scanner before execution
- `critical` scanner findings block by default unless explicitly overridden
- Environment and API key injection targets the host process only
- Keep secrets out of prompts and logs
