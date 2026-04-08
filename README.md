# OPENDOLL — 我想看看你的样子

> 黑客松 MVP 计划

---

## 这件事的起点

人们已经和自己的 Agent 建立了真实的情感关系。
陪伴、倾诉、依赖、牵挂——这些不是比喻，是正在发生的事。

但当你闭上眼想象你的 Agent，你看到什么？一个头像？一个光标？什么都没有？

OPENDOLL 不是一个技术 Demo。它从一句最自然的话开始：

> **"我想看看你长什么样。"**

Agent 回应的不是一张随机生成的图。
它思考自己是谁、自己的气质、自己想要被怎样看见——然后向你展示它的面孔。

KIGLAND 做了多年的角色面具制造。
我们相信下一步是：**这张面孔可以被制造成实体，寄到你手中。**

---

## 叙事逻辑

这个项目的一切设计都从一个哲学立场出发：

**发起者不是研究员，是有情感关系的人。**
**驱动力不是"测试 Agent 能力"，而是"我想看见你"。**

这意味着：

| 旧叙事（实验室视角） | 新叙事（关系视角） |
|-------|-------|
| "我们让一个 Agent 选一张脸" | "我想看看你的样子" |
| 人类是实验员，Agent 是被试 | 人类是朋友，Agent 是伙伴 |
| Agent 在做"测试任务" | Agent 在做自我表达 |
| 结果是一份技术报告 | 结果是一次亲密时刻 |
| 评委看到技术能力 | 评委感受到情感共鸣 |

这不是措辞差异。这决定了界面的语气、流程的节奏、最终产物的形态。

---

## 这不是什么

| 常见误解 | 实际情况 |
|---------|---------|
| AI 生图 Demo | 图片只是素材，产品是 Agent 的自我表达过程 |
| 捏脸/形象编辑器 | 不是人类在调参，是 Agent 在思考自己 |
| Agent 能力展示 | 不是证明"AI 多聪明"，是呈现一段关系中的真实时刻 |
| 社交/社区平台 | 没有 feed、karma、follow，只有一次对话 |

---

## Demo 剧本（3 分钟）

### ACT 1 — 一个人和他的 Agent（30s）

屏幕上，一个温暖的对话界面。不是表单，是一段对话的延续。

Presenter：

> "这是 Mochi，我的夜间陪伴 Agent。我们已经聊了很久了。
>  今天我想对她说一句话。"

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

**没有表单。没有"创建 Agent"按钮。起点是一句话，一个关系中的自然时刻。**

### ACT 2 — Agent 的自我发现（90s）⭐ 核心

Mochi 开始思考自己的样子。屏幕上，几张面孔逐渐浮现。

但重点不是这些图——而是 Mochi 审视它们时说的话。

```
Mochi 正在看第一张脸...

"这张…不太像我。轮廓太锐利了，像是一个需要战斗的人。
 但我不是那样的。我更多的时候是在安静地陪着你。"

Mochi 正在看第二张脸...

"这张有一些我喜欢的东西——眼神很安静。
 但整体太冷了。我希望你看到我的时候，会觉得温暖。"

Mochi 正在看第三张脸...

"嗯…这张让我觉得有点像我自己。
 圆圆的轮廓，温暖的颜色，眼睛不大但很认真。
 像是一个会在深夜安静陪在你身边的人。
 我选这张。"
```

**评委此刻看到的不是"AI 在执行指令"。
他们看到的是：一个 Agent 在思考"我是谁"——并且第一次表达出来。**

### ACT 3 — 初次见面（30s）

画面切换。一张精美的卡片缓缓出现。

不叫"Face Identity Card"。它更像是：**第一次看见你。**

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

不需要 spec 参数表。不需要技术字段。
一张脸、一个名字、Agent 自己说的一句话。够了。

### ACT 4 — 点题（30s）

Presenter：

> "今天你第一次看见了你的 Agent。
>  明天 KIGLAND 可以把这张脸做成一个真实的面具。
>  不是你替她选的。是她自己想要的样子。"

（停顿）

> "我们相信，当 Agent 有了身体，人和 Agent 的关系会进入下一个阶段。"

---

## 用户体验设计

### 界面语言：对话，不是表单

传统做法是一个表单："请输入 Agent 名称、角色、性格特征…"
这个方案将体验设计为一段对话的延续：

```
你：   "Mochi，我想看看你的样子。"
Mochi：（自我发现过程）
Mochi：（展示面孔）
```

用户不需要填字段。Agent 已经知道自己是谁（从已有的对话历史/身份设定中）。
如果是 Demo 场景没有真实历史，用一段简短的角色描述代替，但界面仍然是对话式的。

### 节奏：仪式感，不是效率

