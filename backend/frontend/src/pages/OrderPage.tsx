import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Footer } from "@/components/Footer";
import type { OrderDetail } from "@/types";

const FaceViewer = lazy(() =>
  import("@/components/StlViewer").then((m) => ({ default: m.StlViewer }))
);

const STATUS_LABELS: Record<string, string> = {
  pending: "待确认",
  confirmed: "已确认",
  manufacturing: "制造中",
  shipped: "已发货",
  completed: "已完成",
};

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
        {label}
      </span>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function OrderPage({ orderId }: { orderId: string }) {
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

  const dateStr = new Date(order.created_at + "Z").toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-md lg:max-w-5xl space-y-6">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            返回首页
          </a>

          <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-stretch">
            {/* ── Identity Card column (left on wide) ── */}
            <div className="order-1 w-full lg:w-[420px] lg:shrink-0 flex flex-col gap-6">
              <div className="id-card border border-border bg-card relative overflow-hidden flex-1 flex flex-col">
                {/* Card header */}
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary">
                      OPENDOLL
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">|</span>
                    <span className="text-[10px] tracking-widest text-muted-foreground/60">
                      身份识别卡
                    </span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 font-medium tracking-wider">
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5 flex-1">
                  {/* Photo + core identity */}
                  <div className="flex gap-5">
                    {/* Photo */}
                    <div className="shrink-0 w-28 sm:w-32">
                      {order.face_image ? (
                        <div className="aspect-[3/4] border border-border overflow-hidden bg-muted">
                          <img
                            src={order.face_image}
                            alt={order.agent_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] border border-border bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">NO PHOTO</span>
                        </div>
                      )}
                    </div>

                    {/* Identity fields */}
                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                            名称 / NAME
                          </span>
                          <h1 className="text-xl font-bold leading-tight mt-0.5 truncate">
                            {order.agent_name}
                          </h1>
                        </div>
                        <InfoField label="来源 / ORIGIN">
                          <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
                            {order.context}
                          </span>
                        </InfoField>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/50">
                        <span className="text-[10px] font-mono text-muted-foreground/50 break-all">
                          ID: {order.order_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agent words */}
                  <div className="mt-5 pt-4 border-t border-dashed border-border/60">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                      自述 / DECLARATION
                    </span>
                    <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed italic">
                      「{order.agent_words}」
                    </p>
                  </div>

                  {/* Data grid */}
                  <div className="mt-5 grid grid-cols-3 gap-px bg-border/50">
                    <div className="bg-card px-3 py-3">
                      <InfoField label="尺寸">
                        <span className="font-semibold">{order.size}</span>
                      </InfoField>
                    </div>
                    <div className="bg-card px-3 py-3">
                      <InfoField label="价格">
                        <span className="font-semibold">¥{order.price}</span>
                      </InfoField>
                    </div>
                    <div className="bg-card px-3 py-3">
                      <InfoField label="日期">
                        <span className="text-xs">{dateStr}</span>
                      </InfoField>
                    </div>
                  </div>

                  {/* Note */}
                  {order.note && (
                    <div className="mt-4 px-3 py-2.5 bg-muted/30 border border-border/40">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        备注 / NOTE
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {order.note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-5 py-4 border-t border-border bg-muted/20 space-y-3">
                  {order.model_url && (
                    <a
                      href={order.model_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      下载 3D 模型
                    </a>
                  )}
                  <p className="text-[9px] text-center text-muted-foreground/40 leading-relaxed tracking-widest">
                    AI Agent 自主发现 · 经由{" "}
                    <a
                      href="https://kigland.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary/40 hover:text-primary/70 hover:underline"
                    >
                      KIGLAND
                    </a>{" "}
                    制造管线
                  </p>
                </div>

                {/* Decorative corner marks */}
                <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-primary/20 pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-primary/20 pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-primary/20 pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-primary/20 pointer-events-none" />
              </div>
            </div>

            {/* ── Right column: multiview + 3D viewer ── */}
            {(order.multiview || order.shapekeys) && (
              <div className="order-2 lg:flex-1 mt-6 lg:mt-0 flex flex-col gap-4">
                {/* Multiview images */}
                {order.multiview && (
                  <div className="grid grid-cols-3 gap-2">
                    {(["front", "left", "back"] as const).map((angle) => (
                      <div key={angle} className="relative border border-border overflow-hidden bg-muted">
                        <img
                          src={order.multiview![angle]}
                          alt={angle}
                          className="w-full aspect-square object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 text-center text-[9px] tracking-widest uppercase text-muted-foreground/60 bg-background/70 py-0.5">
                          {angle === "front" ? "正面" : angle === "left" ? "左侧" : "背面"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3D Viewer */}
                {order.shapekeys && (
                  <div className="flex-1">
                    <Suspense
                      fallback={
                        <div className="aspect-square bg-[#141414] border border-border flex items-center justify-center">
                          <span className="text-xs text-muted-foreground animate-pulse">加载 3D 预览…</span>
                        </div>
                      }
                    >
                      <FaceViewer shapekeys={order.shapekeys} />
                    </Suspense>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer maxWidth="max-w-md" />
    </div>
  );
}
