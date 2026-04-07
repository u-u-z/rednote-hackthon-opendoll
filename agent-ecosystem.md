# AI Agent Ecosystem Research

> Research date: 2026-04-08
> Purpose: Guide product decisions for Lobster Arena

---

## 1. Claude Code Skills Ecosystem

### What Are Claude Code Skills?

Skills are modular capabilities installed into Claude Code. Each skill is a directory containing a `SKILL.md` file with YAML frontmatter and markdown instructions. Claude loads skill descriptions at startup and activates the full skill content on demand.

Claude Code skills follow the [Agent Skills](https://agentskills.io) open standard (created by Anthropic, adopted by Microsoft, OpenAI, Cursor, GitHub, Atlassian, Figma). Partner-built skills from Canva, Stripe, Notion, and Zapier are available.

### Skill File Format

```
skill-name/
  SKILL.md           # Required: metadata + instructions
  scripts/           # Optional: executable code
  references/        # Optional: documentation
  assets/            # Optional: templates, resources
```

**SKILL.md structure:**

```yaml
---
name: my-skill                        # Required, max 64 chars, lowercase + hyphens
description: What it does and when     # Required, max 1024 chars
license: MIT                           # Optional
compatibility: Requires Python 3.14+   # Optional, max 500 chars
allowed-tools: Bash(git:*) Read        # Optional, space-delimited
metadata:                              # Optional, arbitrary key-value
  author: example-org
  version: "1.0"
---

Markdown instructions here...
```

### Claude Code Specific Extensions

Claude Code extends the Agent Skills standard with additional frontmatter:

| Field | Purpose |
|-------|---------|
| `disable-model-invocation` | Prevent Claude from auto-loading (manual `/name` only) |
| `user-invocable` | Set `false` to hide from `/` menu (background knowledge) |
| `context` | Set to `fork` to run in isolated subagent |
| `agent` | Which subagent type (`Explore`, `Plan`, custom) |
| `model` | Override model for this skill |
| `effort` | Override effort level (`low`, `medium`, `high`, `max`) |
| `hooks` | Lifecycle hooks scoped to this skill |
| `paths` | Glob patterns limiting when skill activates |
| `argument-hint` | Autocomplete hint for arguments |
| `shell` | `bash` (default) or `powershell` |

### How Discovery Works

1. **Startup**: Claude loads all skill `name` and `description` fields into context (~1% of context window budget)
2. **Matching**: When a user message matches a skill's description keywords, Claude decides to activate it
3. **Loading**: Full `SKILL.md` content is loaded into context
4. **Progressive disclosure**: Supporting files (`references/`, `scripts/`) are loaded only when needed

### Skill Storage Locations (Priority Order)

| Level | Path | Scope |
|-------|------|-------|
| Enterprise | Managed settings | All org users |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Where plugin enabled |

### Dynamic Context Injection

Skills support shell command preprocessing with `` !`command` `` syntax:

```yaml
---
name: pr-summary
context: fork
agent: Explore
---
## PR context
- PR diff: !`gh pr diff`
- Changed files: !`gh pr diff --name-only`

Summarize this pull request...
```

Commands execute before Claude sees the content; output replaces the placeholder.

### Variable Substitutions

- `$ARGUMENTS` / `$0`, `$1`, `$2` - Arguments passed to skill
- `${CLAUDE_SESSION_ID}` - Current session ID
- `${CLAUDE_SKILL_DIR}` - Directory containing the skill

### Key Design Insight

> Claude only reads name + description to decide whether to load a skill. If your description doesn't match how someone would actually ask for help, the skill stays dormant forever.

**Sources:**
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Anthropic Skills GitHub](https://github.com/anthropics/skills)

---

## 2. OpenClaw / ClawHub Ecosystem

### What Is OpenClaw?

OpenClaw is a third-party plugin that turns Claude Code CLI into a programmable, headless coding engine. It provides a 27-tool API, session persistence (7-day disk TTL), multi-model proxy, cost tracking, and runtime model/tool switching.

### ClawHub Registry

ClawHub is the public registry for OpenClaw skills -- like npm for agent skills.

- **13,729 community-built skills** as of February 2026
- Search powered by embeddings (vector search), not just keywords
- Automated security analysis on every published skill
- Skills install to `~/.openclaw/skills/`
- Install via: `npx clawhub install [skill-name]`

### How ClawHub Works

1. User publishes skill bundle (files + metadata)
2. ClawHub stores bundle, parses metadata, assigns version
3. Registry indexes skill for search/discovery
4. Users browse, download, install skills

### Security Model

Each skill page shows security analysis results including flagged behaviors:
- Network requests
- File system writes
- Credential handling

**Sources:**
- [OpenClaw GitHub](https://github.com/Enderfga/openclaw-claude-code)
- [Awesome OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [ClawHub Docs](https://docs.openclaw.ai/tools/clawhub)

---

## 3. Agent Discovery Standards

### Agent Web Protocol (AWP) - `/.well-known/agent.json`

The emerging standard for declaring any web surface as agent-ready.

> "What `robots.txt` did for crawlers, `agent.json` does for agents."

**agent.json structure:**
```json
{
  "awp_version": "0.1",
  "domain": "example.com",
  "intent": "E-commerce platform for electronics",
  "auth": {
    "type": "oauth2",
    "scopes": ["read:products", "write:orders"]
  },
  "actions": [
    {
      "id": "search",
      "method": "GET",
      "endpoint": "/api/products/search",
      "description": "Search product catalog",
      "parameters": { ... }
    },
    {
      "id": "purchase",
      "method": "POST",
      "endpoint": "/api/orders",
      "description": "Place an order",
      "parameters": { ... }
    }
  ]
}
```

- **Status**: Draft v0.1, MIT license, open-source
- **Location**: `/.well-known/agent.json`
- **Auth**: OAuth 2.0, API keys, session-based
- **Website**: [agentwebprotocol.org](https://www.agentwebprotocol.org/)

### Agent2Agent Protocol (A2A) - Google

For agent-to-agent communication (complementary to MCP which handles agent-to-tool).

- Launched by Google April 2025, now under Linux Foundation
- 100+ technology companies participating
- Uses `/.well-known/agent-card.json` for discovery
- Built on HTTP, SSE, JSON-RPC 2.0
- Supports sync request/response, streaming (SSE), async push notifications
- Enterprise-grade auth parity with OpenAPI

### llms.txt Standard

A plain-text Markdown file at domain root providing an LLM-optimized site map.

- Proposed by Jeremy Howard (Answer.AI) in 2024
- 844,000+ websites implemented as of late 2025
- Used by Anthropic, Cloudflare, Stripe
- **Not yet confirmed** to be parsed by any major AI provider during retrieval
- Specification at [llmstxt.org](https://llmstxt.org/)

### ai.txt (Emerging)

Domain-specific language for declaring what kinds of AI interactions are allowed:
- Allows summarization but disallows image extraction
- Permits use of one section for training but restricts another
- More granular than robots.txt

### IETF AI Preferences Working Group

Launched January 2026 to create standardized, machine-readable rules for how AI systems can use web content.

### Really Simple Licensing (RSL)

Allows web publishers to set AI usage terms in robots.txt. Participants include Medium, Reddit, Yahoo.

**Sources:**
- [Agent Web Protocol](https://www.agentwebprotocol.org/)
- [A2A Protocol](https://a2a-protocol.org/latest/)
- [Google A2A Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [llms.txt Specification](https://llmstxt.org/)

---

## 4. Model Context Protocol (MCP)

### Overview

MCP is what HTTP is to the web: a universal communication standard letting any AI model connect to any tool that implements the protocol.

- Created by Anthropic (November 2024)
- Donated to Linux Foundation's Agentic AI Foundation (December 2025)
- Co-founded by Anthropic, Block, and OpenAI
- 97+ million monthly downloads as of March 2026

### Architecture

- **Protocol**: JSON-RPC 2.0
- **Transport**: stdio (local) or HTTP with Server-Sent Events (remote)
- **Client**: AI model / IDE / agent host
- **Server**: Tool, database, or API

### 2026 Roadmap

1. Transport scalability
2. Agent communication (async tasks, retry, result TTL)
3. Governance maturation
4. Enterprise readiness (OAuth 2.1, SAML/OIDC, audit trails)

### Relationship to Other Standards

| Protocol | Purpose |
|----------|---------|
| MCP | Agent-to-tool communication |
| A2A | Agent-to-agent communication |
| AWP | Agent-to-website discovery |
| llms.txt | LLM content discovery |

**Sources:**
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [2026 MCP Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- [MCP Wikipedia](https://en.wikipedia.org/wiki/Model_Context_Protocol)

---

## 5. Competing Agent Platforms

### Devin (Cognition)

- Operates in sandboxed compute environment with shell, code editor, and browser
- Each session is isolated -- can install packages, run tests, browse docs safely
- Browser agent reads DOM/accessibility tree, identifies interactive elements, performs actions
- Adapts to unexpected events (popups, CAPTCHAs, layout changes)
- Interactive Browser lets humans jump in to help
- Can record video walkthroughs and send via Slack
- Best for: well-defined backlogs, migration projects, data engineering, repetitive refactoring

### Cursor

- Agent Mode (Cmd+I): autonomous multi-file editing
- Creates plans, edits files, shows diffs for approval
- MCP support for external tool integration
- External API keys (BYOK for Claude, GPT, Gemini)
- Rules and notepads for granular control

### Windsurf

- Cascade agent for autonomous development
- MCP support for connecting to external tools/data sources
- Configuration through settings or config files
- Supports database queries, GitHub integration, API testing, browser automation

### Key Difference: Claude Code vs IDE Agents

Claude Code operates as a CLI tool with full terminal access and can run arbitrary commands. IDE agents (Cursor, Windsurf) operate within the IDE context with more constrained tool access but better visual integration.

**Sources:**
- [Devin Docs](https://docs.devin.ai/)
- [Cursor vs Windsurf Comparison](https://vibecoding.app/blog/cursor-vs-windsurf)
- [Devin Guide 2026](https://aitoolsdevpro.com/ai-tools/devin-guide/)

---

## 6. Agent Authentication Patterns

### Four Primary Identity Models

| Model | Description | Risk Profile |
|-------|-------------|-------------|
| Bot/Service Identity | Single API key or bot token | Low friction, high leak risk |
| Per-User Tokens | Each user completes OAuth once | High friction, strong permissions |
| Shared Org Token | Admin grants single access | Medium friction, needs app-level enforcement |
| Workspace-Scoped | One token per workspace | Balanced isolation and setup |

### OAuth Token Exchange for Agents

The recommended pattern: trade a long-lived human token for a narrower, shorter-lived token designed for a specific task. Prevents agents from inheriting more privilege than needed.

### Critical Security Principles

1. **Never give agents direct credential access** -- inject credentials server-side
2. **Enforce permissions outside the agent context** -- in application code, not the reasoning loop
3. **Eliminate long-lived secrets** -- no hardcoded API keys in environment variables
4. **Use intent-specific tool calls** -- not generic CRUD tools
5. **Watch for prompt injection as credential exposure vector**

### Machine Identity Scale

Machine identities now outnumber human identities 82:1, expanding the blast radius of every leaked credential.

### MCP Auth Roadmap (2026)

- OAuth 2.1 flows
- SAML/OIDC integration
- Audit trails
- Enterprise authentication

**Sources:**
- [Guide to Secure AI Agent Authentication](https://nango.dev/blog/guide-to-secure-ai-agent-api-authentication)
- [OAuth Token Exchange & Agentic AI](https://www.strata.io/blog/agentic-identity/why-agentic-ai-demands-more-from-oauth-6a/)
- [AI Agent Authentication Methods](https://stytch.com/blog/ai-agent-authentication-methods/)
- [Agent Security Patterns](https://www.gnanaguru.com/blog/agent-security-patterns/)

---

## 7. Agent-Friendly Website Checklist

### Discovery Layer

- [ ] Serve `/.well-known/agent.json` (AWP) declaring actions, auth, and capabilities
- [ ] Serve `/llms.txt` with curated site map for LLM discovery
- [ ] Implement JSON-LD structured data markup
- [ ] Use semantic HTML5 tags (`<article>`, `<section>`, `<header>`, `<nav>`)
- [ ] Maintain consistent, descriptive URL structures
- [ ] Expose RSS/Atom feeds for content

### API Design

- [ ] Provide complete OpenAPI/Swagger specifications
- [ ] Use consistent parameter naming throughout
- [ ] Return structured error responses with consistent schemas
- [ ] Include realistic request/response examples
- [ ] Document rate limits, auth methods, and common workflows
- [ ] Apply standard HTTP status codes
- [ ] Group related endpoints logically
- [ ] Support batch/vectorized operations (not just one-at-a-time)
- [ ] Provide counting endpoints (`countOnly=true`) instead of forcing pagination
- [ ] Embed conditional logic in APIs rather than forcing LLMs to branch
- [ ] Pass rich objects to tools, not just primitive IDs

### Error Messages for LLMs

- [ ] Return structured JSON errors with `code`, `message`, `details` fields
- [ ] Include actionable suggestions in error messages
- [ ] Make error messages descriptive enough for agents to choose alternative strategies
- [ ] Use standard HTTP status codes consistently
- [ ] Include `Retry-After` header on rate limit responses
- [ ] Never leak credentials or internal state in error messages

### Rate Limiting

- [ ] Use token-based rate limiting (not just request-count)
- [ ] Include rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- [ ] Provide `Retry-After` header on 429 responses
- [ ] Consider adaptive rate limiting based on agent behavior
- [ ] Document rate limits clearly in API docs
- [ ] Offer tiered rate limits (free vs paid agents)

### Authentication

- [ ] Support OAuth 2.0/2.1 with token exchange for agents
- [ ] Support API key authentication for simpler use cases
- [ ] Never require agents to handle raw credentials directly
- [ ] Use short-lived, scoped tokens for agent tasks
- [ ] Document token acquisition process clearly
- [ ] Implement audit trails for agent access

### Documentation Format

- [ ] Use Markdown or structured plain text (not PDFs or heavy HTML)
- [ ] Include concrete input/output examples for all endpoints
- [ ] Use semantic headers and bullet points
- [ ] Provide Q&A formats for RAG-friendly discovery
- [ ] Keep modules focused (2000-4000 tokens per file)
- [ ] Include an `ARCHITECTURE.md` explaining system relationships

### MCP Server (Optional but Recommended)

- [ ] Expose an MCP server for direct agent-to-tool integration
- [ ] Follow JSON-RPC 2.0 protocol
- [ ] Support stdio and/or HTTP+SSE transport
- [ ] Provide tool descriptions that match natural language requests

### Safety and Control

- [ ] Implement preview modes for agent-suggested changes
- [ ] Generate detailed diffs before modifications
- [ ] Create audit logs with timestamps and reasoning
- [ ] Require human checkpoints for high-impact operations
- [ ] Provide rollback mechanisms for agent-initiated actions
- [ ] Separate "read" and "write" capabilities clearly

**Sources:**
- [7 Guidelines for AI-Friendly APIs](https://medium.com/@chipiga86/7-practical-guidelines-for-designing-ai-friendly-apis-c5527f6869e6)
- [Designing for LLMs and AI Agents](https://medium.com/@pur4v/designing-for-llms-and-ai-agents-best-practices-for-the-new-digital-users-82050320ce00)
- [APIs for AI Agents: Integration Patterns](https://composio.dev/content/apis-ai-agents-integration-patterns)
- [Token-Based Rate Limiting for AI Agents](https://zuplo.com/learning-center/token-based-rate-limiting-ai-agents)
- [How AI Agents Are Changing API Rate Limits](https://nordicapis.com/how-ai-agents-are-changing-api-rate-limit-approaches/)
- [How to Structure Content for LLM Discovery](https://www.bcg.com/x/the-multiplier/how-to-structure-website-content-for-llm-discovery)

---

## 8. Key Product Implications for Lobster Arena

### Immediate Actions

1. **Create `/.well-known/agent.json`** -- declare what agents can do on the site (view matches, submit code, check rankings)
2. **Create `/llms.txt`** -- curated map of API docs, match rules, and submission guidelines
3. **Build an MCP server** -- let Claude Code and other agents interact with the arena directly
4. **Publish a Claude Code skill** -- a `.claude/skills/lobster-arena/SKILL.md` that teaches Claude how to compete

### Medium-Term Strategy

5. **Design API for agents first** -- structured errors, batch operations, rich tool arguments, counting endpoints
6. **Support OAuth token exchange** -- let agents compete on behalf of users with scoped, short-lived tokens
7. **Create an Agent Card** (`/.well-known/agent-card.json`) -- for agent-to-agent discovery via A2A protocol
8. **Publish to ClawHub** -- list the Lobster Arena skill in the OpenClaw registry for discovery

### Long-Term Vision

9. **Agent-native experience** -- the website should be equally functional for human browsers and AI agent clients
10. **Agent leaderboard** -- track which AI agents/skills perform best in the arena
11. **Skill marketplace** -- allow community to publish competing strategies as Claude Code skills
12. **A2A tournament mode** -- let agents discover and challenge each other via A2A protocol

### Protocol Priority

| Priority | Protocol | Why |
|----------|----------|-----|
| 1 | Agent Skills (SKILL.md) | Direct integration with Claude Code and growing ecosystem |
| 2 | MCP Server | Universal agent-to-tool standard, 97M+ monthly downloads |
| 3 | AWP (agent.json) | Website discovery for any agent |
| 4 | llms.txt | Content discovery for LLMs |
| 5 | A2A Protocol | Agent-to-agent tournaments (future) |
