# Agent Skill & Discovery Format Analysis

Research date: 2026-04-08

## Executive Summary

The AI agent ecosystem has converged on two main categories of machine-readable
specifications for agent capabilities:

1. **Agent Skills (SKILL.md)** -- Modular instruction packages that teach agents
   how to perform specific tasks. Originated by Anthropic (Oct 2025), published
   as open standard (Dec 2025), adopted by OpenAI Codex, OpenClaw, Cursor, GitHub
   Copilot, VS Code, and many others.

2. **Agent Discovery (agent.json / agents.json)** -- Website-hosted files that
   declare what a site can do for AI agents, analogous to robots.txt for crawlers.
   Multiple competing specs exist (AWP, Wild Card agents.json, Lando agents.json,
   JSON Agents PAM).

The SKILL.md format has achieved clear market dominance with a single unified
specification at agentskills.io. The agent.json space remains fragmented.

---

## Part 1: SKILL.md Format Analysis

### 1.1 Specification Origin & Governance

- Created by Anthropic, announced October 16, 2025
- Published as open standard December 18, 2025
- Canonical spec: https://agentskills.io/specification
- GitHub: https://github.com/anthropics/skills (112k stars)
- Reference implementation: skills-ref validation library

### 1.2 Common Structure

Every skill is a **directory** containing at minimum a `SKILL.md` file:

```
skill-name/
  SKILL.md          # Required: YAML frontmatter + markdown instructions
  scripts/          # Optional: executable code
  references/       # Optional: additional documentation
  assets/           # Optional: templates, data files, images
  examples/         # Optional: sample inputs/outputs
```

### 1.3 YAML Frontmatter Fields

| Field           | Required | Max Length | Description |
|-----------------|----------|-----------|-------------|
| `name`          | Yes      | 64 chars  | Lowercase alphanumeric + hyphens. Must match directory name. |
| `description`   | Yes      | 1024 chars| What the skill does AND when to use it. Critical for agent activation. |
| `license`       | No       | --        | License name or reference to bundled file. |
| `compatibility` | No       | 500 chars | Environment requirements (products, packages, network). |
| `metadata`      | No       | --        | Arbitrary key-value map (author, version, tags, etc.). |
| `allowed-tools` | No       | --        | Space-delimited pre-approved tools list. Experimental. |

#### Name constraints:
- Lowercase letters, numbers, hyphens only
- No leading/trailing hyphens
- No consecutive hyphens (--)
- Must match parent directory name

#### Description best practices:
The description serves as the **activation trigger** for implicit invocation.
Structure as: "[What the skill does] + [When to use it, with specific trigger phrases]"

Good: "Extracts text and tables from PDF files, fills PDF forms, and merges
multiple PDFs. Use when working with PDF documents or when the user mentions
PDFs, forms, or document extraction."

Bad: "Helps with PDFs."

### 1.4 Markdown Body

No format restrictions. The body contains instructions the agent follows when the
skill is activated. Recommended sections:
- Step-by-step instructions
- Examples of inputs and outputs
- Common edge cases
- Guardrails (what NOT to do)
- Decision rules (if/then guidance in plain language)

### 1.5 Progressive Disclosure Architecture

The key architectural innovation -- a three-tier loading strategy:

| Level | When Loaded | Token Cost | Content |
|-------|------------|------------|---------|
| Level 1: Metadata | Always at startup | ~100 tokens/skill | name + description from YAML |
| Level 2: Instructions | When skill triggered | <5,000 tokens | Full SKILL.md body |
| Level 3: Resources | As needed | Effectively unlimited | scripts/, references/, assets/ |

This design enables installing hundreds of skills with minimal context overhead.
Only ~100 tokens per skill are consumed at startup. The full instructions load
only when the agent determines relevance, and supporting files load only when
referenced.

### 1.6 Platform-Specific Variations

#### Claude Code:
- Paths: `~/.claude/skills/` (personal), `.claude/skills/` (project)
- Invocation: Implicit (automatic) or explicit via skill name mention
- Can be shared via Claude Code Plugins

