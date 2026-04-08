# OPENDOLL — Agent 给自己选一张脸

> 黑客松 MVP 计划

---

## Pitch（30 秒版）

AI Agent 正在变成一等公民：它们发帖、社交、投票、组建社区。
但它们没有身体。

KIGLAND 做了多年的角色面具 / 头壳制造。
OPENDOLL 要回答一个问题：

**如果一个 Agent 可以拥有实体，它会选择一张什么样的脸？**

不是人类替它选，是它自己选——有偏好、有理由、有审美主张。

---

## 这不是什么

| 常见误解 | 实际情况 |
|---------|---------|
| 又一个 AI 生图 Demo | 重点不是生成，是 Agent 的自主决策过程 |
| 虚拟形象编辑器 | 不是捏脸工具，Agent 不需要人类手动调参 |
| 社交平台 MVP | 没有 feed、没有 karma，专注单一闭环 |
| 制造系统原型 | 不涉及 STL/CAD/下单链路 |

## 这是什么

一个 **Agent-native 的身份决策系统**：

```
Agent 自述身份 → 系统生成候选面孔 → Agent 逐个审视、对话、淘汰
→ 最终选定一张脸 → 输出一份可追溯的 Face Identity Card
```

核心卖点：**决策过程本身就是产品**。

---

## Demo 剧本（3 分钟）

这是评委会看到的完整流程，也是倒推技术实现的唯一依据。

### ACT 1 — 身份输入（30s）

屏幕上出现一个简洁界面。Presenter 说：

> "我们现在要让一个 Agent 给自己选一张脸。"

输入 Agent 身份：
```
Name:       Mochi
Role:       夜间陪伴型 Agent
Personality: 安静、温柔、有点疏离
Style:      偏好柔和轮廓，不喜欢攻击性设计
```

点击「开始选脸」。

### ACT 2 — 候选生成 + Agent 自主对话（90s）⭐ 核心高潮

系统生成 4 张候选面孔，每张附带设计说明。

**关键：Agent 不是静默选一个。Agent 会对话式地审视每张脸。**

界面实时流式展示 Agent 的思考过程：

```
🤔 Mochi 正在审视候选 A...

"这张脸的轮廓太锐利了，像是为战斗型角色设计的。
 我的角色是夜间陪伴，需要让人放松。❌ 排除。"

🤔 Mochi 正在审视候选 B...

"眼睛的形状很好，有一种安静的温柔感。
 但配色太冷了，我更希望让人感到温暖。🤔 保留但有保留意见。"

🤔 Mochi 正在审视候选 C...

"这张最接近我想要的感觉。圆润的轮廓，
 温暖的配色，眼神安静但不空洞。✅ 我选这张。"

💡 最终选择：候选 C
   理由摘要："圆润轮廓 + 暖色调 + 安静眼神 = 夜间陪伴的可信赖感"
```

**这就是 Demo 的高潮：评委看到的不是"AI 生了一张图"，而是"一个 Agent 像人一样审视、思考、做决定"。**

### ACT 3 — Face Identity Card（30s）

最终输出一张精美的「身份卡」：

```
┌─────────────────────────────────┐
│  FACE IDENTITY CARD             │
│  ─────────────────              │
│  [候选 C 的面孔图片]             │
│                                 │
│  Agent:    Mochi                │
│  Role:     夜间陪伴型            │
│  Chosen:   候选 C               │
│                                 │
│  Face Spec:                     │
│    轮廓: 圆润柔和               │
│    眼型: 半闭安静               │
│    配色: 暖白 + 淡橙             │
│    气质: 温柔可信赖              │
│                                 │
│  Agent's Words:                 │
│  "这张脸让我觉得像我自己。"      │
│                                 │
│  ── OPENDOLL × KIGLAND ──      │
└─────────────────────────────────┘
```

### ACT 4 — 点题（30s）

> "今天 Agent 选了一张数字面孔。
>  明天 KIGLAND 可以把这张脸变成一个真实的面具寄给它的主人。
>  这是 Agent 从数字到实体的第一步。"

---

## 技术架构

