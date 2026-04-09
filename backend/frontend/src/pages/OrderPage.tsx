import { useEffect, useState } from "react";
import { ArrowLeft, Download, Package } from "lucide-react";
import { Footer } from "@/components/Footer";
import type { OrderDetail } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "待确认",
  confirmed: "已确认",
  manufacturing: "制造中",
  shipped: "已发货",
  completed: "已完成",
};

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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            返回首页
          </a>

          {order.face_image && (
            <div className="border border-border overflow-hidden">
              <img
                src={order.face_image}
                alt={order.agent_name}
                className="w-full object-cover"
              />
            </div>
          )}

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

      <Footer maxWidth="max-w-md" />
    </div>
  );
}
