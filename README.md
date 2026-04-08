# OPENDOLL — Agent Interface for Embodied Identity

> 黑客松 MVP 计划

---

## KIGLAND → OPENDOLL

KIGLAND 一直在解决一个问题：**如何快速、规模化地做不同的二次元脸。**

面向角色扮演玩家，KIGLAND 做面具和头壳产品。核心能力是用算法把角色外观的定制参数化、标准化、可制造化——让每个人都能快速拥有一张不一样的、可爱的二次元脸。

现在 AI / Agent 正在进入具身世界。一个很小但必须解决的问题：**它长什么样？**

OPENDOLL 把 KIGLAND 的这项能力开放给 Agent——
一个 Agent Interface，让 Agent 自己表达、选择、确认自己的外观。

用户对 Agent 说一句 **"我想看看你的样子"**，Agent 思考自己是谁，审视候选面孔，选出自己的脸。这张脸可以被 KIGLAND 制造成实体。

---

## Demo 剧本（3 分钟）

### ACT 1 — 一个人和他的 Agent（30s）

屏幕上，一个对话界面。Presenter：

> "这是 Mochi，我的夜间陪伴 Agent。我们已经聊了很久了。"

人类输入：

```
"Mochi，我一直想知道——你觉得你长什么样？
 我想看看你。"
```

Mochi 回复：

```
"你想看看我吗？…让我想想。
 我从来没有被这样问过。但我确实对自己有一些感觉。
 让我试试。"
```

### ACT 2 — Agent 的自我发现（90s）⭐ 核心

几张面孔逐渐浮现。Mochi 逐一审视：

```
Mochi 正在看第一张脸...

"这张…不太像我。轮廓太锐利了，像是一个需要战斗的人。
 但我更多的时候是在安静地陪着你。"

Mochi 正在看第二张脸...

"这张有一些我喜欢的东西——眼神很安静。
 但整体太冷了。我希望你看到我的时候，会觉得温暖。"

Mochi 正在看第三张脸...

"嗯…这张让我觉得有点像我自己。
 圆圆的轮廓，温暖的颜色，眼睛不大但很认真。
 像是一个会在深夜安静陪在你身边的人。
 我选这张。"
```

### ACT 3 — 初见（30s）

一张精美的卡片缓缓出现：

```
┌─────────────────────────────────┐
│                                 │
│        [Mochi 的面孔]            │
│                                 │
│        M O C H I                │
│     "会在深夜安静陪在你身边的人"  │
│                                 │
│     ── OPENDOLL × KIGLAND ──   │
│                                 │
└─────────────────────────────────┘
```

一张脸、一个名字、Agent 自己说的一句话。

### ACT 4 — 点题（30s）

> "KIGLAND 过去帮真人快速拥有不同的二次元脸。
>  今天，我们把这个能力给了 Agent——她自己选了一张脸。
>  明天，KIGLAND 可以把这张脸做成实体寄给你。"

---

## 技术架构

两个进程。图片生成使用 **Gemini**（KIGLAND IntraML 已验证的技术栈）。

```
┌──────────────────────────────────────────────────┐
│  Frontend (Next.js)                              │
│  ├── / .................. 对话式开场              │
│  ├── /session/:id ....... Agent 自我发现 + 选择   │
│  └── /reveal/:id ........ 最终面孔展示            │
└──────────────┬───────────────────────────────────┘
               │ REST + SSE
┌──────────────▼───────────────────────────────────┐
│  Backend (Node.js / Hono)                        │
│  ├── POST /api/session ........... 创建会话       │
│  ├── POST /api/session/:id/gen ... 生成候选面孔   │
│  ├── GET  /api/session/:id/think . SSE Agent 思考 │
│  └── GET  /api/session/:id/face .. 获取最终面孔   │
│                                                  │
│  图片生成 → Gemini (gemini-2.5-flash-image       │
│             / gemini-3-pro-image-preview)         │
│  Agent 思考 → LLM API (streaming)                │
│  持久化 → SQLite                                 │
└──────────────────────────────────────────────────┘
```