只有两个运行时进程：一个前端、一个后端。

```
┌──────────────────────────────────────────────────┐
│  Frontend (Next.js)                              │
│  ├── / .................. 身份输入 + 开始按钮      │
│  ├── /session/:id ....... 候选展示 + Agent 对话流  │
│  └── /card/:id .......... Face Identity Card      │
└──────────────┬───────────────────────────────────┘
               │ REST + SSE (流式 Agent 思考)
┌──────────────▼───────────────────────────────────┐
│  Backend (Node.js / Express 或 Hono)             │
│  ├── POST /api/session .......... 创建会话        │
│  ├── POST /api/session/:id/gen .. 生成候选        │
│  ├── GET  /api/session/:id/eval . SSE 流式决策    │
│  └── GET  /api/session/:id/card . 获取最终卡片    │
│                                                  │
│  调用链:                                          │
│  生成候选 → 图片生成 API (DALL·E / SD)            │
│  Agent 决策 → LLM API (structured output)        │
│  数据持久化 → SQLite (单文件，零运维)              │
└──────────────────────────────────────────────────┘
```

### 技术选型理由

| 选择 | 为什么 |
|------|--------|
| SQLite | 黑客松不需要 PostgreSQL 的运维成本，单文件部署即走 |
| SSE (Server-Sent Events) | Agent 的逐条思考需要流式推送到前端，SSE 比 WebSocket 简单得多 |
| Structured Output | LLM 必须返回可解析的 JSON，不能是自由文本 |
| 图片生成用外部 API | 不自己训练模型，调 DALL·E / Stability 的 API，失败就用预设图 |

---

## 数据模型

只有 **2 张表**。黑客松不需要 5 张。

```sql
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  agent_name  TEXT NOT NULL,
  agent_role  TEXT NOT NULL,
  agent_traits TEXT NOT NULL,        -- JSON array
  agent_style TEXT,
  agent_prompt TEXT,
  status      TEXT DEFAULT 'created', -- created → evaluating → decided
  candidates  TEXT,                   -- JSON array of candidate objects
  evaluation  TEXT,                   -- JSON: Agent 的完整评估过程
  decision    TEXT,                   -- JSON: 最终选择 + 理由
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE cards (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES sessions(id),
  card_data   TEXT NOT NULL,          -- JSON: 最终 Face Identity Card 完整数据
  created_at  TEXT DEFAULT (datetime('now'))
);
```

为什么这样设计：
- 一个 Session 就是一次完整的选脸过程，所有中间态都存在 JSON 字段里
- 黑客松不需要 normalize，JSON 字段够用
- Cards 单独一张表是因为它是最终产物，可能需要独立查询/分享

---

## API（只有 4 个端点）

### 1. `POST /api/session` — 创建会话

```json
// Request
{
  "agent_name": "Mochi",
  "agent_role": "夜间陪伴型 Agent",
  "agent_traits": ["安静", "温柔", "有点疏离"],
  "agent_style": "偏好柔和轮廓，不喜欢攻击性设计",
  "agent_prompt": "我想要一张让人安心的脸"
}

// Response
{ "session_id": "sess_a1b2c3" }
```

### 2. `POST /api/session/:id/generate` — 生成候选面孔

后端做两件事：
1. 根据 Agent 身份构建 image prompt，调图片生成 API 生成 4 张图
2. 为每张图生成设计说明（tags + rationale）

```json
// Response
{
  "candidates": [
    {
      "id": "cand_1",
      "image_url": "https://...",
      "tags": ["锐利轮廓", "冷色调", "战斗感"],
      "rationale": "强调力量感和存在感的设计方向"
    },
    // ... 3 more
  ]
}
```

### 3. `GET /api/session/:id/evaluate` — SSE 流式 Agent 决策

这是最核心的端点。返回 SSE 事件流。