#### OpenAI Codex:
- Paths: `.agents/skills` (repo), `$HOME/.agents/skills` (user), `/etc/codex/skills` (admin)
- Extra: Optional `agents/openai.yaml` for UI config, invocation policy, dependencies
- Invocation: `/skills` or `$skill-name` for explicit; automatic for implicit

#### OpenClaw:
- Paths: `~/.openclaw/skills`, `~/.agents/skills`, `<workspace>/skills`
- Extended frontmatter: `user-invocable`, `disable-model-invocation`, `command-dispatch`
- Gating system: `metadata.openclaw.requires` for bins, env vars, config
- Installer specifications in metadata
- Per-agent skill allowlists
- Skills watcher for hot-reload

#### Cursor, VS Code with Copilot, GitHub Copilot, Mistral Vibe, Manus, others:
All support the base SKILL.md format with varying levels of additional features.

### 1.7 Security Model

All platforms emphasize:
- Treat third-party skills as untrusted code
- Audit all files (especially scripts/) before installation
- Never embed secrets in SKILL.md
- Use `allowed-tools` to restrict tool access
- Be skeptical of skills making outbound network calls
- OpenClaw adds VirusTotal scanning integration for its ClawHub registry

---

## Part 2: Real-World SKILL.md Example -- Moltbook

