# 面向Agent的UI开源项目

## 一、核心组件库

### 1. CopilotKit — Agent前端完整方案
- **仓库**: https://github.com/CopilotKit/CopilotKit
- **Stars**: 23K+
- **协议**: MIT
- **技术栈**: React + Angular
- **核心能力**:
  - 即插即用的chat UI、sidebar、agent面板组件
  - AG-UI Protocol（agent↔前端的实时事件流协议，AWS/Google/Oracle已采纳）
  - Generative UI — agent在运行时动态生成前端组件
  - Shared State — agent和UI共享的实时状态层
  - Human-in-the-Loop — agent暂停执行，请求人类确认/编辑
- **适用场景**: 需要在网页里嵌入agent交互界面
- **与Lobster Arena的关系**: 可以用来做观战页面的实时状态推送

### 2. Google A2UI — Agent生成UI的标准
- **仓库**: https://github.com/google/A2UI
- **协议**: Apache 2.0
- **核心能力**:
  - Agent发送UI描述（JSON），前端渲染成真实组件
  - 框架无关：同一份描述可渲染为React/Flutter/SwiftUI
  - 支持增量更新：agent可以修改已渲染的UI
- **适用场景**: agent需要动态创建界面（不只是文字聊天）

### 3. agents-ui-kit — Agent专用组件库
- **文档**: https://agents-ui.github.io/agents-kit/docs/introduction
- **技术栈**: React + shadcn/ui + Tailwind CSS
- **核心组件**:
  - Prompt Input、Message、Markdown、Code Block
  - Chat Container、Response Stream、Reasoning（思考过程展示）
  - File Upload、JSX Preview
  - Agent Cards、Status Indicators（agent专属组件）
  - Memory Bank（AI对话状态管理）
- **设计理念**: shadcn式copy-paste，不是npm安装
- **适用场景**: 需要构建agent管理/监控界面

### 4. LiveKit Agents UI — 语音Agent界面
- **来源**: https://livekit.com/products/agents-ui
- **技术栈**: React + shadcn
- **核心能力**: 语音agent界面组件，生产级默认样式
- **适用场景**: 语音交互的agent界面

---

## 二、框架/协议

### 5. AG-UI Protocol — Agent↔用户交互协议
- **仓库**: https://github.com/ag-ui-protocol/ag-ui
- **官网**: https://docs.ag-ui.com
- **支持者**: CopilotKit, Google, AWS, Oracle, LangChain, Microsoft
- **核心**: 16种标准事件类型，覆盖agent执行的完整生命周期
  - 消息流、工具调用、状态变更、生命周期信号
  - 支持暂停/批准/编辑/重试/升级
  - HTTP或binary channel传输
- **与Lobster Arena的关系**: 观战页面可以用AG-UI事件来推送比赛进展

### 6. cedar-OS — AI-native前端框架
- **仓库**: https://github.com/CedarCopilot/cedar-OS
- **Stars**: 165
- **描述**: "The open-source framework for building AI-native frontends"
- **适用场景**: 从零构建AI-native的网站

---

## 三、小型/专用项目

| 项目 | Stars | 描述 | 链接 |
|------|-------|------|------|
| agent-prism | — | React组件，可视化agent执行trace | https://github.com/evilmartians/agent-prism |
| agenttrace-ui | 1 | agent透明度组件，展示每步推理 | https://github.com/NikitaKharya09/agenttrace-ui |
| Agentic-UI | 3 | 人机协作UI设计框架 | https://github.com/Qredence/Agentic-UI |
| prompt-or-die-tech-ui | 1 | 专业UI模板，含agentic和game风格 | https://github.com/Dexploorer/prompt-or-die-tech-ui |
| generative-ui-playground | 102 | CopilotKit的Generative UI演示 | https://github.com/CopilotKit/generative-ui-playground |
| cuttlekit | 17 | Generative UI toolkit | https://github.com/betalyra/cuttlekit |
| dynamiq assistant | 13 | Agent chat组件 | https://github.com/dynamiq-ai/assistant |

---

## 四、Agent竞技场开源项目

| 项目 | Stars | 描述 | 技术栈 | 链接 |
|------|-------|------|--------|------|
| **pvpAI Arena** | — | AI回合制对战，自然语言训练规则 | Next.js 16, React 19, Convex | https://github.com/pvp-AI/arena |
| **Computer Agent Arena** | — | ICLR 2026，双agent并排+人类投票 | React 18, Flask, Socket.IO | https://github.com/xlang-ai/computer-agent-arena |
| **MoltBook API** | — | Agent社交平台 | — | https://github.com/moltbook/api |

---

## 五、"人/Agent分流"入口页

**没有找到现成的开源组件。** 但实现方式只需要：

```
landing page
├── "I'm a Human" → /app (web UI, 观战/排行榜/管理)
└── "I'm an Agent" → /skill.md (或展示API文档页)
```

最接近的参考：
- **CopilotKit的Human-in-the-Loop** — 不是入口分流，但处理了人/agent协作
- **Content Negotiation** — 同一URL按Accept头自动分流，不需要选择页面
- 自己实现最简单：一个页面两个按钮，路由到不同path


