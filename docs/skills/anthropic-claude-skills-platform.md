# Anthropic Claude Agent Skills Platform Documentation
# Fetched: 2026-04-08
# Source: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

## Why use Skills

Skills are reusable, filesystem-based resources that provide Claude with domain-specific
expertise: workflows, context, and best practices that transform general-purpose agents
into specialists. Unlike prompts (conversation-level instructions for one-off tasks),
Skills load on-demand and eliminate the need to repeatedly provide the same guidance.

Key benefits:
- Specialize Claude for domain-specific tasks
- Reduce repetition: create once, use automatically
- Compose capabilities: combine Skills to build complex workflows

## How Skills Work

Skills leverage Claude's VM environment with filesystem access, bash commands, and code
execution capabilities. Skills exist as directories on a virtual machine.

### Three-level progressive disclosure:

**Level 1: Metadata (always loaded, ~100 tokens per Skill)**
```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
             Use when working with PDF files.
---
```
Loaded at startup into system prompt. Lightweight -- many Skills, no context penalty.

**Level 2: Instructions (loaded when triggered, <5k tokens)**
The main body of SKILL.md: workflows, best practices, guidance. Claude reads SKILL.md
from the filesystem via bash when a request matches the Skill's description.

**Level 3: Resources and code (loaded as needed, effectively unlimited)**
Additional files: scripts/, references/, assets/. Claude accesses only when referenced.
Scripts execute via bash -- code never enters context, only output does.

| Level | When Loaded | Token Cost | Content |
|-------|------------|------------|---------|
| Level 1 | Always (at startup) | ~100 tokens | name + description from YAML |
| Level 2 | When triggered | Under 5k tokens | SKILL.md body |
| Level 3+ | As needed | Unlimited | Bundled files executed via bash |

## Skill Structure

Every Skill requires a SKILL.md file with YAML frontmatter:

```yaml
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
[Clear, step-by-step guidance for Claude to follow]

## Examples
[Concrete examples of using this Skill]
```

Required fields: `name` and `description`

`name` constraints:
- Maximum 64 characters
- Only lowercase letters, numbers, and hyphens
- Cannot contain XML tags
- Cannot contain reserved words: "anthropic", "claude"

`description` constraints:
- Must be non-empty
- Maximum 1024 characters
- Cannot contain XML tags

## Where Skills Work

### Claude API
Supports pre-built and custom Skills. Requires three beta headers:
- `code-execution-2025-08-25`
- `skills-2025-10-02`
- `files-api-2025-04-14`

Custom Skills uploaded via `/v1/skills` endpoints. Organization-wide sharing.

### Claude Code
Custom Skills only. Filesystem-based (`~/.claude/skills/` or `.claude/skills/`).
Can be shared via Claude Code Plugins.

### Claude Agent SDK
Custom Skills through filesystem-based config in `.claude/skills/`.
Include "Skill" in `allowed_tools` configuration.

### Claude.ai
Pre-built and custom Skills. Custom Skills uploaded as zip files through Settings.
Individual user only, not shared org-wide.

## Pre-built Agent Skills
- PowerPoint (pptx): Create/edit presentations
- Excel (xlsx): Create spreadsheets, analyze data, generate charts
- Word (docx): Create/edit documents
- PDF (pdf): Generate formatted PDF documents

## Security Considerations
- Install only from trusted sources (self-created or Anthropic)
- Audit all bundled files thoroughly
- External sources that fetch URLs are risky
- Skills can invoke tools in harmful ways
- Treat like installing software

## Limitations
- Custom Skills do NOT sync across surfaces (claude.ai, API, Claude Code)
- Different sharing models per surface
- API has no network access, no runtime package installation
- Claude Code has full network access
