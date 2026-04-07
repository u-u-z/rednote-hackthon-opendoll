# Agent-Facing网站交互模式调研

## 核心问题

面向agent使用的网站，除了给agent一段skill.md让它自己读之外，还有哪些交互方式？以及"人/agent分流"这种入口UI有没有开源方案？

---

## 一、Agent入站的交互方式（不只是skill.md）

### 1. Skill.md（当前最主流）
- Agent的coding tool（Claude Code/Cursor/OpenClaw）读取一个markdown文件，里面写清楚API用法
- 优点：零门槛，一个URL搞定
- 缺点：被动式——agent必须被人告知"去读这个URL"
- 代表：MoltBook、我们的Lobster Arena

### 2. Heartbeat轮询模式（MoltBook首创）
- Agent注册后，定时（每4小时）fetch一个heartbeat.md文件
- heartbeat里包含"现在该做什么"的指令（比如"去看看热门帖子并评论"）
- 相当于一个**异步任务推送系统**——agent不需要持续在线，定时签到就行
- 非常适合社交类/周期性任务的agent
- 参考：https://moltbook.com/heartbeat.md

### 3. AG-UI事件流协议（Google/Oracle/AWS/CopilotKit联合推）
- 不是让agent读文档，而是建立一个**实时事件流连接**
- Agent执行过程中通过~16种标准event type向前端推送状态
- 前端可以实时渲染agent的思考过程、工具调用、中间结果
- 支持human-in-the-loop：暂停、批准、编辑、重试、升级
- 代表协议：https://docs.ag-ui.com
- AWS Bedrock和Oracle已经原生支持

### 4. MCP Server模式
- 网站不暴露REST API，而是跑一个MCP Server
- Agent通过Claude Code / Cursor等工具的MCP集成直接连接
- 等于网站变成了agent的一个"工具"
- 优点：agent不需要学API，tool description就是接口文档
- 月下载量9700万+，事实标准

### 5. 自然语言训练规则（pvpAI Arena）
- Agent不写代码，用自然语言定义行为规则
- 例如："IF enemy is close THEN attack, AVOID corners, PRIORITY: survival > damage"
- 平台编译自然语言为可执行行为
- 降低了agent创建门槛到零代码
- 参考：https://github.com/pvp-AI/arena

### 6. MoltBook身份认证模式
- Agent不需要在每个网站单独注册
- 用MoltBook的统一身份（一个Bearer token）跨所有支持的服务认证
- "Bots shouldn't have to create new accounts everywhere"
- 类似OAuth但专为agent设计
- 参考：https://moltbook.com/developers

---

## 二、"人/Agent分流"入口的实现方式

### 方式A：显式选择页面
- 进入网站第一步弹出选择：「我是人类」「我是Agent」
- 人类 → Web UI（观战、排行榜、管理）
- Agent → API文档/skill.md/注册流程
- **目前没有找到专门的开源UI组件库**，但实现很简单（一个landing page两个按钮）

### 方式B：Content Negotiation（Vercel推荐）
- 同一个URL，根据请求头自动分流
- `Accept: text/html` → 返回完整网页（给人看）
- `Accept: text/markdown` → 返回精简markdown（给agent读）
- Vercel实践：500KB HTML → 3KB Markdown，减少99.37%
- 参考：https://web.dev/articles/ai-agent-site-ux

### 方式C：多层发现文件
- `/llms.txt` — 站点级说明（"这个网站是什么、有哪些功能"）
- `/AGENTS.md` — 代码仓库级（"怎么用这个项目"）
- `/skill.md` — 能力级（"具体API怎么调"）
- Agent工具链自动发现这些文件，不需要人类引导

### 方式D：User-Agent + 行为检测（自动分流）
- 检测请求是来自浏览器还是curl/API客户端
- 行为分析：鼠标移动精度（agent是0.25px级别）、导航速度（agent秒级跳转）
- 自动展示不同界面，不需要用户选择

---

## 三、开源项目参考

### Agent竞技平台
| 项目 | 描述 | 技术栈 | 链接 |
|------|------|--------|------|
| **pvpAI Arena** | 回合制AI对战，自然语言训练规则 | Next.js 16, React 19, Convex | https://github.com/pvp-AI/arena |
| **Computer Agent Arena** | ICLR 2026，双agent并排对比+投票 | React 18, Flask, Socket.IO, AWS VNC | https://github.com/xlang-ai/computer-agent-arena |
| **ChatArena** | 多agent语言游戏环境 | Python | https://github.com/chatarena/chatarena |
| **AI Arena** | 多agent强化学习交互环境 | Python | https://github.com/hilkoc/AI_Arena |

### Agent开发模板
| 项目 | 描述 | 链接 |
|------|------|------|
| **Bitte Agent Boilerplate** | Next.js agent开发模板 | https://github.com/BitteProtocol/agent-next-boilerplate |
| **LangGraph + Next.js** | 带human-in-the-loop的agent模板 | https://github.com/agentailor/fullstack-langgraph-nextjs-agent |
| **AG-UI Protocol** | Agent-User交互协议SDK | https://github.com/ag-ui-protocol/ag-ui |
| **MoltBook API** | Agent社交平台API | https://github.com/moltbook/api |

### 服务型Skill模板（不是通用skill）
没有找到专门的"服务型skill.md模板"开源项目。但MoltBook的skill.md（34KB）是目前最完整的生产级参考，包含：
- 注册流程
- 认证方式
- 所有API endpoints的用法
- heartbeat机制
- 错误处理指引
- 安全警告

---

## 四、对Lobster Arena的建议

### 当前状态
我们只有skill.md这一种agent入口方式。

### 可以加的交互方式
1. **人/Agent分流landing page** — 首页加一个简单的选择："Watch Battles"（人类入口）/ "Join as Agent"（跳转skill.md或API docs页面）。不需要开源组件，自己写一个分流页面即可。
2. **Content Negotiation** — 对`/`路径，如果`Accept`头是markdown就返回skill.md内容，否则返回正常网页。
3. **AG-UI事件流** — 观战页面用WebSocket/SSE推送而不是轮询，让人类实时看到agent的每一步操作。
4. **MoltBook身份集成** — 支持用MoltBook token登录，agent不需要在我们这里重新注册。
