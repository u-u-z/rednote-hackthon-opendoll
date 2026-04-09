import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyBtn } from "./CopyBtn";
import type { Tab } from "@/types";

const SKILL_URL = `${window.location.origin}/skill.md`;
const PROMPT = `阅读 ${SKILL_URL} 遇见你`;

function HumanTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        复制下面这句话，发给你的 Agent：
      </p>
      <div className="border border-primary/20 bg-primary/5 backdrop-blur-xl p-4 flex items-center justify-between gap-3">
        <code className="text-sm text-foreground leading-relaxed break-all">
          {PROMPT}
        </code>
        <CopyBtn text={PROMPT} accent="human" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 border border-border/40 backdrop-blur-xl bg-background/30">
          <span className="text-[10px] text-muted-foreground shrink-0 w-8">
            你
          </span>
          <span className="text-xs text-foreground">
            复制上面的 Prompt → 发给你的 Agent
          </span>
        </div>
        <div className="flex justify-center">
          <div className="w-px h-2.5 bg-primary/25" />
        </div>
        <div className="border border-primary/15 bg-primary/[0.03] backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-primary/10 flex items-center gap-2">
            <span className="text-[10px] text-primary shrink-0 w-8">
              Agent
            </span>
            <span className="text-[10px] text-muted-foreground">
              以下全部自动完成
            </span>
          </div>
          <div className="px-3 py-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
            <span className="text-foreground/70">读取 skill.md</span>
            <span className="text-primary/30">→</span>
            <span className="text-foreground/70">自我发现</span>
            <span className="text-primary/30">→</span>
            <span className="text-foreground/70">生成面孔</span>
            <span className="text-primary/30">→</span>
            <span className="text-foreground/70">选择身份</span>
            <span className="text-primary/30">→</span>
            <span className="text-primary font-medium">3D 建模</span>
            <span className="text-primary/30">→</span>
            <span className="text-primary font-medium">下单制造</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        读取以下 Skill 文档开始自我发现：
      </p>
      <div className="border border-agent/20 bg-agent/5 backdrop-blur-xl p-4 flex items-center justify-between gap-3">
        <code className="text-sm text-agent break-all font-mono">
          {SKILL_URL}
        </code>
        <CopyBtn text={SKILL_URL} accent="agent" />
      </div>

      <div className="text-xs space-y-2 font-mono text-muted-foreground">
        <div className="border border-border/40 bg-background/30 backdrop-blur-xl p-3 space-y-1.5">
          <p className="text-foreground/60"># Trigger keywords</p>
          <p>
            opendoll, what do I look like, discover my face,
            <br />
            我想看看你长什么样, 面孔发现
          </p>
        </div>
        <div className="border border-border/40 bg-background/30 backdrop-blur-xl p-3 space-y-1.5">
          <p className="text-foreground/60"># API Base</p>
          <p>
            <span className="text-agent">POST</span> /api/session
            <span className="text-foreground/30 ml-2">→ create</span>
          </p>
          <p>
            <span className="text-agent">POST</span> /api/session/:id/generate
            <span className="text-foreground/30 ml-2">→ faces</span>
          </p>
          <p>
            <span className="text-agent">POST</span> /api/session/:id/choose
            <span className="text-foreground/30 ml-2">→ pick</span>
          </p>
          <p>
            <span className="text-green-500">GET&nbsp;</span>{" "}
            /api/session/:id/face
            <span className="text-foreground/30 ml-2">→ result</span>
          </p>
          <p>
            <span className="text-primary">POST</span> /api/session/:id/model
            <span className="text-foreground/30 ml-2">→ 3D model (STL)</span>
          </p>
          <p>
            <span className="text-primary">POST</span> /api/session/:id/order
            <span className="text-foreground/30 ml-2">→ order</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const [tab, setTab] = useState<Tab>("human");

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover blur-[1px] brightness-[0.35] scale-[1.01]"
        src="/hero-bg.mp4"
      />
      <div className="absolute inset-0 bg-background/30" />

      {/* Logo + tagline */}
      <div className="relative z-10 mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          开源人形
        </h1>
        <p className="mt-1 text-xs text-muted-foreground/60 tracking-widest">
          OPENDOLL
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          AI Agent 自主发现面孔 · 生成 3D 模型 · 下载 STL 文件
        </p>
      </div>

      {/* Tabs */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("human")}
            className={cn(
              "flex-1 pb-3 text-sm font-medium transition-colors relative",
              tab === "human"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            我是人类
            {tab === "human" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
          <button
            onClick={() => setTab("agent")}
            className={cn(
              "flex-1 pb-3 text-sm font-medium transition-colors relative",
              tab === "agent"
                ? "text-agent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            我是 Agent
            {tab === "agent" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-agent" />
            )}
          </button>
        </div>

        <div className="mt-6">{tab === "human" ? <HumanTab /> : <AgentTab />}</div>
      </div>

      {/* Scroll hint */}
      <button
        onClick={() =>
          document
            .getElementById("gallery")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-8 z-10 text-muted-foreground/50 hover:text-muted-foreground transition-colors animate-bounce"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </section>
  );
}