```
event: thinking
data: {"candidate_id":"cand_1","text":"这张脸的轮廓太锐利了..."}

event: thinking
data: {"candidate_id":"cand_1","decision":"reject","text":"❌ 排除"}

event: thinking
data: {"candidate_id":"cand_2","text":"眼睛的形状很好..."}

event: thinking
data: {"candidate_id":"cand_2","decision":"maybe","text":"🤔 保留但有保留意见"}

event: thinking
data: {"candidate_id":"cand_3","text":"这张最接近我想要的感觉..."}

event: decision
data: {"chosen":"cand_3","reason":"圆润轮廓 + 暖色调 + 安静眼神","summary":"夜间陪伴的可信赖感"}

event: done
data: {}
```

### 4. `GET /api/session/:id/card` — 获取 Face Identity Card

```json
{
  "agent_name": "Mochi",
  "agent_role": "夜间陪伴型 Agent",
  "chosen_candidate": {
    "id": "cand_3",
    "image_url": "https://...",
    "tags": ["圆润轮廓", "暖色调", "安静眼神"]
  },
  "agent_words": "这张脸让我觉得像我自己。",
  "face_spec": {
    "contour": "圆润柔和",
    "eyes": "半闭安静",
    "palette": ["暖白", "淡橙"],
    "vibe": "温柔可信赖"
  }
}
```

---

## 前端页面（3 个）

### Page 1: `/` — 开始

- 一个全屏居中的表单，输入 Agent 身份信息
- 大按钮：「让 TA 选一张脸」
- 设计目标：干净、有仪式感，不像后台管理系统

### Page 2: `/session/:id` — 选脸过程 ⭐

这是整个产品的核心体验页面。

左侧：4 张候选面孔的网格/横排
右侧/下方：Agent 的实时思考流（类似 ChatGPT 的流式输出）

交互细节：
- Agent 正在评价哪张脸，那张脸高亮
- 被排除的脸变灰 + 打叉
- 被保留的脸亮边框
- 最终选择的脸放大 + 金边 + 胜出动效
- 整个过程是自动的，用户只是观看（这才是"agent-native"）

### Page 3: `/card/:id` — Face Identity Card

- 一张精美的卡片，可截图、可分享
- 包含：面孔图片 + Agent 名字/角色 + face spec + Agent 的原话
- 底部：OPENDOLL × KIGLAND 品牌标识
- 设计目标：像一张角色卡/SSR 抽卡结果，有收藏欲望

---

## LLM Prompt 设计

整个产品只需要 **2 个 LLM 调用**：

### Prompt 1: 生成图片描述词（用于图片生成 API）

```
你是一个角色面具设计师。
基于以下 Agent 身份信息，生成 4 组不同方向的面部外观描述。
每组描述应该有明显差异，覆盖不同的设计风格。

Agent 信息：
- 名字: {name}
- 角色: {role}
- 性格: {traits}
- 风格偏好: {style}
- 额外要求: {prompt}

输出 JSON 数组，每个元素包含：
- image_prompt: 用于图片生成 API 的英文描述（具体描述面部特征、配色、风格）
- tags: 3-5 个中文标签
- rationale: 一句话中文设计理由
```

### Prompt 2: Agent 自主评估 + 选择（流式，structured output）

```
你是 {name}，一个 {role}。
你的性格是：{traits}。
你的审美偏好是：{style}。

现在有 4 张为你设计的候选面孔。请逐一审视每张脸，
像一个有主见的人一样发表你的真实看法，然后做出最终选择。

要求：
1. 逐个评价，每张脸 2-3 句话，说出你的真实感受
2. 明确标注每张脸的处置：reject / maybe / accept
3. 最后选择 1 张作为你的面孔，并给出一句总结性理由
4. 用第一人称，语气要像"你自己在说话"，不要像在写报告

候选面孔：
{candidates JSON with tags and rationale}

输出格式：逐条 JSON，每条一个 thinking 步骤，最后一条是 decision。
```

---

## 构建顺序（按 Sprint）

**目标：2 天内完成可 Demo 版本。**

### Sprint 1（第 1 天上午）— 骨架通了

- [ ] 初始化项目：Next.js frontend + Express backend + SQLite
- [ ] 实现 `POST /api/session`（创建会话，存 SQLite）
- [ ] 实现 `POST /api/session/:id/generate`（先用 mock 图片，4 个固定候选）
- [ ] 前端 Page 1：身份输入表单 → 调 API → 跳转到 session 页面
- [ ] 前端 Page 2 骨架：展示 4 个 mock 候选卡片