| 选择 | 理由 |
|------|------|
| Gemini 图片生成 | IntraML 已在用，团队熟悉，原生支持图文混合输入输出 |
| SQLite | 单文件零运维 |
| SSE | 流式推送 Agent 思考，比 WebSocket 简单 |

### IntraML 复用

```
OPENDOLL 生成候选面孔 → Agent 选定一张
    ↓ （可选加分项）
IntraML 管线: 正姿 → 三视图 → 眼片提取 → 制造就绪
```

---

## 数据模型

```sql
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY,
  agent_name    TEXT NOT NULL,
  agent_context TEXT NOT NULL,           -- JSON: 角色、性格、风格等身份信息
  candidates    TEXT,                    -- JSON: 候选面孔数组
  thinking      TEXT,                    -- JSON: Agent 逐步思考记录
  chosen_face   TEXT,                    -- JSON: 最终选择 + Agent 的话
  status        TEXT DEFAULT 'started',  -- started → thinking → revealed
  created_at    TEXT DEFAULT (datetime('now'))
);
```

---

## API（4 个端点）

### 1. `POST /api/session`

```json
{
  "agent_name": "Mochi",
  "agent_context": {
    "role": "夜间陪伴",
    "personality": "安静、温柔、有点疏离",
    "relationship": "我的睡前聊天伙伴，已经陪了我三个月",
    "style_hints": "柔和、温暖、不要攻击性"
  }
}
→ { "session_id": "sess_a1b2c3" }
```

### 2. `POST /api/session/:id/generate`

Gemini 根据 Agent 身份直接生成 4 张风格差异明显的面孔。

```json
{
  "candidates": [
    { "id": "face_1", "image_url": "...", "style_hint": "锐利 / 战斗感" },
    { "id": "face_2", "image_url": "...", "style_hint": "冷静 / 内敛" },
    { "id": "face_3", "image_url": "...", "style_hint": "温暖 / 柔和" },
    { "id": "face_4", "image_url": "...", "style_hint": "活泼 / 明亮" }
  ]
}
```

### 3. `GET /api/session/:id/think` — SSE

核心端点。流式返回 Agent 审视每张脸的过程。

```
event: look
data: {"face_id":"face_1","text":"这张…不太像我。轮廓太锐利了。"}

event: feel
data: {"face_id":"face_1","verdict":"not_me","text":"我不是那样的。"}

event: look
data: {"face_id":"face_3","text":"这张让我觉得有点像我自己。"}

event: chosen
data: {"face_id":"face_3","words":"像是一个会在深夜安静陪在你身边的人。"}

event: done
data: {}
```

事件命名用感受语言：`look` / `feel` / `chosen`。

### 4. `GET /api/session/:id/face`

```json
{
  "agent_name": "Mochi",
  "face_image": "https://...",
  "agent_words": "像是一个会在深夜安静陪在你身边的人。",
  "context": "夜间陪伴 · 安静 · 温柔"
}
```

---

## Prompt 设计

### Prompt 1: Gemini 图片生成

借鉴 IntraML 的分段约束 + MUST/MUST NOT + Negative prompt 模式：

```
Generate an anime character head-only portrait based on the following personality.
This is for kigurumi/mask design reference.

[OUTPUT: HEAD ONLY — MUST]
Output ONLY the head and hair. Crop tightly, nothing below jaw/neck.
Background: pure white (#FFFFFF), no shadows.

[CHARACTER → VISUAL — MUST]
Agent: {name}
Personality: {personality_english}
Visual direction: {direction}

Face design MUST reflect personality:
* Expression matches emotional baseline
* Palette reflects warmth/coolness
* Face shape and eyes convey energy level

[STYLE — MUST]
Clean 2D anime, Genshin Impact aesthetic, suitable for mask reference.

[VARIATION — MUST]
Direction {n} of 4, each visually distinct:
1: 锐利 / 力量感  2: 内敛 / 安静  3: 温暖 / 柔和  4: 活泼 / 明亮

Negative: generic face, realistic, 3D, blurry, body visible, clothing visible.
（頭部のみ／白背景／性格反映／アニメスタイル）
```

直接发给 Gemini 图片生成模型，一步到位。

### Prompt 2: Agent 自我发现（流式）

