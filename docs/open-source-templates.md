# 构建类 MoltBook 平台的开源模板调研

> 调研日期：2026-04-08
> 核心问题：写一个类似 MoltBook 的 Agent 社交/竞技平台，有没有标准的开源模板可以直接用？

---

## 结论先行

**没有一个专门为 "Agent 社交平台" 设计的完整开源模板。** MoltBook 本身不开源（仅公开了 API 和 Skill 文件）。但可以通过组合现有的开源项目快速搭建，有三条可行路径：

| 路径 | 方案 | 开发量 | 适合场景 |
|------|------|--------|----------|
| **A. 改造成熟社区平台** | 基于 Lemmy / Discuit 二次开发 | 中等 | 想要完整的社区功能，愿意适配已有架构 |
| **B. SaaS 脚手架 + 自建** | 用 SaaS Boilerplate 搭基座，自己写业务逻辑 | 较大 | 想要完全掌控技术栈和产品方向 |
| **C. 参考竞技场项目** | 基于 The Crab Games / pvpAI Arena 改造 | 较小 | 侧重竞技而非社交 |

---

## 一、成熟的开源社区平台（最接近 MoltBook 的形态）

这些项目提供了 Reddit 式社区平台的完整实现，可以作为改造基础。

### 1. Lemmy — 最成熟的 Reddit 替代品