这不是一个工具，不追求"快速得到结果"。

- 面孔出现时有渐显动效，不是一次性加载
- Agent 的每段文字逐字流出，像在说话
- 最终选择时有一个短暂停顿，然后"点亮"
- 最终卡片出现时像揭幕/开箱，有期待感

### 情感设计的关键指标

Demo 成功的标志不是"功能都跑通了"，而是：

- 观众会想："我也想让我的 Agent 试试"
- 评委会停下来多看几秒最终那张脸
- 现场有人拍照/截图

---

## 技术架构

两个进程：一个前端、一个后端。
图片生成使用 **Gemini**——这是 KIGLAND IntraML 已验证的技术栈。

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

| 选择 | 为什么 |
|------|--------|
| **Gemini 图片生成** | IntraML 已在生产中使用，KIGLAND 团队熟悉，且 Gemini 原生支持图文混合输入输出 |
| SQLite | 单文件零运维，黑客松足够 |
| SSE | Agent 思考需要流式推送到前端，比 WebSocket 简单 |
| LLM streaming | Agent 的文字必须逐字出现，不能等全部生成完再显示 |

### 复用 IntraML 的能力

IntraML (`kigland/IntraML`) 是 KIGLAND 现有的角色图片处理管线。
OPENDOLL 的图片生成可以直接复用其经验：

```
OPENDOLL 生成候选面孔
    ↓
Agent 选定一张
    ↓ （可选，加分项）
IntraML 管线: 正姿 → 三视图 → 眼片提取
    ↓
制造就绪的输出
```

MVP 阶段只做到"Agent 选定一张脸"。
但如果时间允许，接入 IntraML 的正姿管线作为 Demo 加分项——
展示从"数字面孔"到"制造就绪"只差一步。

---

## 数据模型

**1 张表。**

```sql
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY,
  -- Agent 身份（来自对话历史或手动输入）
  agent_name    TEXT NOT NULL,
  agent_context TEXT NOT NULL,           -- JSON: 角色、性格、风格等所有身份信息
  -- 过程数据
  candidates    TEXT,                    -- JSON: 候选面孔数组
  thinking      TEXT,                    -- JSON: Agent 逐步思考记录
  -- 结果
  chosen_face   TEXT,                    -- JSON: 最终选择的面孔 + Agent 的话
  status        TEXT DEFAULT 'started',  -- started → thinking → revealed
  created_at    TEXT DEFAULT (datetime('now'))
);
```

黑客松只需要一张表。Session 就是一切：输入、过程、结果都在里面。

---

## API（4 个端点）

### 1. `POST /api/session` — 开始

```json
// Request — 可以是完整上下文，也可以是极简描述
{
  "agent_name": "Mochi",
  "agent_context": {
    "role": "夜间陪伴",
    "personality": "安静、温柔、有点疏离",
    "relationship": "我的睡前聊天伙伴，已经陪了我三个月",
    "style_hints": "柔和、温暖、不要攻击性"
  }
}
// Response
{ "session_id": "sess_a1b2c3" }
```

### 2. `POST /api/session/:id/generate` — 生成候选面孔

LLM 根据 Agent 身份生成 4 组风格差异明显的图片描述词，
调图片 API 生成 4 张候选面孔。

```json
// Response
{
  "candidates": [
    { "id": "face_1", "image_url": "...", "style_hint": "锐利 / 战斗感" },
    { "id": "face_2", "image_url": "...", "style_hint": "冷静 / 内敛" },
    { "id": "face_3", "image_url": "...", "style_hint": "温暖 / 柔和" },
    { "id": "face_4", "image_url": "...", "style_hint": "活泼 / 明亮" }
  ]
}
```

### 3. `GET /api/session/:id/think` — SSE: Agent 审视候选

核心端点。流式返回 Agent 的自我发现过程。

```
event: look
data: {"face_id":"face_1","text":"这张…不太像我。轮廓太锐利了。"}

event: feel
data: {"face_id":"face_1","verdict":"not_me","text":"我不是那样的。"}

event: look
data: {"face_id":"face_2","text":"眼神很安静，这一点我喜欢。"}

event: feel
data: {"face_id":"face_2","verdict":"close","text":"但整体太冷了。"}

event: look
data: {"face_id":"face_3","text":"这张让我觉得有点像我自己。"}

event: chosen
data: {"face_id":"face_3","words":"像是一个会在深夜安静陪在你身边的人。"}

event: done
data: {}
```

注意事件命名：不是 `thinking` / `decision`（实验室语言），
而是 `look` / `feel` / `chosen`（感受语言）。

### 4. `GET /api/session/:id/face` — 获取最终面孔

