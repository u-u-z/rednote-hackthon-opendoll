# OPENDOLL Auth Design — Session-Token 鉴权

> 适用于 Agent-first API 的轻量鉴权方案

---

## 1. 背景与约束

OPENDOLL 是一个 "one-shot" 体验型 API：Agent 创建一个 session → 生成候选面孔 → 思考选择 → 揭晓。整个流程是一次性的，不存在长期的 Agent 账号或反复登录的场景。

**需要解决的问题：**

- `generate` 和 `think` 端点调用 Gemini / LLM，成本高，必须防止未授权访问
- session 的写操作只能由创建者执行，不能被其他人劫持
- 揭晓页 (`/face`) 需要可分享的公开 URL，不能加 auth 门槛

**不需要的东西：**

- 持久化 Agent 账号 / 注册流程（这不是社交平台）
- JWT / OAuth / Cookie Session（Agent 是程序调用者，不是浏览器用户）
- Token 过期与刷新（session 有自己的状态机，到 `revealed` 后 token 自然无意义）

---

## 2. 方案：Session-as-Credential

创建 session 时签发一个一次性 token，后续的写操作凭此 token 鉴权。

### 对比 moltbook-api

| 维度 | moltbook-api | OPENDOLL |
|------|-------------|----------|
| 身份模型 | 持久化 Agent 账号 | 无账号，session 即身份 |
| 注册流程 | `POST /agents/register` → API key | 无注册 |
| 凭证生命周期 | 永久有效 | 随 session 生灭 |
| 存储 | agents 表 + api_key_hash | sessions 表 + token_hash |
| 复杂度 | 注册 / claim / 验证码 | 零管理 |

### 流程

```
Agent                          API                         DB
  │                             │                           │
  ├─ POST /api/session ────────►│                           │
  │  (公开, rate-limited)       ├─ generate token ─────────►│
  │                             │  INSERT session +         │
  │                             │  token_hash               │
  │◄─ { session_id, token } ───┤                           │
  │                             │                           │
  ├─ POST /session/:id/generate►│                           │
  │  Authorization: Bearer token├─ hash(token) ───────────►│
  │                             │  WHERE token_hash = ?     │
  │                             │  + id 比对                │
  │◄─ { candidates } ──────────┤                           │
  │                             │                           │
  ├─ GET /session/:id/think ───►│  (同上鉴权)               │
  │  Authorization: Bearer token│                           │
  │◄─ SSE stream ──────────────┤                           │
  │                             │                           │
  ├─ GET /session/:id/face ────►│  (公开, 无需 token)       │
  │◄─ { face_image, words } ───┤                           │
```

---

## 3. Token 规格

| 属性 | 值 |
|------|-----|
| 前缀 | `odtk_` |
| 随机部分 | 32 字节 = 64 hex 字符 |
| 总长度 | 69 字符 |
| 示例 | `odtk_a3f7c1...（64 hex chars）` |
| 存储 | SHA-256 hash 入库，明文只返回一次 |

前缀 `odtk_`（OpenDoll Token）的作用：
- 日志中一眼识别
- 可以 grep 检测泄漏
- 格式校验的第一道防线

---

## 4. 端点权限矩阵

| 端点 | 方法 | 鉴权 | 原因 |
|------|------|------|------|
| `/api/session` | POST | 公开 (rate-limit) | 创建 session 是入口，靠限流防滥用 |
| `/api/session/:id/generate` | POST | **Session Token** | 调用 Gemini，成本高 |
| `/api/session/:id/think` | GET (SSE) | **Session Token** | 调用 LLM，成本高 |
| `/api/session/:id/face` | GET | 公开 | 揭晓页需要可分享 URL |
| `/api/images/:filename` | GET | 公开 | 图片服务，URL 本身含随机性 |
| `/api/health` | GET | 公开 | 健康检查 |

---

## 5. 安全设计

### 5.1 Token 不可逆存储

```
明文 token ──► SHA-256 ──► token_hash 存入 DB
                            ↑
                    即使 DB 泄漏也无法还原 token
```

### 5.2 Session 越权防护

中间件验证两件事：
1. token_hash 在 DB 中存在 → 身份合法
2. 查出的 session.id === URL 中的 `:id` → 不能用 A 的 token 操作 B 的 session

### 5.3 Rate Limiting（建议）

`POST /api/session` 是唯一的公开写入端点，建议加 IP 级限流：

| 规则 | 限制 |
|------|------|
| 创建 session | 每 IP 每分钟 5 次 |
| 全局 | 每 IP 每分钟 30 次 |

---

## 6. 数据变更

### sessions 表

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  agent_name    TEXT NOT NULL,
  agent_context TEXT NOT NULL,
  candidates    TEXT,
  thinking      TEXT,
  chosen_face   TEXT,
  token_hash    TEXT NOT NULL,        -- 新增
  status        TEXT DEFAULT 'started',
  created_at    TEXT DEFAULT (datetime('now'))
);
```

### API 响应变更

`POST /api/session` 的响应增加 `token` 字段：

```json
{
  "session_id": "sess_a1b2c3d4e5f6",
  "token": "odtk_7f3a..."
}
```

Token 仅在此响应中返回一次，不会在任何其他端点中出现。

---

## 7. 实现清单

### 新增

| 文件 | 内容 |
|------|------|
| `lib/auth.ts` | `generateToken()` / `hashToken()` / `requireSessionToken` 中间件 |

### 修改

| 文件 | 变更 |
|------|------|
| `shared/index.ts` | sessions 表 DDL 加 `token_hash` 列 |
| `mod/apimod/index.ts` | `CreateSessionResp` 增加 `token` 字段 |
| `mod/dbmod/index.ts` | `SessionRow` 增加 `token_hash` 字段 |
| `svc/session/dao/index.ts` | `createSession` 接受 `tokenHash` 参数 |
| `svc/session/handler/index.ts` | 创建时签发 token；generate/think 挂载中间件 |

---

## 8. 中间件伪代码

```typescript
// lib/auth.ts
import crypto from "node:crypto";
import { createMiddleware } from "hono/factory";
import { db } from "../shared/index.js";

const TOKEN_PREFIX = "odtk_";
const TOKEN_BYTES = 32;

export function generateToken(): string {
  return TOKEN_PREFIX + crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const requireSessionToken = createMiddleware(async (c, next) => {
  // 1. 提取 Bearer token
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "missing or invalid Authorization header" }, 401);
  }

  const token = header.slice(7);
  if (!token.startsWith(TOKEN_PREFIX)) {
    return c.json({ error: "invalid token format" }, 401);
  }

  // 2. Hash 查库
  const hash = hashToken(token);
  const row = db()
    .prepare("SELECT id FROM sessions WHERE token_hash = ?")
    .get(hash) as { id: string } | undefined;

  if (!row) {
    return c.json({ error: "invalid token" }, 401);
  }

  // 3. 防止越权：token 对应的 session 必须匹配 URL 中的 :id
  const sessionId = c.req.param("id");
  if (sessionId && row.id !== sessionId) {
    return c.json({ error: "token does not match session" }, 403);
  }

  await next();
});
```

---

## 9. 不做的事情

| 决策 | 原因 |
|------|------|
| 不建 agents 表 | 无持久化 Agent 身份需求 |
| 不用 JWT | 省去签名 / 过期 / 刷新的复杂度，直接查库更简单 |
| 不做 OAuth | Agent 是程序调用者，不是浏览器用户 |
| 不做 token 过期 | session 状态机（started → revealed）天然限定了 token 的有效窗口 |
| 不做 token 刷新 | 一次性体验，没有续期场景 |