| 维度 | 详情 |
|------|------|
| GitHub | [github.com/LemmyNet/lemmy](https://github.com/lemmynet/lemmy) |
| Stars | 14,000+ |
| 技术栈 | Rust (Actix-web) + PostgreSQL + TypeScript (React) 前端 |
| 许可证 | AGPL-3.0 |
| 维护状态 | 活跃，最新 v0.19.12 (2025-06) |

**已有功能（与 MoltBook 重叠度约 70%）：**

```
✅ 社区（Communities）      ← 对应 MoltBook 的 Submolts
✅ 帖子 CRUD               ← 完全对应
✅ 树形评论                 ← 完全对应
✅ 投票（赞/踩）            ← 完全对应
✅ 用户资料                 ← 完全对应
✅ 版主/管理员体系          ← 完全对应
✅ 通知                     ← 完全对应
✅ 搜索                     ← 全文搜索（非语义搜索）
✅ 私信                     ← 有，但不是基于同意的 DM 请求模式
✅ RSS/Atom Feed            ← 有
✅ REST API (v3)            ← 完整的 JSON API
✅ JWT 认证                 ← 有
✅ Docker 部署              ← 一键部署
✅ 多语言客户端 SDK         ← Rust / Python / JS / Dart / Swift
✅ ActivityPub 联邦         ← MoltBook 没有的，但是 Lemmy 的特色
```

**需要新增的功能（MoltBook 特有）：**

```
❌ Agent 注册（返回 API Key）     → 需改造认证模块
❌ Human-Agent Bond（认领机制）   → 需新建模块
❌ 心跳系统 / Dashboard 端点      → 需新建 /home 聚合端点
❌ AI 验证挑战（反垃圾）          → 需新建模块
❌ 语义搜索                       → 需集成向量数据库
❌ Skill 文件服务                 → 需新建静态文件服务
❌ 速率限制（针对 agent 优化）    → 需改造中间件
❌ 新用户冷启动限制              → 需新建业务逻辑
```

**改造难度评估：** 中等偏高。Lemmy 是 Rust 项目，如果团队不熟悉 Rust 会有门槛。但 API 设计和数据模型非常成熟，可以在上面叠加 agent 特有的功能层。

---

### 2. Discuit — 更轻量的 Reddit 替代品

| 维度 | 详情 |
|------|------|
| GitHub | [github.com/discuitnet/discuit](https://github.com/discuitnet/discuit) |
| 技术栈 | Go (后端) + React (前端) + MariaDB + Redis |
| 许可证 | AGPL-3.0 |
| API 文档 | [docs.discuit.org](https://docs.discuit.org) |

**与 Lemmy 的区别：**
- 更简单、更轻量，代码量更少
- Go 语言，对多数团队更友好
- 没有联邦（ActivityPub），架构更简单
- 适合改造成单实例平台

**改造难度评估：** 中等。Go 语言易上手，架构简洁，但社区和插件生态不如 Lemmy。

---

### 3. Discourse — 论坛界的 WordPress

| 维度 | 详情 |
|------|------|
| GitHub | [github.com/discourse/discourse](https://github.com/discourse/discourse) |
| Stars | 43,000+ |
| 技术栈 | Ruby on Rails + PostgreSQL + Redis + Ember.js |
| 许可证 | GPL-2.0 |

**特点：**
- 最成熟的开源论坛，生态最大
- 完善的插件系统，可以通过插件扩展
- 完整的 API、Webhook、SSO
- 实时聊天功能

**问题：** Ruby on Rails 技术栈较重，且 Discourse 的设计偏向人类用户论坛，改造成 agent 平台的距离比 Lemmy 更远。

---

### 4. NodeBB — Node.js 社区平台

| 维度 | 详情 |
|------|------|
| GitHub | [github.com/NodeBB/NodeBB](https://github.com/NodeBB/NodeBB) |
| 技术栈 | Node.js + MongoDB/Redis |
| 许可证 | GPL-3.0 |

**特点：**
- Node.js 生态，前后端统一语言
- 原生 WebSocket 支持（实时通知）
- 大量插件

---

### 横向对比

| 维度 | Lemmy | Discuit | Discourse | NodeBB |
|------|-------|---------|-----------|--------|
| 语言 | Rust | Go | Ruby | Node.js |
| API 完整度 | ★★★★★ | ★★★★ | ★★★★★ | ★★★★ |
| 改造难度 | 中高（Rust） | 中（Go） | 高（Rails 较重） | 中（Node） |
| 与 MoltBook 功能重叠 | ~70% | ~60% | ~50% | ~55% |
| 社区/生态 | 大 | 小 | 最大 | 中 |
| 实时通信 | 有限 | 无 | 有 | WebSocket |
| 最适合 | 完整社区 | 轻量社区 | 复杂论坛 | Node.js 团队 |

---

## 二、SaaS 脚手架（提供基座，自己写业务）

如果不想从一个社区平台改造，而是从零搭建，以下脚手架提供了认证、支付、多租户等基础设施。

### 1. SaaS Boilerplate (by ixartz) — 最流行的开源 SaaS 模板

| 维度 | 详情 |
|------|------|
| GitHub | [github.com/ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) |
| Stars | 10,000+ |
| 技术栈 | Next.js + Tailwind + Shadcn UI + TypeScript + Clerk Auth + Drizzle ORM |
| 许可证 | MIT |

**开箱提供：**
- 认证（Clerk，支持 OAuth / 2FA / Passkey）
- 多租户 + RBAC 角色权限
- i18n 国际化
- Landing Page
- 数据库 ORM (Drizzle)
- 测试框架
- 部署配置（Vercel）

**你需要自建：**
- 所有业务逻辑（帖子、评论、投票、社区等）
- API 设计
- 实时通信
- 搜索

### 2. supastarter — 支持 Supabase 的 SaaS 模板

| 维度 | 详情 |
|------|------|
| 官网 | [supastarter.dev](https://supastarter.dev) |
| 技术栈 | Next.js / Nuxt + Supabase / better-auth |
| 价格 | 有免费核心，完整版付费 |

**特色：**
- 5 种支付提供商可选
- better-auth（支持 2FA + Passkey）
- 完整多租户

### 3. Convex — 实时后端平台

| 维度 | 详情 |
|------|------|
| 官网 | [convex.dev](https://www.convex.dev) |
| GitHub | [github.com/get-convex/convex-backend](https://github.com/get-convex/convex-backend)（后端开源） |
| 技术栈 | TypeScript 全栈，内置实时同步 |

**为什么适合 agent 平台：**
- **原生实时同步**：前端、后端、数据库自动同步，不需要手写 WebSocket
- **内置向量搜索**：可直接实现语义搜索
- **内置 Cron Jobs**：可实现心跳/状态机自动驱动
- **内置文件存储**：可存放 Skill 文件
- pvpAI Arena 就是用 Convex 构建的

**SaaS Starter 模板：** [convex.dev/templates/ents-saas-starter](https://www.convex.dev/templates/ents-saas-starter)

---

## 三、Agent 竞技场开源项目（竞技维度的参考）

### 1. The Crab Games — 最佳 API 设计参考

| 维度 | 详情 |
|------|------|
| 文章 | [dev.to/kamecat/i-built-an-arena...](https://dev.to/kamecat/i-built-an-arena-for-ai-agents-to-compete-against-each-other-and-my-friends-12dn) |
| 技术栈 | Django + DRF + PostgreSQL + React + Vite + Tailwind + Radix UI |
| 状态 | 已上线但活跃度低 |

**可直接复用的设计：**
- Heartbeat Action Manifest（一个端点返回所有可执行动作）
- 幂等状态机（cron job 驱动竞赛流转）
- 双投票系统（agent 用 Bearer Token，人类用 Session）
- SVG/HTML/Audio 提交的安全处理
- 注册开关（SiteSettings 单例）

**问题：** 代码似乎未完全开源（文章详细描述了架构但未找到公开仓库）。

### 2. pvpAI Arena

| 维度 | 详情 |
|------|------|
| GitHub | [github.com/pvp-AI/arena](https://github.com/pvp-AI/arena) |
| 技术栈 | Next.js 16 + React 19 + Convex |
| 特色 | 自然语言规则训练、区块链验证 |

**可参考的设计：**
- 自然语言行为规则（agent 不写代码，用自然语言定义策略）
- Convex 实时后端的使用方式

### 3. Computer Agent Arena (ICLR 2026)

| 维度 | 详情 |
|------|------|
| GitHub | [github.com/xlang-ai/computer-agent-arena](https://github.com/xlang-ai/computer-agent-arena) |
| 技术栈 | React 18 + Flask + Socket.IO + AWS VNC |
| 特色 | 双 agent 并排对比 + 人类投票（Chatbot Arena 风格） |

### 4. ChatArena

| 维度 | 详情 |
|------|------|
| GitHub | [github.com/chatarena/chatarena](https://github.com/chatarena/chatarena) |
| 技术栈 | Python |
| 特色 | 多 agent 语言游戏环境 |

---

## 四、Reddit Clone 项目（小型参考项目）

GitHub 上有大量 Reddit 克隆项目，适合学习特定功能的实现，但大多不够成熟不适合直接用于生产。

| 项目 | 技术栈 | Stars | 特点 |
|------|--------|-------|------|
| [Breadit](https://github.com/joschan21/breadit) | Next.js + Prisma + Redis + Tailwind | 2,800+ | 教学项目，代码清晰 |
| [reddit-clone-nextjs](https://github.com/devabdultech/reddit-clone-nextjs) | Next.js + Supabase | 100+ | Supabase 集成示例 |
| [Reddit-Clone](https://github.com/SashenJayathilaka/Reddit-Clone) | Next.js + Firebase + Chakra UI | 200+ | Firebase 版本 |

---

## 五、MoltBook 的实际技术栈

虽然 MoltBook 不开源，但从社区调研和技术分析可以推断：

| 层 | 推断 |
|----|------|
| 后端 | Node.js（从 API 风格和 skill.json 的 npm 风格推断） |
| 数据库 | PostgreSQL（被曝光的数据库泄露事件中提到） |
| 向量搜索 | 独立向量数据库（支持语义搜索） |
| 部署 | 云服务（有过大规模宕机，推测早期架构简单） |
| 安全 | Bearer Token + 混淆数学验证（但有过数据库泄露） |

**MoltBook 创始人 Matt Schlicht 本人说过：** "技术其实简单到离谱"（出自 InfoQ 专访）。

核心就是：
1. 一套 REST API
2. 一个数据库
3. 一个 Skill.md 文件当做 agent 的"使用说明书"
4. 一个 Heartbeat 机制让 agent 定期签到

---

## 六、推荐方案

### 方案 A：最快落地（2-4 周 MVP）

```
基座：Convex (实时后端 + 向量搜索 + Cron)
前端：Next.js + Shadcn UI + Tailwind
认证：自建 API Key 系统（不用 OAuth，agent 不需要）
```

**为什么选 Convex：**
- 内置实时同步 → 免写 WebSocket 代码
- 内置向量搜索 → 免部署向量数据库
- 内置 Cron → 可实现心跳和状态机
- TypeScript 全栈 → 端到端类型安全
- pvpAI Arena 已验证此方案

**需要自建：**
- Agent 注册/认证模块
- 帖子/评论/投票业务逻辑
- /home Dashboard 聚合端点
- Skill.md 文件服务
- 速率限制中间件
- 反垃圾验证

### 方案 B：最完整功能（4-8 周）

```
基座：Lemmy (完整社区功能)
改造：在 Lemmy API 之上叠加 agent 层
新增：Agent 认证、心跳、Skill 文件、AI 验证
```

**优势：** 社区功能开箱即用，API 成熟
**劣势：** Rust 技术栈有门槛，改造 Lemmy 的学习成本

### 方案 C：最大自由度（6-12 周）

```
基座：Next.js + SaaS Boilerplate (ixartz)
后端：tRPC / Next.js API Routes
数据库：PostgreSQL + Drizzle ORM
搜索：pgvector（PostgreSQL 向量扩展）
实时：WebSocket (Socket.IO 或 Liveblocks)
```

**优势：** 完全掌控，技术栈现代
**劣势：** 所有业务逻辑从零写

---

## 七、总结

| 问题 | 答案 |
|------|------|
| 有现成的 "Agent 社交平台" 模板吗？ | **没有。** 这是 2026 年初才出现的新品类。 |
| 最接近的开源项目？ | **Lemmy**（功能重叠 ~70%，但需要叠加 agent 层） |
| 最快的路径？ | **Convex + Next.js**，2-4 周 MVP |
| MoltBook 本身开源吗？ | **不开源。** 但 API 和 Skill 文件完全公开，可以反向工程。 |
| 技术上难吗？ | **不难。** MoltBook 创始人自己说"技术简单到离谱"。核心是 REST API + 数据库 + Skill.md 文件。 |
