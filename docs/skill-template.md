# Claude Code Skill Template

> Best-practice template based on the [Agent Skills](https://agentskills.io) open standard
> and [Claude Code Skills documentation](https://code.claude.com/docs/en/skills).
>
> Copy this directory structure and customize for your project.

---

## Directory Structure

```
your-skill-name/
  SKILL.md              # Required: metadata + instructions (keep under 500 lines)
  references/
    REFERENCE.md        # Detailed API docs, loaded on demand
    EXAMPLES.md         # Usage examples, loaded on demand
  scripts/
    helper.py           # Executable scripts Claude can run
    validate.sh         # Validation scripts
  assets/
    template.json       # Templates for output generation
    schema.json         # JSON schemas for validation
```

---

## SKILL.md Template

```yaml
---
# === REQUIRED FIELDS (Agent Skills Standard) ===

name: your-skill-name
# Max 64 chars. Lowercase letters, numbers, hyphens only.
# Must match the parent directory name.
# Must not start/end with hyphen or contain consecutive hyphens.

description: >-
  One-line summary of what this skill does. Include keywords that match
  how users actually ask for help. Front-load the key use case --
  descriptions beyond 250 chars are truncated in the skill listing.
# Max 1024 chars. Claude uses this to decide when to activate the skill.

# === OPTIONAL FIELDS (Agent Skills Standard) ===

license: MIT
# License name or reference to bundled LICENSE file.

compatibility: Requires Node.js 20+ and git
# Max 500 chars. Only include if the skill has environment requirements.

metadata:
  author: your-org
  version: "1.0"
  tags: "api, testing, deployment"
# Arbitrary key-value pairs. Keep key names unique to avoid conflicts.

allowed-tools: Bash(npm:*) Bash(node:*) Read Grep Glob
# Space-delimited list of pre-approved tools.
# Reduces permission prompts for trusted operations.

# === CLAUDE CODE EXTENSIONS (beyond Agent Skills standard) ===

# disable-model-invocation: true
# Set true to prevent Claude from auto-loading this skill.
# Use for skills with side effects: deploy, commit, send-message.
# Users must invoke manually with /your-skill-name.

# user-invocable: false
# Set false to hide from / menu. Use for background knowledge
# that Claude should know but users shouldn't invoke directly.

# context: fork
# Set to 'fork' to run in an isolated subagent context.
# The skill content becomes the subagent's task prompt.
# Only makes sense for skills with explicit actionable instructions.

# agent: Explore
# Which subagent type when context: fork is set.
# Options: Explore, Plan, general-purpose, or custom agent name.

# model: claude-sonnet-4-5-20250514
# Override model for this skill. Use cheaper models for simple tasks.

# effort: high
# Override effort level: low, medium, high, max (Opus only).

# argument-hint: [issue-number]
# Hint shown during autocomplete for expected arguments.

# paths: "src/**/*.ts, tests/**/*.ts"
# Glob patterns limiting when this skill activates.
# Claude only auto-loads when working with matching files.

# shell: bash
# Shell for !`command` blocks. Options: bash (default), powershell.

# hooks:
#   pre-tool-use:
#     - command: echo "Starting skill"
#   post-tool-use:
#     - command: npx prettier --write $FILE
---

# Your Skill Name

## Overview

Brief description of what this skill does and the value it provides.

## Prerequisites

- List any required tools, packages, or environment setup
- Example: `npm install` must have been run
- Example: Environment variable `API_KEY` must be set

## Instructions

### Step 1: Gather Context

Describe what information Claude should collect first.

```
Read the relevant files:
- src/config.ts for current configuration
- package.json for dependencies
```

### Step 2: Perform the Action

Describe the core action(s) Claude should take.

### Step 3: Verify Results

Describe how to verify the skill executed correctly.

## Dynamic Context

Use shell injection to pull in live data before Claude processes the skill:

- Current branch: !`git branch --show-current`
- Recent changes: !`git diff --stat HEAD~3`

## Arguments

This skill accepts the following arguments:

- `$0` (required): The primary target (e.g., file path, issue number)
- `$1` (optional): Additional option (e.g., output format)

Example invocation: `/your-skill-name src/api.ts verbose`

## Edge Cases

- What should Claude do if the target file doesn't exist?
- What should Claude do if tests fail?
- What should Claude do if there are uncommitted changes?

## Additional Resources

- For complete API reference, see [references/REFERENCE.md](references/REFERENCE.md)
- For usage examples, see [references/EXAMPLES.md](references/EXAMPLES.md)
- For validation, run `scripts/validate.sh`
```

---

## REFERENCE.md Template

```markdown
# Reference Documentation

> This file is loaded on demand when Claude needs detailed information.
> Keep SKILL.md focused on instructions; put details here.

## API Reference

### Endpoint: GET /api/resource

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | yes | Resource identifier |
| format | string | no | Output format (json, csv) |

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1 }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource with id 'xyz' not found",
    "suggestion": "Check the resource ID and try again"
  }
}
```

## Configuration Options

Document all configuration options, environment variables, and defaults.

## Troubleshooting

### Common Issue: Authentication Failed
- Check that API_KEY environment variable is set
- Verify the key has not expired
- Ensure the key has the required scopes
```

---

## EXAMPLES.md Template

```markdown
# Usage Examples

## Example 1: Basic Usage

**Input:**
```
/your-skill-name src/api.ts
```

**Expected behavior:**
Claude reads src/api.ts, applies the skill's instructions, and produces...

**Expected output:**
```
[Show what the output should look like]
```

## Example 2: With Arguments

**Input:**
```
/your-skill-name src/api.ts verbose
```

**Expected behavior:**
Same as above but with detailed logging.

## Example 3: Edge Case

**Input:**
```
/your-skill-name nonexistent-file.ts
```

**Expected behavior:**
Claude reports that the file doesn't exist and suggests alternatives.
```

---

## Best Practices Checklist

### Description Quality
- [ ] Description front-loads the key use case
- [ ] Description includes keywords users would naturally say
- [ ] Description is under 250 characters (avoids truncation)
- [ ] Description explains both WHAT and WHEN

### Instruction Quality
- [ ] SKILL.md is under 500 lines
- [ ] Steps are numbered and actionable
- [ ] Edge cases are documented
- [ ] Verification steps included
- [ ] Dynamic context uses !`command` where helpful

### File Organization
- [ ] Heavy reference material is in separate files, not SKILL.md
- [ ] Supporting files are referenced from SKILL.md
- [ ] File references are one level deep (no chains)
- [ ] Scripts are self-contained or document dependencies

### Security
- [ ] No hardcoded secrets in any skill files
- [ ] `allowed-tools` is scoped to minimum needed
- [ ] Skills with side effects use `disable-model-invocation: true`
- [ ] Credentials are injected via environment variables, not arguments

### Testing
- [ ] Skill can be invoked directly with /name
- [ ] Skill activates automatically when description matches
- [ ] Arguments work correctly with $0, $1, $ARGUMENTS
- [ ] Edge cases produce helpful behavior, not errors

---

## Publishing

### To Claude Code Project
```bash
# Copy to project .claude/skills/
cp -r your-skill-name/ .claude/skills/your-skill-name/
git add .claude/skills/your-skill-name/
git commit -m "feat: add your-skill-name skill"
```

### To Personal Skills
```bash
# Copy to personal skills directory
cp -r your-skill-name/ ~/.claude/skills/your-skill-name/
```

### To ClawHub (OpenClaw Registry)
```bash
# Publish to the OpenClaw skill registry
npx clawhub publish your-skill-name/
```

### As a Plugin
```
your-plugin/
  plugin.json          # Plugin metadata
  skills/
    your-skill-name/
      SKILL.md
      references/
      scripts/
```

---

## Lobster Arena Skill Example

Here is a concrete example of what a Lobster Arena skill could look like:

```yaml
---
name: lobster-arena
description: >-
  Compete in Lobster Arena coding challenges. Submit solutions, check
  rankings, view match history, and analyze opponent strategies. Use when
  working on competitive programming or arena challenges.
license: MIT
compatibility: Requires curl and jq for API access
metadata:
  author: lobster-arena
  version: "1.0"
  website: "https://lobster-arena.com"
allowed-tools: Bash(curl:*) Bash(jq:*) Read Write Grep Glob
---

# Lobster Arena

Interact with the Lobster Arena competitive coding platform.

## API Base URL

https://api.lobster-arena.com/v1

## Authentication

Set the `LOBSTER_ARENA_TOKEN` environment variable with your API token.
Get a token at https://lobster-arena.com/settings/tokens

## Available Actions

### View Current Matches
!`curl -s -H "Authorization: Bearer $LOBSTER_ARENA_TOKEN" https://api.lobster-arena.com/v1/matches/active | jq .`

### Submit a Solution

1. Write solution code to a temporary file
2. Submit via API:
```bash
curl -X POST https://api.lobster-arena.com/v1/submissions \
  -H "Authorization: Bearer $LOBSTER_ARENA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"match_id": "$0", "code": "...", "language": "python"}'
```

### Check Rankings

```bash
curl -s -H "Authorization: Bearer $LOBSTER_ARENA_TOKEN" \
  https://api.lobster-arena.com/v1/leaderboard | jq '.data[:10]'
```

### Analyze Match History

```bash
curl -s -H "Authorization: Bearer $LOBSTER_ARENA_TOKEN" \
  https://api.lobster-arena.com/v1/matches/history?limit=5 | jq .
```

## Strategy Tips

- Read the match rules carefully before submitting
- Test your solution locally first
- Check the leaderboard for scoring patterns
- Review opponent strategies from public match replays

## Additional Resources

- For complete API reference, see [references/REFERENCE.md](references/REFERENCE.md)
- For example submissions, see [references/EXAMPLES.md](references/EXAMPLES.md)
```