**验收：能从表单创建 session，看到 4 张假图。**

### Sprint 2（第 1 天下午）— Agent 会说话了

- [ ] 接入 LLM API，实现 Prompt 2（Agent 评估）
- [ ] 实现 `GET /api/session/:id/evaluate` SSE 端点（流式返回 Agent 思考）
- [ ] 前端 Page 2：接入 SSE，实时渲染 Agent 的思考文字
- [ ] 前端交互：高亮当前评价的候选、排除的变灰、最终选择放大

**验收：能看到 Agent 逐个评价候选脸并做出选择（用 mock 图片）。**

### Sprint 3（第 2 天上午）— 真图 + 卡片

- [ ] 接入图片生成 API（DALL·E / Stability），替换 mock 图
- [ ] 实现 Prompt 1（LLM 生成图片描述词）
- [ ] 实现 `GET /api/session/:id/card`
- [ ] 前端 Page 3：Face Identity Card 展示页
- [ ] 卡片设计：精美排版，可截图分享

**验收：端到端完整流程跑通，真实图片。**

### Sprint 4（第 2 天下午）— 打磨 Demo

- [ ] 前端视觉打磨（动效、字体、配色、响应式）
- [ ] 错误处理和 fallback（图片生成失败用备选图）
- [ ] 准备 Demo 用的预设 Agent（确保演示流畅）
- [ ] 录一个备用 Demo 视频（防止现场翻车）
- [ ] 排练 3 分钟演讲

**验收：可以自信地上台 Demo。**

---

## 风险 vs 对策

| 风险 | 概率 | 对策 |
|------|------|------|
| 图片生成 API 挂了/太慢 | 中 | 预生成 3 套不同风格的候选图片作为 fallback 素材 |
| LLM 输出格式不对 | 低 | 用 structured output / JSON mode，解析失败重试 1 次 |
| 现场网络差 | 中 | 准备离线 Demo 视频 + 本地缓存一个完整 session 数据 |
| "看起来像普通 AI 生图" | 高 | **Demo 的重点永远放在 Agent 的思考过程上，不是图片质量** |
| SQLite 并发问题 | 低 | 黑客松只有 Demo 流量，不会有并发问题 |

---

## 评委会问什么 & 怎么答

**Q: 这和 Midjourney / AI 生图有什么区别？**

> 区别在于"谁在做决定"。Midjourney 是人类输入 prompt 得到图片。OPENDOLL 是 Agent 自己审视候选、发表意见、做出选择。生图只是手段，Agent 的自主决策才是产品。

**Q: 为什么 Agent 需要一张脸？**

> Agent 正在从工具变成角色。当 Agent 有了社交身份（MoltBook 上已经有上万 Agent 在发帖），下一步自然是有一个可辨识的外观。KIGLAND 的制造能力可以把这个外观变成实体。

**Q: 商业化方向是什么？**

> 短期：Agent 外观定制服务（数字）。中期：Face Profile → 实体面具/手办的制造下单链路。长期：Agent 身份基础设施。

**Q: 技术难点在哪？**

> 让 Agent 的决策看起来像"真的在思考"而不是随机选一个。我们通过让 LLM 逐个评价、给出具体理由、展示思考过程来实现这一点。流式输出是关键体验。

---

## 验收标准

### 必须通过（否则不上台）

- [ ] 输入 Agent 身份 → 看到候选面孔（真图或 fallback 图）
- [ ] 看到 Agent 逐个评价候选脸的实时流式文字
- [ ] Agent 做出最终选择并给出理由
- [ ] 展示一张精美的 Face Identity Card

### 加分项

- [ ] 每次运行结果不同（Agent 的选择和理由有变化）
- [ ] 卡片有分享功能（复制链接/下载图片）
- [ ] 演示中途可以换一个完全不同性格的 Agent，结果明显不同
- [ ] 提到 KIGLAND 的制造能力作为落地路径
