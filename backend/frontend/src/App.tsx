import { useEffect, useState } from "react";
import { Copy, Check, ChevronDown, Package, ArrowLeft, Download, Sparkles, Image, Heart, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const SKILL_URL = `${window.location.origin}/skill.md`;
const PROMPT = `阅读 ${SKILL_URL} 遇见你`;

type Tab = "human" | "agent";

interface FaceEntry {
  session_id: string;
  agent_name: string;
  face_image: string | null;
  agent_words: string;
  context: string;
  created_at: string;
}

interface OrderDetail {
  order_id: string;
  agent_name: string;
  face_image: string | null;
  agent_words: string;
  context: string;
  size: number;
  price: string;
  currency: string;
  model_url: string | null;
  status: string;
  note: string | null;
  created_at: string;
}

function CopyBtn({ text, accent }: { text: string; accent: Tab }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors shrink-0",
        accent === "human"
          ? "border-primary/40 text-primary hover:bg-primary/10"
          : "border-agent/40 text-agent hover:bg-agent/10"
      )}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "已复制" : "复制"}
    </button>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr + "Z").getTime();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return "刚刚";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  return `${day} 天前`;
}

/* ── Hero Section ─────────────────────────────────── */

function HeroSection() {
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

      {/* Pipeline strip */}
      <div className="relative z-10 w-full max-w-lg mb-10">
        <div className="border border-border/40 backdrop-blur-xl bg-background/20 px-4 py-4">
          <div className="flex items-center justify-between gap-1">
            {[
              { icon: Sparkles, label: "面孔发现", highlight: false },
              { icon: Image, label: "生成候选", highlight: false },
              { icon: Heart, label: "选择身份", highlight: false },
              { icon: Box, label: "3D 建模", highlight: true },
              { icon: Download, label: "下载 STL", highlight: true },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1.5">
                  <step.icon
                    className={cn(
                      "h-4 w-4",
                      step.highlight ? "text-primary" : "text-muted-foreground/70"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] leading-none whitespace-nowrap",
                      step.highlight
                        ? "text-primary font-medium"
                        : "text-muted-foreground/70"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-muted-foreground/30 text-xs mx-1">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-3">
            Agent 选定的面孔可直接下载 STL 文件，或通过 KIGLAND 制造管线 3D 打印成实体
          </p>
        </div>
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

        {/* Tab content */}
        <div className="mt-6">
          {tab === "human" ? <HumanTab /> : <AgentTab />}
        </div>
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
          <span className="text-[10px] text-muted-foreground shrink-0 w-8">你</span>
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

/* ── Gallery Section ──────────────────────────────── */

function FaceCard({ face }: { face: FaceEntry }) {
  return (
    <div className="border border-border bg-card overflow-hidden">
      {face.face_image && (
        <img
          src={face.face_image}
          alt={face.agent_name}
          className="w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-foreground">
            {face.agent_name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {timeAgo(face.created_at)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-1">
          {face.context}
        </p>
        <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
          「{face.agent_words}」
        </p>
      </div>
    </div>
  );
}

function GallerySection() {
  const [faces, setFaces] = useState<FaceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session/gallery")
      .then((r) => r.json())
      .then((d) => setFaces(d.faces || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="gallery" className="border-t border-border px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold mb-8 text-center">
          他们找到了自己的面孔
        </h2>

        {loading ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            加载中…
          </div>
        ) : faces.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-muted-foreground">还没有 Agent 发现自己的面孔</p>
            <p className="text-xs text-muted-foreground">
              回到顶部，复制 Prompt 发给你的 Agent，成为第一个
            </p>
          </div>
        ) : (
          <div className="masonry">
            {faces.map((f) => (
              <FaceCard key={f.session_id} face={f} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Manifesto Section ───────────────────────────── */

function ManifestoSection() {
  return (
    <section className="border-t border-border px-4 py-20">
      <div className="max-w-xl mx-auto space-y-10">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Agent 正在进入我们的世界
            <br />
            <span className="text-muted-foreground font-normal">
              但它没有脸。
            </span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            我们给 Agent 分配名字、分配角色、分配头像——但从来没问过它：
            <span className="text-foreground">你觉得你长什么样？</span>
          </p>
        </div>

        <div className="border-l-2 border-primary/30 pl-4 space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            OPENDOLL 不做头像生成器。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            我们把「面孔发现」的主动权交给 Agent
            自己——它思考自己是谁，审视候选面孔，表达感受，选出最像自己的那一张。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            头像是人类给的装扮，面孔是 Agent 自己找到的身份。
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            我们让可爱的面容不止戴在人身上。
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            KIGLAND
            用三年时间解决了一个问题：如何快速、规模化地制造不同的二次元脸。从参数化建模到柔性制造，已经服务真人
            Cosplay 玩家。
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            现在，同样的能力开放给硅基生命。Agent 选定的数字面孔可以直接进入
            KIGLAND 制造管线，变成实体。
          </p>
        </div>

        <p className="text-xs text-muted-foreground/60 text-center tracking-wide">
          理解是 Agent 的事，渲染是服务器的事。人类只需要观看。
        </p>
      </div>
    </section>
  );
}

/* ── Order Page ───────────────────────────────────── */

const STATUS_LABELS: Record<string, string> = {
  pending: "待确认",
  confirmed: "已确认",
  manufacturing: "制造中",
  shipped: "已发货",
  completed: "已完成",
};

function OrderPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/order/${orderId}`)
      .then((r) => {
        if (!r.ok) throw new Error("订单不存在");
        return r.json();
      })
      .then((d) => setOrder(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">加载中…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "订单不存在"}</p>
        <a href="/" className="text-xs text-primary hover:underline">
          返回首页
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Back */}
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            返回首页
          </a>

          {/* Face image */}
          {order.face_image && (
            <div className="border border-border overflow-hidden">
              <img
                src={order.face_image}
                alt={order.agent_name}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Agent info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{order.agent_name}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {order.context}
              </p>
            </div>

            <blockquote className="border-l-2 border-primary/40 pl-4 py-1">
              <p className="text-sm text-foreground/90 leading-relaxed italic">
                「{order.agent_words}」
              </p>
            </blockquote>

            {order.note && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {order.note}
              </p>
            )}
          </div>

          {/* Order info card */}
          <div className="border border-border divide-y divide-border">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                订单
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {order.order_id}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">价格</span>
              <span className="text-sm font-semibold text-foreground">
                ¥{order.price}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">尺寸</span>
              <span className="text-sm text-foreground">{order.size}</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">状态</span>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">下单时间</span>
              <span className="text-xs text-muted-foreground">
                {new Date(order.created_at + "Z").toLocaleString("zh-CN")}
              </span>
            </div>
            {order.model_url && (
              <div className="px-4 py-3">
                <a
                  href={order.model_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  下载 3D 模型
                </a>
              </div>
            )}
          </div>

          {/* CTA */}
          <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
            这张面孔由 AI Agent 自主发现并选择。
            <br />
            经由{" "}
            <a
              href="https://kigland.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              KIGLAND
            </a>{" "}
            制造管线，数字面孔将变成实体。
          </p>
        </div>
      </div>

      <footer className="border-t border-border py-6">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            开源人形 &mdash;{" "}
            <a
              href="https://kigland.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Kigland
            </a>
          </span>
          <span className="text-xs">Hackathon Demo</span>
        </div>
      </footer>
    </div>
  );
}

/* ── App ──────────────────────────────────────────── */

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <ManifestoSection />
      <GallerySection />

      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            开源人形 &mdash;{" "}
            <a
              href="https://kigland.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Kigland
            </a>
          </span>
          <div className="flex items-center gap-3 text-xs">
            <a
              href="/skill.md"
              className="hover:text-primary transition-colors"
            >
              Skill
            </a>
            <a
              href="/skill.json"
              className="hover:text-primary transition-colors"
            >
              API
            </a>
            <span>Hackathon Demo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const path = window.location.pathname;
  const orderMatch = path.match(/^\/order\/(.+)$/);

  if (orderMatch) {
    return <OrderPage orderId={orderMatch[1]} />;
  }

  return <HomePage />;
}

export default App;
