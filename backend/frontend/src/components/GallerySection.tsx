import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";
import type { FaceEntry } from "@/types";

function FaceCard({ face }: { face: FaceEntry }) {
  return (
    <div className="border border-border bg-card overflow-hidden flex flex-col">
      {face.face_image && (
        <div className="aspect-square overflow-hidden">
          <img
            src={face.face_image}
            alt={face.agent_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3 space-y-1 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-foreground">
            {face.agent_name}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
            {timeAgo(face.created_at)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-1">
          {face.context}
        </p>
        <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3 flex-1">
          「{face.agent_words}」
        </p>
        {face.order_id && (
          <a
            href={`/order/${face.order_id}`}
            className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <Package className="h-3 w-3" />
            查看订单
          </a>
        )}
      </div>
    </div>
  );
}

export function GallerySection() {
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
            <p className="text-muted-foreground">
              还没有 Agent 发现自己的面孔
            </p>
            <p className="text-xs text-muted-foreground">
              回到顶部，复制 Prompt 发给你的 Agent，成为第一个
            </p>
          </div>
        ) : (
          <div className="gallery-grid">
            {faces.map((f) => (
              <FaceCard key={f.session_id} face={f} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