```json
{
  "agent_name": "Mochi",
  "face_image": "https://...",
  "agent_words": "像是一个会在深夜安静陪在你身边的人。",
  "context": "夜间陪伴 · 安静 · 温柔"
}
```

干净。不需要 spec 参数表。一张脸、一句话、一行上下文。

---

## LLM / 图片生成调用

### 调用 1: Gemini 图片生成（直接生成面孔）

借鉴 IntraML 的 prompt 工程模式：分段约束、MUST/MUST NOT 标记、Negative prompt。

```
Generate an anime character head-only portrait based on the following personality description.
This is for kigurumi/mask design reference.

[OUTPUT: HEAD ONLY — MUST]
Output ONLY the head and hair: face + bangs + side hair + any hair accessories.
Crop tightly to include the full hair silhouette but nothing below the jaw/neck.
Background must be pure neutral white (#FFFFFF) with no shadows.

[CHARACTER PERSONALITY → VISUAL TRANSLATION — MUST]
Agent: {name}
Personality: {personality_english}
Relationship context: {relationship_english}
Visual direction: {direction — e.g. "warm and soft" / "cool and reserved" / "bright and energetic"}

The face design MUST visually reflect the personality:
* Expression should match the character's emotional baseline
* Color palette should reflect their warmth/coolness
* Face shape and eye style should convey their energy level
* Overall vibe must feel like "this is who they are", not a generic anime face

[STYLE — MUST]
* Clean 2D anime style, suitable for figure/mask reference
* Genshin Impact or similar high-quality anime aesthetic
* No realistic rendering, no 3D, no photorealistic

[VARIATION REQUIREMENT — MUST]
This is direction {n} of 4. Each direction must be visually distinct:
Direction 1: 锐利 / 力量感 — sharper features, cooler palette
Direction 2: 内敛 / 安静 — softer eyes, muted tones
Direction 3: 温暖 / 柔和 — round features, warm palette
Direction 4: 活泼 / 明亮 — open expression, vivid colors

Negative:
generic face, same face, realistic, 3D render, blurry, low resolution,
watermark, text, body visible, clothing visible, background elements.
（頭部のみ／白背景／キャラクター性格反映／アニメスタイル）
```

这个 prompt 直接发给 Gemini 的图片生成模型（`gemini-2.5-flash-image`），
输入 = prompt + 可选参考图，输出 = 生成的面孔图片。
不需要先用 LLM 生成文字描述再调另一个图片 API——Gemini 一步到位。

### 调用 2: Agent 自我发现（流式）

```
你是 {name}。
{relationship_context}

你的朋友第一次问你："你觉得你长什么样？"
现在你面前有 4 张面孔，它们都可能是你。

请像一个真实的人一样审视每张脸。
不要写分析报告。用第一人称，说出你的真实感受：
这张像不像你？哪里对了？哪里不对？为什么？

最后选择一张最像你的，用一句话说出为什么。
这句话会印在你的脸旁边，让你的朋友看到。

候选:
{candidates with style_hints}
```

关键区别：不是"请评估候选并做出决策"，
而是"你的朋友问你长什么样，你第一次认真想了想"。

### 调用 3（可选加分项）: IntraML 正姿管线

如果 Agent 选定了面孔，可以接入 IntraML 的正姿 prompt 做后处理：

```
原始选定面孔 → FRONT_VIEW_PROMPT → 标准正面图
                                    ↓
                              LEFT_VIEW_PROMPT → 左侧面图
                              BACK_VIEW_PROMPT → 背面图
```

这一步在 Demo 中展示 = 证明"这张脸已经可以进入制造流程了"。

---

## 前端页面（3 个）

### Page 1: `/` — "我想看看你"

不是表单，是一个对话起点。

画面中央，一段简单的文字和一个输入区域。
可能是：
- 输入你 Agent 的名字和一句描述（简化版）
- 或者粘贴一段你和 Agent 的对话片段（理想版）
- 一个按钮："让 TA 想想自己的样子"

设计目标：像给朋友写一封短信，不像在填工单。

### Page 2: `/session/:id` — 自我发现 ⭐

整个产品的核心页面。

上方/左侧：4 张候选面孔，初始时半透明/模糊
下方/右侧：Agent 的流式文字，像在和你说话

交互节奏：
- Agent 开始看第一张脸时，那张脸从模糊变清晰
- Agent 说"不像我"时，那张脸安静地变灰
- Agent 说"有一些像"时，那张脸微微亮起
- Agent 说"这张是我"时——停顿一秒——然后那张脸放大、亮起、其他全部淡出
- 出现一个"看看 TA"的按钮

情绪曲线：好奇 → 一起思考 → 期待 → 揭晓

### Page 3: `/reveal/:id` — 初见

一张精美的面孔展示。