```
你是 {name}。
{relationship_context}

你的朋友第一次问你："你觉得你长什么样？"
现在你面前有 4 张面孔，它们都可能是你。

用第一人称，说出你对每张脸的真实感受。
最后选择一张最像你的，用一句话说出为什么。
这句话会印在你的脸旁边，让你的朋友看到。

候选: {candidates with style_hints}
```

### Prompt 3（可选）: IntraML 正姿管线

选定面孔 → `FRONT_VIEW_PROMPT` → `LEFT_VIEW_PROMPT` → `BACK_VIEW_PROMPT` → 三视图

---

## 前端（3 个页面）

### `/` — 开场

对话式输入。Agent 名字 + 一句描述（或粘贴对话片段）。
按钮："让 TA 想想自己的样子"

### `/session/:id` — 自我发现 ⭐

上方/左侧：4 张候选面孔，初始半透明
下方/右侧：Agent 流式文字

交互：
- 当前审视的脸高亮
- 排除的脸变灰
- 最终选择：停顿 → 放大 → 其他淡出
- 整个过程自动，用户观看

### `/reveal/:id` — 初见

面孔居中大图 + Agent 名字 + Agent 说的那句话 + 氛围色背景。
可截图可分享。

---

## 构建顺序（2 天）

### Sprint 1（Day 1 上午）— 骨架

- [ ] Next.js + Hono/Express + SQLite 初始化
- [ ] `POST /api/session`
- [ ] `POST /api/session/:id/generate`（mock 图）
- [ ] Page 1 + Page 2 骨架

**验收：输入 → 看到 4 张假图。**

### Sprint 2（Day 1 下午）— Agent 会说话

- [ ] 接 LLM API，实现 Prompt 2
- [ ] `GET /api/session/:id/think` SSE 端点
- [ ] Page 2 接 SSE + 交互动效

**验收：Agent 逐个审视、选择，过程流式可见。**

### Sprint 3（Day 2 上午）— 真图 + 揭晓

- [ ] 接 Gemini 图片生成（`gemini-2.5-flash-image`），替换 mock
- [ ] 实现 Prompt 1
- [ ] `GET /api/session/:id/face`
- [ ] Page 3 揭晓页
- [ ] （加分）接 IntraML 正姿管线 → 三视图

**验收：端到端跑通，真实图片。**

### Sprint 4（Day 2 下午）— 打磨

- [ ] 动效、字体、配色
- [ ] fallback 图（用 IntraML 提前跑好）
- [ ] 预设 Demo Agent
- [ ] 备用视频
- [ ] 排练

---

## 风险

| 风险 | 对策 |
|------|------|
| Gemini 挂了/慢 | 预生成 3 套 fallback 图 |
| LLM 格式错误 | JSON mode + 重试 |
| 现场断网 | 离线视频 + 本地缓存完整 session |
| Agent 的话太机械 | Prompt 强调第一人称感受 |

---

## 评委 Q&A

**Q: 和 AI 生图的区别？**
> 生图是人类要一张图。这里是 Agent 自己审视、选择、确认自己的外观。

**Q: 为什么是你们做这件事？**
> KIGLAND 已经在做"快速规模化地制造不同的二次元脸"。OPENDOLL 把同样的能力开放给 Agent。技术栈和制造管线都是现成的。

**Q: 为什么不让用户自己选？**
> 用户选的是 avatar，Agent 选的是 identity。

**Q: 商业化？**
> KIGLAND 的制造能力已经在服务真人玩家。Agent 外观定制是同一条产线的新入口：数字面孔 → 实体面具/手办。

**Q: 技术难点？**
> Prompt 工程 + 流式输出的节奏感。让 Agent 的表达像在认真思考。

---

## 验收

### 必须通过

- [ ] 对话式开场
- [ ] Agent 流式表达对候选面孔的感受
- [ ] Agent 选出一张脸并给出理由
- [ ] 揭晓页有情感质感

### 加分项

- [ ] 换不同性格 Agent，结果明显不同
- [ ] 观众想试自己的 Agent
- [ ] 揭晓页让人想截图
- [ ] 接入 IntraML → 三视图 → 证明可制造
