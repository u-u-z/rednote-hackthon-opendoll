# agents.json Specifications (Multiple)
# Fetched: 2026-04-08

## 1. Wild Card AI agents.json (github.com/wild-card-ai/agents-json)

### Purpose
"Translate OpenAPI into LLM Tools" -- extends OpenAPI specs with optimizations
for endpoint discovery and LLM argument generation.

### Core Concepts
- **agents.json File**: JSON schema at `/.well-known/agents.json`
- **Flows**: Contracts describing a series of 1+ API calls that produce an outcome
- **Links**: Describe how two actions connect in a sequence
- Version: 0.1.0

### Design Principles
1. Build atop the OpenAPI standard
2. Optimize schema for LLMs rather than humans
3. Enforce statelessness -- agents handle orchestration
4. Require minimal changes to existing APIs

### Auth Support
Basic, ApiKey, Bearer authentication. OAuth completed.

---

## 2. Lando agents.json (github.com/lando22/agents.json)

### Purpose
"Instructs autonomous agents how to use your site" -- similar to robots.txt
but for AI agent interaction guidance.

### File Structure
```json
{
  "apiVersion": "1.0",
  "baseUrl": "https://example.com",
  "pages": {
    "/page-path": {
      "uiInteractions": {
        "elementName": {
          "selector": "CSS selector",
          "description": "Human-readable element purpose",
          "agent_instructions": "Guidance for AI agents"
        }
      }
    }
  }
}
```

### Interaction Types
- navigate: Move to specified URLs
- click: Activate buttons or links
- enter_text: Input text into form fields
- select: Choose from dropdown options

---

## 3. Agent JSON Protocol (agentjson.org)

### Purpose
Universal JSON specification for AI agents -- Portable Agent Manifest (PAM).

### Features
- JSON Schema 2020-12 validated manifests
- 7 standard capabilities
- Framework-agnostic, schema-validated, open source

### Core Concept
Define agents, capabilities, tools, and governance in a single interoperable manifest.

---

## 4. JSON Agents (jsonagents.org)

### Purpose
Universal JSON-native standard for describing AI agents, capabilities, tools,
runtimes, and governance in a portable, framework-agnostic format.

### Features
- Portable Agent Manifest (PAM) specification
- CLI tool for validation, conversion, formatting, and testing
- Validators for Python and TypeScript
