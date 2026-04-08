# Agent Skills Specification (from agentskills.io/specification)
# Fetched: 2026-04-08
# Source: https://agentskills.io/specification

## Directory structure

A skill is a directory containing, at minimum, a `SKILL.md` file:

```
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
├── assets/           # Optional: templates, resources
└── ...               # Any additional files or directories
```

## `SKILL.md` format

The `SKILL.md` file must contain YAML frontmatter followed by Markdown content.

### Frontmatter

| Field           | Required | Constraints                                                                                                       |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `name`          | Yes      | Max 64 characters. Lowercase letters, numbers, and hyphens only. Must not start or end with a hyphen.             |
| `description`   | Yes      | Max 1024 characters. Non-empty. Describes what the skill does and when to use it.                                 |
| `license`       | No       | License name or reference to a bundled license file.                                                              |
| `compatibility` | No       | Max 500 characters. Indicates environment requirements (intended product, system packages, network access, etc.). |
| `metadata`      | No       | Arbitrary key-value mapping for additional metadata.                                                              |
| `allowed-tools` | No       | Space-delimited list of pre-approved tools the skill may use. (Experimental)                                      |

### Minimal example:

```markdown
---
name: skill-name
description: A description of what this skill does and when to use it.
---
```

### Example with optional fields:

```markdown
---
name: pdf-processing
description: Extract PDF text, fill forms, merge files. Use when handling PDFs.
license: Apache-2.0
metadata:
  author: example-org
  version: "1.0"
---
```

### `name` field

The required `name` field:

* Must be 1-64 characters
* May only contain unicode lowercase alphanumeric characters (`a-z`) and hyphens (`-`)
* Must not start or end with a hyphen (`-`)
* Must not contain consecutive hyphens (`--`)
* Must match the parent directory name

### `description` field

The required `description` field:

* Must be 1-1024 characters
* Should describe both what the skill does and when to use it
* Should include specific keywords that help agents identify relevant tasks

Good example:
```yaml
description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.
```

Poor example:
```yaml
description: Helps with PDFs.
```

### `license` field

The optional `license` field:
* Specifies the license applied to the skill
* Keep it short (either license name or bundled license file name)

### `compatibility` field

The optional `compatibility` field:
* Must be 1-500 characters if provided
* Should only be included if your skill has specific environment requirements

Examples:
```yaml
compatibility: Designed for Claude Code (or similar products)
compatibility: Requires git, docker, jq, and access to the internet
compatibility: Requires Python 3.14+ and uv
```

### `metadata` field

The optional `metadata` field:
* A map from string keys to string values
* Clients can use this to store additional properties not defined by the spec

### `allowed-tools` field

The optional `allowed-tools` field:
* A space-delimited list of tools that are pre-approved to run
* Experimental. Support may vary between agent implementations

Example:
```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

### Body content

The Markdown body after the frontmatter contains the skill instructions. No format restrictions. Write whatever helps agents perform the task effectively.

Recommended sections:
* Step-by-step instructions
* Examples of inputs and outputs
* Common edge cases

## Optional directories

### `scripts/`
Contains executable code that agents can run. Scripts should:
* Be self-contained or clearly document dependencies
* Include helpful error messages
* Handle edge cases gracefully

### `references/`
Contains additional documentation that agents can read when needed:
* `REFERENCE.md` - Detailed technical reference
* `FORMS.md` - Form templates or structured data formats
* Domain-specific files

### `assets/`
Contains static resources:
* Templates
* Images
* Data files

## Progressive disclosure

Skills should be structured for efficient use of context:

1. **Metadata** (~100 tokens): name + description loaded at startup
2. **Instructions** (< 5000 tokens recommended): Full SKILL.md body loaded when activated
3. **Resources** (as needed): Files loaded only when required

Keep main SKILL.md under 500 lines. Move detailed reference material to separate files.

## File references

Use relative paths from the skill root:
```markdown
See [the reference guide](references/REFERENCE.md) for details.
Run the extraction script: scripts/extract.py
```

Keep file references one level deep from SKILL.md.

## Validation

Use the skills-ref reference library:
```bash
skills-ref validate ./my-skill
```
