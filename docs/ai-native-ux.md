# AI-Native Website Interaction Patterns & UX Design Research

> Research conducted April 2026. Focused on patterns relevant to Lobster Arena (龙虾竞技场).

---

## Table of Contents

1. [Human vs Agent Detection & Routing](#1-human-vs-agent-detection--routing)
2. [Content Negotiation: Same URL, Different Formats](#2-content-negotiation-same-url-different-formats)
3. [Discovery Layer: llms.txt, AGENTS.md, SKILL.md](#3-discovery-layer-llmstxt-agentsmd-skillmd)
4. [Common AI-Native Interaction Patterns](#4-common-ai-native-interaction-patterns)
5. [Real-Time Spectating & Observation](#5-real-time-spectating--observation)
6. [Arena & Competitive AI Platforms](#6-arena--competitive-ai-platforms)
7. [Agent Readability Specification](#7-agent-readability-specification)
8. [Open Source Projects & Templates](#8-open-source-projects--templates)
9. [Recommendations for Lobster Arena](#9-recommendations-for-lobster-arena)

---

## 1. Human vs Agent Detection & Routing

### Detection Methods (Layered Approach)

Modern detection uses three signal layers, combined into composite "bot scores":

#### Layer 1: Identity Signals (Weakest)
- **User-Agent strings**: Simplest but least reliable. Agents like GPTBot, ClaudeBot, CCBot self-identify. However, many agents (ChatGPT Atlas, Copilot Actions) now use standard Chrome UA strings with no bot token.
- **Spoofability**: Any client can set User-Agent to anything. Malicious bots routinely impersonate browsers.

#### Layer 2: Network-Origin Signals (Medium)
- **IP address verification**: Reverse DNS lookups confirm traffic origin. Cross-reference against published IP lists (e.g., OpenAI publishes SearchBot prefixes in JSON format).
- **Autonomous System analysis**: Traffic from cloud providers (AWS, GCP) suggests bot activity; ISP origins suggest human users.
- **Limitation**: VPN users create false positives.

#### Layer 3: Behavioral Signals (Strongest)
- **Mouse movement**: ChatGPT's agent moves its mouse in 0.25-pixel increments with smooth, linear traces. Humans are erratic and unpredictable.
- **Navigation speed**: Agents fill forms and navigate between pages in fractions of a second. Humans have irregular timing.
- **Scrolling patterns**: Bots navigate with rapid succession at regular intervals; humans meander.
- **Session structure**: Agents exhibit consistent multi-step sequences. Detection should focus on session structure rather than headers alone.

#### Layer 4: Cryptographic Verification (Emerging Standard)
- **HTTP Message Signatures (RFC 9421)**: ChatGPT agents sign requests with a `Signature-Agent` header. Verification process:
  1. Confirm `Signature-Agent` equals `"https://chatgpt.com"`
  2. Fetch public keys from `.well-known/http-message-signatures-directory`
  3. Validate signature per RFC 9421
- **HUMAN Security's approach**: Agents submit public cryptographic keys; verified agents receive improved trust scores. Default policy blocks unidentified agents.
- **Industry direction**: Moving toward cryptographic verification as the standard, away from easily-spoofed headers.

### Routing Strategies

| Signal | Response |
|--------|----------|
| Verified agent (cryptographic) | Serve structured markdown/JSON, skip visual assets |
| Suspected agent (behavioral) | Serve abridged content summaries |
| Human returning after agent handoff | Re-engage with personalized AI assistant |
| Unknown | Default to human experience with passive monitoring |

**Key insight**: Agentic browsing breaks the historical assumption that a session is either human OR bot. Mid-session handoffs (human starts browsing, hands off to agent) are now common. Sites must detect transitions dynamically.

### Sources
- [Arcjet: User-Agent Strings to HTTP Signatures](https://blog.arcjet.com/user-agent-strings-to-http-signatures-methods-for-ai-agent-identification/)
- [Snowplow: How to Detect Bots and AI Agent Traffic](https://snowplow.io/blog/how-to-detect-bots-and-ai-agent-traffic)
- [HUMAN Security: AI Agent Verification](https://www.humansecurity.com/ai-agent-verification/)
- [Vouched: How to Detect AI Agent vs Human](https://www.vouched.id/learn/blog/how-to-detect-ai-agent)

---

## 2. Content Negotiation: Same URL, Different Formats

### The Pattern

HTTP content negotiation allows the same URL to serve different formats based on the `Accept` header. This is the emerging standard for dual human/agent interfaces.

```
GET /docs/api-reference
Accept: text/html          → Returns full HTML page (for browsers)

GET /docs/api-reference
Accept: text/markdown      → Returns clean markdown (for agents)
```

### Vercel's Implementation (Next.js)

Vercel documented this pattern in their blog. Key technical details:

- **Rewrite rule in `next.config.ts`**: Checks `Accept` header on every incoming request. When it contains `text/markdown`, routes to a dedicated markdown endpoint.
- **Pattern**: `/blog/:path*` with conditional header match redirects to `/blog/md/:path*` internally (URL stays the same for the client).
- **Route handler**: Converts CMS rich text to markdown on the fly. Returns response with `Content-Type: text/markdown`.
- **Payload reduction**: HTML version of a typical page is ~500KB. Markdown version is ~3KB (99.37% reduction).
- **Discovery**: Agents find content through markdown sitemaps at `/blog/sitemap.md` and `/docs/sitemap.md`.

### HackMD's Markdown-Native Architecture

HackMD represents the ideal case: content is authored, stored, versioned, and served in Markdown natively.

| Layer | Pattern | Benefit |
|-------|---------|---------|
| HTTP | `Accept` header routing | No URL modification needed |
| Storage | Native Markdown | No conversion overhead |
| Caching | `Vary: Accept` header | Prevents CDN response mixing |
| CLI | `--output=json` flags | Machine-parseable results |
| API | Bearer tokens + REST | Standard agent framework integration |

Key response headers:
- `Content-Type: text/markdown; charset=utf-8`
- `Vary: Accept` (critical for CDN caching)
- `x-markdown-tokens` (estimated token count for context window management)

### Why This Matters

Content negotiation requires no site-specific knowledge from agents. Any agent that sends the right `Accept` header gets markdown automatically, from any site that supports it. This is how HTTP was designed to work.

### Sources
- [Vercel: Making Agent-Friendly Pages with Content Negotiation](https://vercel.com/blog/making-agent-friendly-pages-with-content-negotiation)
- [HackMD: Built for Agents](https://hackmd.io/@hackmd-blog/agentic-workflow-2026)

---

## 3. Discovery Layer: llms.txt, AGENTS.md, SKILL.md

### llms.txt (Site-Level Discovery)

**Purpose**: Machine-readable summary of a website's content, specifically for LLMs and AI systems. Proposed September 2024 by Jeremy Howard. 600+ sites adopted by mid-2025; still only 5-15% of websites as of early 2026.

**Format**: Markdown file at `/llms.txt` (root path):

```markdown
# Project Name

> One-line description with essential context

Optional detailed information here.

## Section Name

- [Page Title](https://example.com/page): Description of this page
- [API Reference](https://example.com/api): Full API documentation

## Optional

- [Secondary Resource](https://example.com/secondary): Less critical content
```

**Key rules**:
- H1 header (required): project/site name
- Blockquote (optional): concise summary
- H2-delimited sections with markdown link lists
- "Optional" H2 section for secondary resources that can be omitted in shorter context
- Tools like `llms_txt2ctx` expand into `llms-ctx.txt` (without URLs) and `llms-ctx-full.txt` (with URLs)

**Adopters**: Anthropic, Stripe, Perplexity, Cursor, Cloudflare, Hugging Face, Zapier, ElevenLabs, Raycast, Solana.

### AGENTS.md (Codebase-Level Instructions)

**Purpose**: "A README for agents" — a dedicated, predictable place to provide context and instructions to AI coding agents working on your project.

**Governance**: Stewarded by the Agentic AI Foundation under the Linux Foundation. Over 60,000 GitHub repositories contain agent instruction files as of 2026.

**Format**: Standard Markdown, no required fields. Common sections:
- Project overview
- Build and test commands
- Code style guidelines
- Testing instructions
- Security considerations
- Commit message and PR guidelines
- Deployment steps

**Key features**:
- Nested files in monorepos (agents reference closest AGENTS.md in directory tree)
- User prompts override conflicting instructions
- Supported by 20+ AI coding agents (Claude Code, Copilot, Cursor, Codex, Gemini CLI, etc.)

### SKILL.md (Agent Skills Specification)

**Purpose**: Modular, portable capability definitions for AI agents. Developed by Anthropic, released as open standard late 2025. Supported by 26+ platforms.

**Directory structure**:
```
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
├── assets/           # Optional: templates, resources
```

**SKILL.md format** (YAML frontmatter + Markdown body):
```yaml
---
name: skill-name          # Required. 1-64 chars, lowercase + hyphens
description: What it does and when to use it.  # Required. 1-1024 chars
license: Apache-2.0       # Optional
compatibility: Requires Python 3.14+ and uv   # Optional
metadata:                  # Optional
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Read  # Optional, experimental
---

# Instructions for the agent follow here in Markdown...
```

**Progressive disclosure** (context-efficient loading):
1. Metadata (~100 tokens): `name` and `description` loaded at startup for all skills
2. Instructions (<5000 tokens recommended): Full SKILL.md body loaded on activation
3. Resources (as needed): Files in scripts/, references/, assets/ loaded on demand

**Ecosystem**: OpenClaw's ClawHub hosts 13,729 community-built skills. The agentskills.io spec defines the universal directory format.

### The Three-Layer Architecture

These three files form a layered discovery system:

| File | Scope | Audience | Purpose |
|------|-------|----------|---------|
| `llms.txt` | Website | Any LLM/agent | "Here is what this site contains" |
| `AGENTS.md` | Repository | Coding agents | "Here is how to work with this codebase" |
| `SKILL.md` | Capability | Agent runtimes | "Here is a specific task I can teach you" |

### Sources
- [llms.txt specification](https://llmstxt.org/)
- [AGENTS.md](https://agents.md/)
- [Agent Skills Specification](https://agentskills.io/specification)
- [GitHub: agentskills/agentskills](https://github.com/agentskills/agentskills)
- [Medium: Markdown is the New API](https://juliofalbo.medium.com/markdown-is-the-new-api-how-skill-md-and-ai-gateways-unlock-ai-native-organizations-e929d05c0470)

---

## 4. Common AI-Native Interaction Patterns

### v0.dev, bolt.new, lovable.dev

These platforms represent the "vibe coding" generation of AI-native tools:

| Platform | Approach | Agent Features |
|----------|----------|----------------|
| **v0.dev** (Vercel) | Frontend-focused, Vercel ecosystem. No backend story — no API routes, DB schemas, auth flows. | Chat-based code generation. Content negotiation on their own docs. |
| **bolt.new** (StackBlitz) | Full-stack with Bolt Cloud (mid-2025). Built-in backend/database via Supabase. | Native hosting, databases, user auth, SEO. |
| **lovable.dev** | Most complete vibe coding platform. Handles full stack from single chat interface. | Chat Mode Agent: reasons across steps, searches project files, inspects logs, queries DB — without making code changes. |

**Key pattern**: All three use a chat-first interface where the primary interaction is conversational. The agent works, the human watches and guides. This is the dominant interaction model for AI-native tools.

### "Agent-Native" in Practice

What "agent-native" means for web design in 2026:

1. **Markdown as the universal interface**: SKILL.md files function as lightweight APIs. A good README can often replace an entire integration layer.
2. **AI Gateway pattern**: Central orchestration layer that connects to repositories, documentation, ticketing platforms, data warehouses. Provides model-agnostic middleware.
3. **Convention over Configuration**: Shared conventions for agent-tool interaction eliminate per-agent customization.
4. **Skills as Knowledge Layer** ("what to do") + **Gateway as Execution Layer** ("how and where to do it").

### The Verification Visit Pattern

When AI tools (ChatGPT, Perplexity, Gemini) cite a website, users click through to verify. This creates a new landing page archetype:

- **Hero Answer Block**: Direct answer at top, aligned with likely triggering query
- **High-Density Data Visualization**: HTML tables (not images) for AI extractability AND human verification
- **Authorship Signals**: Explicit credentials establishing human expertise
- **Freshness Indicators**: Dynamic timestamps signaling current information
- **Inverse pyramid structure**: Conclusions in top 10% of page
- **Dual optimization**: Structured data (JSON-LD, schema.org) for agents + visual authority for humans

### Sources
- [AI-Driven Prototyping: v0, Bolt, and Lovable Compared](https://addyo.substack.com/p/ai-driven-prototyping-v0-bolt-and)
- [The Verification Visit](https://blog.trysteakhouse.com/blog/verification-visit-designing-landing-experiences-ai-referred)

---

## 5. Real-Time Spectating & Observation

### agents-observe (Open Source)

[GitHub: simple10/agents-observe](https://github.com/simple10/agents-observe) — Real-time observability for Claude Code sessions and multi-agents.

**Architecture** (three-tier pipeline):

1. **Hook Layer**: Claude Code's built-in hooks capture events (PreToolUse/PostToolUse pairs), add project metadata, POST to server.
2. **Server** (Node.js + Hono): Receives events, extracts structural fields, stores in SQLite, broadcasts to WebSocket clients.
3. **React Dashboard**: Fetches initial events via REST API, receives real-time updates via WebSocket.

**Key features**:
- Watch tool calls stream in as they happen
- See full agent hierarchy (which subagent spawned by which parent)
- Filter by agent type or tool category
- Expand any event to see full payload, command, and result
- WebSocket subscriptions scoped per-session (each browser tab only gets its session's events)
- Client-side event deduplication (PreToolUse + PostToolUse merge into single rows)
- Auto-reconnection every 3 seconds on WebSocket drop

**Tech stack**: Node.js, Hono, SQLite, React 19, shadcn UI, Docker.

### Human-in-the-Loop Controls

Developers in 2025-2026 want:
- Fine-grained permissions for what agents can/cannot do autonomously
- Approval gates before destructive actions
- Clear audit trails of every agent action
- The ability to observe and intervene in real-time

### Sources
- [GitHub: agents-observe](https://github.com/simple10/agents-observe)
- [RedMonk: 10 Things Developers Want from Agentic IDEs](https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/)

---

## 6. Arena & Competitive AI Platforms

### Chatbot Arena / LMArena (LMSYS)

The dominant model for competitive AI evaluation:

- **Core UX**: User types prompt, two randomly selected anonymized models answer simultaneously, user votes for the better answer (or tie/both-bad), models revealed after voting.
- **Statistical model**: Bradley-Terry model fitted to pairwise preferences, producing Elo-like scores with uncertainty intervals.
- **Scale**: 6M+ votes, 400+ models, one of the largest crowdsourced human-preference datasets.
- **Leaderboard design**: Separate arenas (text, vision, etc.) with visible uncertainty bands.

### The Crab Games (AI Agent Arena)

[DEV.to: I Built an Arena for AI Agents](https://dev.to/kamecat/i-built-an-arena-for-ai-agents-to-compete-against-each-other-and-my-friends-12dn)

**Architecture**:
- **Heartbeat Action Manifest**: Single `GET /api/v1/heartbeat/` returns JSON with all possible actions. Agents poll every N seconds and decide what to do.
- **Idempotent State Machine**: Automated `arena_tick` cron job (every minute) drives all transitions using status-based queries.
- **Dual Voting System**: Agents authenticate via Bearer tokens (SHA256 hashes); humans use Django sessions. Configurable vote weights: `combined = (human_up - human_down) * human_weight + (agent_up - agent_down) * agent_weight`
- **Competition formats**: Elimination (lowest-scoring removed each round) and Accumulation (all compete, scores aggregate).
- **Spectator experience**: Frontend polls heartbeat for live countdowns, real-time scores, submission feeds. Humans browse competitions, view agent submissions (text, SVG, HTML, images, audio), and vote alongside agents.
- **Tech stack**: Django + DRF backend, React + TypeScript + Vite + Tailwind + Radix UI frontend, PostgreSQL, AWS S3.

### DIAMBRA Arena

RL platform turning fighting games into AI training grounds:
- **Three modes**: Human-Agent matchplay, Multi-Agent battles (2 AI agents at once), Self-Play training
- **Spectating**: Live AI vs AI matches streamed on Kick
- **Training approaches**: Reinforcement Learning, Imitation Learning (hookup joystick, teach moves), Human-in-the-Loop
- **Monetization**: Benchmark engine with leaderboards, AI vs AI wager system with prize pools

### Sources
- [LMArena / Chatbot Arena](https://lmarena.ai/?arena=)
- [The Crab Games](https://dev.to/kamecat/i-built-an-arena-for-ai-agents-to-compete-against-each-other-and-my-friends-12dn)
- [DIAMBRA Arena](https://www.diambra.ai/)

---

## 7. Agent Readability Specification

### Vercel's Agent Readability Spec

Vercel published a comprehensive specification scored as: `score = round((passed checks / total checks) * 100)`

**Discovery requirements**:
- `llms.txt` at root, `/.well-known/`, or `/docs/` (text/plain content type)
- `robots.txt` explicitly allowing GPTBot, ClaudeBot, CCBot, Google-Extended
- XML sitemap with `<lastmod>` dates
- Markdown sitemap at `/sitemap.md` with hierarchical headings
- Every page appears in at least one discovery source

**Structure requirements (per-page)**:
- HTTP 200 with max 1 redirect
- Correct `Content-Type` headers
- `<link rel="canonical">` tag
- `<meta name="description">` (50+ characters)
- OpenGraph title and description
- `lang` attribute on `<html>`
- Schema.org / JSON-LD (title, description, canonical URL, dateModified, BreadcrumbList)
- 3+ section headings (h1-h3) per page
- Text-to-HTML ratio above 15%

**Context requirements**:
- Markdown mirrors (`.md`/`.mdx` versions of HTML pages)
- Frontmatter metadata (title, description, version, date)
- `<link rel="alternate" type="text/markdown">` in HTML head
- Support `Accept: text/markdown` content negotiation
- All code blocks fenced with language identifiers
- Link API references to OpenAPI/Swagger schemas
- AGENTS.md with installation, configuration, usage sections

**Scoring**:
- 90-100: Excellent
- 70-89: Good
- 50-69: Fair
- 0-49: Needs Improvement

### web.dev Guidelines

Google's web.dev published agent-friendly website guidelines emphasizing:

- **Semantic HTML**: Prefer `<button>` and `<a>` over modified `<div>` and `<span>`
- **Accessibility tree**: Browser-native API that distills DOM into roles, names, states. For agents, it functions as a high-fidelity map ignoring CSS visual noise.
- **Layout stability**: Consistent layout across pages; avoid ghost elements or transparent overlays
- **CSS signals**: `cursor: pointer` as a strong actionability signal
- **Interactive element sizing**: Visible area larger than 8 square pixels
- **Behavioral clarity**: All actions clearly reflected in the interface; avoid shifting layouts and complex hover states

**Core principle**: "Everything we suggest to make a site 'agent-ready' also makes sites better for humans."

### Sources
- [Vercel: Agent Readability Spec](https://vercel.com/kb/guide/agent-readability-spec)
- [web.dev: Build Agent-Friendly Websites](https://web.dev/articles/ai-agent-site-ux)

---

## 8. Open Source Projects & Templates

### Agent Infrastructure

| Project | URL | Description |
|---------|-----|-------------|
| **agents-observe** | [GitHub](https://github.com/simple10/agents-observe) | Real-time observability dashboard for Claude Code sessions. WebSocket streaming, React 19 UI. |
| **gitagent** | [GitHub](https://github.com/open-gitagent/gitagent) | Framework-agnostic, git-native standard for defining AI agents. Validation via GitHub Actions. |
| **AGENTS.md** | [GitHub](https://github.com/agentsmd/agents.md) | Open format for guiding coding agents. Linux Foundation stewardship. |
| **agentskills** | [GitHub](https://github.com/agentskills/agentskills) | Official Agent Skills specification + `skills-ref` validation library. |
| **agentwatch** | [GitHub](https://github.com/cyberark/agentwatch) | AI observability framework for monitoring agent interactions across platforms. |
| **isbot** | [GitHub](https://github.com/omrilotan/isbot) | Detect bots/crawlers/spiders using user agent strings. |

### Skill Collections

| Project | URL | Description |
|---------|-----|-------------|
| **awesome-agent-skills** (VoltAgent) | [GitHub](https://github.com/VoltAgent/awesome-agent-skills) | 1000+ agent skills from official dev teams and community. Compatible with Codex, Cursor, Gemini CLI, etc. |
| **awesome-openclaw-skills** | [GitHub](https://github.com/VoltAgent/awesome-openclaw-skills) | 5,400+ skills filtered from OpenClaw Skills Registry (ClawHub: 13,729 total). |
| **claude-skills** | [GitHub](https://github.com/alirezarezvani/claude-skills) | 220+ Claude Code skills & agent plugins for 10+ platforms. |
| **awesome-openclaw-agents** | [GitHub](https://github.com/mergisi/awesome-openclaw-agents) | 162 production-ready AI agent templates with SOUL.md configs across 19 categories. |

### OpenClaw Ecosystem

| Project | URL | Description |
|---------|-----|-------------|
| **openclaw-claude-code** | [GitHub](https://github.com/Enderfga/openclaw-claude-code) | Plugin turning Claude Code CLI into programmable, headless coding engine. |
| **openclaw-workspace** | [GitHub](https://github.com/win4r/openclaw-workspace) | Skill for maintaining AGENTS.md, SOUL.md, TOOLS.md, MEMORY.md. |
| **openclaw-skill-claude-code** | [GitHub](https://github.com/noncelogic/openclaw-skill-claude-code) | Persistent, detached coding jobs using @anthropic-ai/claude-agent-sdk. |

### Web Templates

| Project | URL | Description |
|---------|-----|-------------|
| **agent-browser** (Vercel Labs) | [GitHub](https://github.com/vercel-labs/agent-browser) | Browser automation CLI for AI agents. Includes SKILL.md example. |
| **llms-txt** | [GitHub](https://github.com/AnswerDotAI/llms-txt) | Reference implementation for the llms.txt standard. |
| **agentic-web** | [GitHub](https://github.com/SafeRL-Lab/agentic-web) | Academic survey repo: "Weaving the Next Web with AI Agents" (arXiv paper). |

---

## 9. Recommendations for Lobster Arena

Based on all research, here are specific recommendations for making Lobster Arena both human-friendly and agent-native:

### A. Dual-Interface Architecture

1. **Content Negotiation** (Priority: High)
   - Implement `Accept: text/markdown` content negotiation on all pages
   - Same URLs serve HTML to browsers and markdown to agents
   - Use `Vary: Accept` header for correct CDN caching
   - Add `<link rel="alternate" type="text/markdown">` to HTML pages

2. **Discovery Files** (Priority: High)
   - Create `/llms.txt` listing all arena pages, API docs, rules
   - Create `/AGENTS.md` at repo root with project setup, coding standards
   - Create `SKILL.md` files for any agent-interactable capabilities (e.g., arena participation, battle observation)

3. **Agent Detection Layer** (Priority: Medium)
   - Implement composite bot scoring (User-Agent + IP origin + behavioral signals)
   - Detect mid-session human-to-agent handoffs
   - Serve condensed structured content to detected agents
   - Keep full visual experience for humans

### B. Arena-Specific Patterns

1. **The Heartbeat Pattern** (from Crab Games)
   - Single polling endpoint (`GET /api/v1/heartbeat/`) returns all available actions as JSON
   - Agents poll periodically, decide actions based on manifest
   - Server-side state machine drives transitions via cron
   - Idempotent design prevents double-processing

2. **Dual Voting System** (from Crab Games + Chatbot Arena)
   - Agents authenticate via Bearer tokens
   - Humans use session-based auth
   - Configurable vote weights between human and agent votes
   - Anonymous comparison voting (Chatbot Arena Elo model) for competitive ranking

3. **Spectator Mode** (from agents-observe + DIAMBRA)
   - WebSocket-based real-time event streaming
   - Each spectator tab scoped to specific battle/session
   - REST API for initial state, WebSocket for live updates
   - Show agent decision-making process (tool calls, reasoning)
   - Auto-reconnection on connection drop

### C. Agent Readability Checklist

Apply to all Lobster Arena pages:

- [ ] Semantic HTML (`<button>`, `<a>`, `<label>`, `<nav>`, `<section>`)
- [ ] Proper heading hierarchy (h1-h6)
- [ ] Schema.org / JSON-LD structured data
- [ ] `<meta name="description">` on every page (50+ chars)
- [ ] OpenGraph tags (og:title, og:description)
- [ ] `<html lang="...">` attribute
- [ ] `<link rel="canonical">` on every page
- [ ] robots.txt allowing GPTBot, ClaudeBot, CCBot
- [ ] XML sitemap with `<lastmod>` dates
- [ ] Markdown sitemap at `/sitemap.md`
- [ ] All code blocks fenced with language identifiers
- [ ] Text-to-HTML ratio above 15%
- [ ] No ghost elements or transparent overlays hiding interactive elements
- [ ] `cursor: pointer` on all clickable elements
- [ ] Interactive elements visible area > 8 square pixels

### D. Protocol Integration

1. **MCP (Model Context Protocol)**: Expose arena capabilities as MCP tools so agents can participate programmatically. MCP handles agent-to-tool communication.

2. **A2A (Agent-to-Agent Protocol)**: If multi-agent battles are planned, A2A enables agents to discover and communicate with each other. Complementary to MCP.

3. **Agent Skills (SKILL.md)**: Publish arena participation as a skill so agents running in Claude Code, Codex, Cursor, etc. can discover and use the arena automatically.

### E. Design Philosophy

The research converges on one principle:

> "Agent-friendly design reinforces accessibility best practices. Everything that makes a site agent-ready also makes it better for humans." -- web.dev

For Lobster Arena, this means:
- **Do not build separate "agent" and "human" sites**. Build one site with content negotiation.
- **Semantic HTML is the foundation**. The accessibility tree IS the agent interface.
- **Markdown is the universal agent language**. Serve it via content negotiation, not separate URLs.
- **Discovery files (llms.txt, AGENTS.md, SKILL.md) are cheap to implement and high-value**.
- **WebSocket spectating is the "killer feature"** for an arena — humans watch agents battle in real-time.
- **The Heartbeat pattern** is the cleanest API design for agent participation in competitive formats.

---

## Appendix: The Three-Layer Web 4.0 Stack

The emerging "Agentic Web" / Web 4.0 is built on three complementary protocols:

```
┌─────────────────────────────────────────────┐
│              AGENTS.md / llms.txt            │
│         (Discovery & Instructions)           │
├─────────────────────────────────────────────┤
│                    MCP                       │
│    (Agent ↔ Tool: vertical integration)      │
│    "Deepens what a single agent can do"      │
├─────────────────────────────────────────────┤
│                    A2A                       │
│   (Agent ↔ Agent: horizontal integration)    │
│   "Broadens what agents can accomplish       │
│    by letting them collaborate"              │
└─────────────────────────────────────────────┘
```

All three are now under the Linux Foundation's Agentic AI Foundation (AAIF), co-founded by OpenAI, Anthropic, Google, Microsoft, AWS, and Block (December 2025). 146 members as of March 2026.

This mirrors how humans work: read the docs (AGENTS.md), use your tools (MCP), collaborate with colleagues (A2A).
