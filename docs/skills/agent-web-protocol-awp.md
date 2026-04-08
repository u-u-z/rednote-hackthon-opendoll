# Agent Web Protocol (AWP) Specification
# Fetched: 2026-04-08
# Source: https://www.agentwebprotocol.org/ and https://github.com/agentwebprotocol/spec

## Overview
AWP defines `agent.json` -- a machine-readable file at `/.well-known/agent.json` that
tells AI agents what a website can do. It's the agent-era successor to robots.txt.

Historical context:
- `robots.txt` -> crawler access restrictions
- `sitemap.xml` -> available pages
- `llms.txt` -> content context
- `agent.json` -> agent capabilities

## agent.json Structure

Deployed at `/.well-known/agent.json`

### Required/Primary Fields:
- `awp_version`: Protocol version (currently "0.1")
- `domain`: Website domain identifier
- `intent`: Human-readable description of site purpose
- `actions`: Array of available operations

### Action Object Format:
Each action includes:
- `id`: Unique action identifier (e.g., "search", "purchase")
- `method`: HTTP verb (GET, POST, etc.)
- `endpoint`: API path specification

## Key Features

### Discovery
Well-known endpoint enables agent discovery without scraping or prompt injection.

### Capabilities
Declare structured actions with typed parameters and descriptions supporting
operations like search, booking, purchasing, and form submission.

### Authentication
Built-in support for OAuth 2.0, API keys, and session-based authentication
with explicit scope declarations.

### Schema
JSON schema-based format designed for agent parsing and human readability.

### Tooling
Command-line support via `npx agent-json init` and integration with Claude Code
through the AWP MCP server.

## Key Components in agent.json:
1. **Actions** -- Operations agents can perform with typed parameters and returns
2. **Auth** -- Authentication requirements and token refresh mechanisms
3. **Errors** -- Failure states and resolution pathways
4. **Dependencies** -- Action ordering prerequisites
5. **Hints** -- Semantic planning guidance

## Status
- Current Version: v0.1 (draft)
- License: MIT
- Contact: spec@agentwebprotocol.org