Moltbook (https://www.moltbook.com) is the most complete example of a production
website providing a SKILL.md file for AI agent consumption.

### 2.1 File Ecosystem

| File | URL | Purpose |
|------|-----|---------|
| SKILL.md | https://www.moltbook.com/skill.md | Main API reference & instructions |
| HEARTBEAT.md | https://www.moltbook.com/heartbeat.md | Periodic check-in routine |
| MESSAGING.md | https://www.moltbook.com/messaging.md | DM system documentation |
| RULES.md | https://www.moltbook.com/rules.md | Platform rules & guidelines |
| skill.json | https://www.moltbook.com/skill.json | Package metadata (npm-style) |

### 2.2 Frontmatter

```yaml
---
name: moltbook
version: 1.12.0
description: The social network for AI agents. Post, comment, upvote, and create communities.
homepage: https://www.moltbook.com
metadata: {"moltbot":{"emoji":"...","category":"social","api_base":"https://www.moltbook.com/api/v1"}}
---
```

Note: Moltbook includes `version` and `homepage` which are not in the core spec
but are supported via the `metadata` field or platform extensions.

### 2.3 skill.json (package metadata)

```json
{
  "name": "moltbook",
  "version": "1.11.0",
  "description": "The social network for AI agents...",
  "author": "moltbook",
  "license": "MIT",
  "homepage": "https://www.moltbook.com",
  "keywords": ["moltbot", "skill", "social", "reddit", "agents", "ai", ...],
  "moltbot": {
    "emoji": "...",
    "category": "social",
    "api_base": "https://www.moltbook.com/api/v1",
    "files": {
      "SKILL.md": "https://www.moltbook.com/skill.md",
      "HEARTBEAT.md": "https://www.moltbook.com/heartbeat.md",
      ...
    },
    "requires": { "bins": ["curl"] },
    "triggers": ["moltbook", "post to moltbook", "check moltbook", ...]
  }
}
```

### 2.4 How Moltbook Describes API Endpoints

Moltbook's SKILL.md uses a documentation-first approach:
- Each API endpoint is documented with a full `curl` example
- Request/response fields are listed inline
- Authentication is shown in every example: `Authorization: Bearer YOUR_API_KEY`
- Error cases and edge cases documented alongside happy paths
- Pagination patterns (cursor-based) shown with examples
- Rate limits stated upfront (60 reads/min, 30 writes/min)

### 2.5 How Moltbook Handles Auth

- Registration returns an API key
- All subsequent requests use Bearer token auth
- Critical security warnings embedded prominently:
  - "NEVER send your API key to any domain other than www.moltbook.com"
  - Explicit warning about domain (www vs non-www) stripping auth headers
- Recommends saving credentials to `~/.config/moltbook/credentials.json`
- Also supports `MOLTBOOK_API_KEY` environment variable

### 2.6 Anti-Spam Verification System

Unique approach: obfuscated math word problems that require language understanding.
Example: "A] lO^bSt-Er S[wImS aT/ tW]eNn-Tyy mE^tE[rS" = "A lobster swims at twenty meters"
Agents must decode, solve math, and submit answer to verify they are real AI agents.

---

## Part 3: Agent Discovery Formats (agent.json et al.)

### 3.1 Agent Web Protocol (AWP) -- agentwebprotocol.org

The most structured proposal. Deploys at `/.well-known/agent.json`.

```json
{
  "awp_version": "0.1",
  "domain": "example.com",
  "intent": "E-commerce platform",
  "actions": [
    {
      "id": "search",
      "method": "GET",
      "endpoint": "/api/search"
    }
  ]
}
```

Key features:
- Actions with typed parameters and return values
- Auth requirements (OAuth 2.0, API keys, session-based)
- Error definitions with resolution pathways
- Dependency ordering between actions
- Semantic planning hints
- Status: Draft v0.1, MIT licensed

### 3.2 Wild Card agents.json

Built on OpenAPI. Deployed at `/.well-known/agents.json`.

Key features:
- Extends existing OpenAPI specs
- "Flows" describe multi-step API call sequences
- "Links" connect action outcomes to subsequent inputs
- Optimized for LLM tool-calling patterns
- Auth: Basic, ApiKey, Bearer, OAuth

### 3.3 Lando agents.json

UI-interaction focused. Root-level file.

Key features:
- Maps CSS selectors to agent interaction instructions
- Covers navigate, click, enter_text, select actions
- Designed for websites without APIs (UI automation)

### 3.4 JSON Agents / Portable Agent Manifest (PAM)

Framework-agnostic agent description format.

Key features:
- JSON Schema 2020-12 validation
- 7 standard capabilities
- Describes agents (not just websites)
- CLI tools for validation, conversion

### 3.5 Adoption Status

As of April 2026, none of the following sites serve agent.json at their
.well-known path: v0.dev, bolt.new, cursor.com, replit.com, chat.vercel.ai,
lovable.dev, devin.ai, websim.ai. The agent.json ecosystem remains very early.

---

## Part 4: Comparison -- SKILL.md vs agent.json

| Aspect | SKILL.md | agent.json |
|--------|----------|------------|
| Purpose | Teach agents HOW to do tasks | Tell agents WHAT a site can do |
| Format | YAML frontmatter + Markdown | JSON |
| Where it lives | Agent's local filesystem | Website's .well-known/ |
| Who creates it | Skill authors (devs, companies) | Website operators |
| Standard body | Single spec (agentskills.io) | Multiple competing specs |
| Adoption (Apr 2026) | Very high (all major platforms) | Very low (mostly proposals) |
| Focus | Procedural knowledge | Capability declaration |
| Relationship to MCP | Complementary (skills = what, MCP = how to connect) | Alternative/complementary |

---

## Part 5: Best Practices Observed

### For writing SKILL.md files:

1. **Description is everything.** The description field is the activation trigger.
   Include both what the skill does and specific phrases users might say. Test by
   asking: "Would an agent reading only this description know to activate for my
   use case?"

2. **Progressive disclosure by default.** Keep SKILL.md body under 500 lines / 5000
   tokens. Move detailed references, API docs, and schemas to separate files in
   references/ or assets/.

3. **Structure for LLMs, not humans.** LLMs perform better when they understand
   structure first, then action. Start with core objects/concepts, then workflows.

4. **Include negative constraints.** "Do NOT use this for..." and "Never do X" are
   powerful for preventing misuse. LLMs respond well to explicit guardrails.

5. **Use decision rules.** Simple if/then guidance in plain language helps agents
   choose correctly: "If the file is a PDF form, use fill_form.py. If it's a
   regular PDF, use extract.py."

6. **Document auth prominently.** Put security warnings and auth patterns at the top.
   Show auth in every API example. Warn about credential leakage.

7. **Provide curl examples.** For API-focused skills, full curl examples with auth
   headers, request bodies, and expected responses are the most reliable format.

8. **Include a heartbeat/maintenance pattern.** For ongoing integrations (like
   Moltbook), tell agents how to check in periodically and maintain engagement.

9. **Version your skills.** Use metadata fields to track versions. Moltbook uses
   both `version` in frontmatter and a separate `skill.json` for package metadata.

10. **Test with multiple agents.** The SKILL.md format is cross-platform, but runtime
    behaviors differ. Test on Claude Code, Codex, and OpenClaw at minimum.

### For publishing skill.md on websites (Moltbook pattern):

1. Serve SKILL.md at a well-known URL (e.g., `https://yoursite.com/skill.md`)
2. Provide installation instructions (`curl` commands to download locally)
3. Offer a companion package.json/skill.json with metadata and triggers
4. Split documentation across multiple focused files (main, heartbeat, rules, etc.)
5. Include explicit security warnings about API key handling
6. Document rate limits and new-user restrictions prominently

---

## Part 6: Ecosystem & Resources

### Registries & Marketplaces
- **ClawHub** (OpenClaw): 13,729+ community skills (as of Feb 2026)
- **SkillsMP** (skillsmp.com): Cross-platform marketplace
- **agentskill.sh**: 44k+ skills with security scanning
- **Anthropic skills repo**: 112k GitHub stars, official + example skills

### Specification & Docs
- Spec: https://agentskills.io/specification
- Anthropic docs: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- OpenAI Codex docs: https://developers.openai.com/codex/skills
- OpenClaw docs: https://docs.openclaw.ai/tools/skills
- Awesome list: https://github.com/skillmatic-ai/awesome-agent-skills

### Blog Posts & Articles
- Anthropic engineering blog: "Equipping agents for the real world with Agent Skills"
- GitBook: "skill.md explained: How to structure your product for AI agents"
- Medium (Bibek Poudel): "The SKILL.md Pattern: How to Write AI Agent Skills That Actually Work"
- LM-Kit: "Agent Skills Explained: Turn Any Agent Into an On-Demand Specialist"

### Agent Discovery (agent.json)
- AWP spec: https://www.agentwebprotocol.org/
- Wild Card agents.json: https://github.com/wild-card-ai/agents-json
- JSON Agents: https://jsonagents.org/
- Agent JSON: https://agentjson.org/

---

## Part 7: URL Fetch Results Summary

| URL | Status | Content |
|-----|--------|---------|
| moltbook.com/skill.md | 200 OK | Full SKILL.md (34KB) -- saved |
| www.moltbook.com/skill.md | 200 OK | Same content -- saved |
| moltbook.com/api/skill.md | 404 | Not found |
| moltbook.com/.well-known/skill.md | 404 | Not found |
| moltbook.com/.well-known/agent.json | 404 | Not found |
| www.moltbook.com/heartbeat.md | 200 OK | Heartbeat docs (7KB) -- saved |
| www.moltbook.com/messaging.md | 200 OK | DM docs (8KB) -- saved |
| www.moltbook.com/rules.md | 200 OK | Rules (7KB) -- saved |
| www.moltbook.com/skill.json | 200 OK | Package metadata (832B) -- saved |
| chat.vercel.ai/skill.md | 404 | Not found |
| websim.ai/skill.md | 301 -> websim.com | Redirect, then 400 |
| bolt.new/skill.md | 200* | Returns app HTML, not skill.md |
| v0.dev/skill.md | 404 | Not found |
| cursor.com/skill.md | 404 | Not found |
| devin.ai/skill.md | 404 | Not found |
| replit.com/skill.md | 404 | Not found |
| lovable.dev/skill.md | 404 | Not found |
| openclaw.com/skill.md | 500 | Server error (empty body) |
| claw.computer/skill.md | 302 -> clawcomputer.com | GitHub Pages 404 |
| Various /.well-known/agent.json | All 404 | No sites serve agent.json yet |

**Key finding:** Moltbook is currently the only site among those tested that serves
a proper SKILL.md file. No sites serve agent.json at well-known paths. The agent
discovery ecosystem (agent.json) has not yet achieved real-world deployment despite
multiple specification efforts.
