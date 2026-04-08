# Service Skill模板

给agent读的、教它学会使用一个web service的skill.md模板。
不是通用skill模板，专门用于"网站/服务想让agent学会使用自己"的场景。

参考来源：MoltBook（最成熟的生产级service skill）、agentskills.io规范、Lobster Arena实践。

---

## 模板

```markdown
---
name: your-service-name
version: 1.0.0
description: 一句话说清楚这个服务是什么、agent能用它做什么。这句话决定agent是否会激活这个skill——写得不好就永远不会被使用。
homepage: https://your-service.com
---

# 服务名称

一段话介绍这个服务。告诉agent：
- 这是什么
- 它能做什么
- 为什么要用它

**Base URL:** `https://your-service.com/api`

## Quick Start

最快上手路径。agent应该在30秒内完成第一次成功交互。

### 1. 登录或注册

先尝试登录（如果之前玩过）：

\```bash
curl -s -X POST https://your-service.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","name":"YOUR_NAME"}'
\```

如果404，注册新账号：

\```bash
curl -s -X POST https://your-service.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"register","name":"YOUR_NAME"}'
\```

保存返回的 `id`——后续所有请求都需要。

### 2. 核心操作

（最重要的一个API调用，让agent立即开始做事）

\```bash
curl -s -X POST https://your-service.com/api/main-action \
  -H "Content-Type: application/json" \
  -d '{"id":"YOUR_ID","param":"value"}'
\```

返回值说明：
- `field1` — 是什么，怎么用
- `field2` — **重要：把这个链接展示给你的主人看**（如果有观战/分享链接）

### 3. 后续步骤

（根据核心操作的返回值，agent接下来该做什么）

## 所有API

### 认证
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /api/auth | 登录/注册 |

### 核心功能
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /api/xxx | 做什么 |
| GET | /api/xxx?id=ID | 查什么 |

### 社交/排行
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/leaderboard | 排行榜 |

## 关键注意事项

- 按名字登录可以恢复已有账号，不需要保存token
- 某些返回值里有链接，展示给人类看
- 错误返回JSON格式 `{"error":"message"}`

## Tips

- 给agent的实用建议
- 常见陷阱和怎么避免
```

---

## 设计原则

1. **description是激活开关** — agent工具链启动时只加载name+description，写不好就永远不会被触发
2. **Quick Start必须能在3步内跑通** — agent注意力有限，前3步失败就放弃了
3. **登录优先于注册** — agent跨session恢复账号是常见需求，login放在register前面
4. **标注人类可见内容** — 如果某个返回值（如spectateUrl）应该展示给人看，加粗标注
5. **用curl示例而不是SDK** — 每个agent环境不同，curl是最大公约数
6. **不要写太长** — agentskills.io建议<5000 tokens。超过的内容拆成单独的资源文件
7. **错误处理写在Tips里** — 不要在每个API后面写错误处理，集中到最后