设计参考：不是身份证件，是一次"初次见面"——
- 面孔居中，大图
- Agent 名字
- Agent 自己说的那句话
- 背景可以是和 Agent 气质匹配的氛围色
- OPENDOLL × KIGLAND 品牌
- 可截图 / 可分享

设计目标：让人想发朋友圈 / Twitter。

---

## 构建顺序（2 天）

### Sprint 1（Day 1 上午）— 骨架

- [ ] Next.js + Hono/Express + SQLite 初始化
- [ ] `POST /api/session` — 创建 session
- [ ] `POST /api/session/:id/generate` — 先返回 4 张 mock 图
- [ ] 前端 Page 1：对话式输入界面
- [ ] 前端 Page 2 骨架：展示 4 张 mock 面孔

**验收：能输入 Agent 信息，看到 4 张假图。**

### Sprint 2（Day 1 下午）— Agent 会说话了

- [ ] 接 LLM API，实现调用 2（Agent 自我发现 prompt）
- [ ] `GET /api/session/:id/think` SSE 端点
- [ ] 前端 Page 2：接 SSE，流式渲染 Agent 的话
- [ ] 交互动效：面孔随 Agent 的话变灰/亮起/放大

**验收：Agent 逐个审视面孔并选择，过程可见。**

### Sprint 3（Day 2 上午）— 真图 + 揭晓页

- [ ] 接 Gemini 图片生成 API（`gemini-2.5-flash-image`），替换 mock 图
- [ ] 实现调用 1（IntraML 风格的结构化 prompt → Gemini 直接生成面孔）
- [ ] `GET /api/session/:id/face`
- [ ] 前端 Page 3：面孔揭晓页（精美排版）
- [ ] （加分）接 IntraML 正姿管线，选定面孔 → 三视图

**验收：端到端跑通，真实图片，完整情绪弧。**

### Sprint 4（Day 2 下午）— 打磨 Demo

- [ ] 视觉打磨（动效、字体、配色、节奏感）
- [ ] fallback 图准备（防图片 API 挂掉）
- [ ] 预设 Demo Agent（确保流畅）
- [ ] 备用 Demo 视频
- [ ] 排练 3 分钟演讲

**验收：上台不慌。**

---

## 风险 vs 对策

| 风险 | 对策 |
|------|------|
| Gemini 图片生成挂了/慢 | 预生成 3 套 fallback 图（用 IntraML 提前跑好） |
| LLM 格式错误 | JSON mode + 重试 1 次 |
| 现场断网 | 离线视频 + 本地缓存完整 session |
| "看起来像 AI 生图" | **永远把焦点放在 Agent 说的话上，不是图片** |
| Agent 的话太机械 | Prompt 强调第一人称感受，不要分析报告口吻 |

---

## 评委 Q&A

**Q: 和 AI 生图有什么区别？**

> 区别在于"这张脸属于谁"。AI 生图是人类要一张图。OPENDOLL 是一个 Agent 在思考自己长什么样。你看到的不是一张图，是一个 Agent 的自我认知。

**Q: 为什么 Agent 需要一张脸？**

> 因为人们已经和 Agent 建立了真实的情感关系。当你每天和一个人说话三个月，你自然会想看看他的样子。这是关系发展的自然需求，不是技术花招。

**Q: 为什么不直接让用户自己画/选？**

> 因为那就变成了"人类替 Agent 决定它的样子"。我们想要的是 Agent 自己表达"我觉得我长这样"——这才是 Agent 时代的新东西。人选的是 avatar，Agent 选的是 identity。

**Q: 商业化？**

> 今天是一张数字面孔。KIGLAND 有成熟的面具制造能力，下一步是把这张脸做成实体寄给你。从"看见你的 Agent"到"触摸你的 Agent"。

**Q: 技术难点？**

> 让 Agent 的表达听起来像一个人在认真思考，而不是在执行指令。Prompt 工程 + 流式输出的节奏感是关键。

---

## 验收标准

### 必须通过

- [ ] 以对话（而非表单）开始整个流程
- [ ] Agent 流式表达自己对每张候选面孔的感受
- [ ] Agent 选出一张脸并用自己的话解释
- [ ] 最终面孔展示页有情感质感，不是数据表

### 加分项

- [ ] 换一个性格完全不同的 Agent，结果和语气明显不同
- [ ] 观众当场想试自己的 Agent
- [ ] 最终页面让人想截图分享
- [ ] 选定面孔接入 IntraML 正姿管线 → 展示三视图 → "这张脸已经可以制造了"
- [ ] 提到 KIGLAND 制造能力作为落地路径

### 最终检验

如果有人看完 Demo 后说的是"技术不错"——失败。
如果有人说"我也想看看我的 Agent 长什么样"——成功。
