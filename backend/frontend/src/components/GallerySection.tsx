import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/timeAgo";
import type { FaceEntry } from "@/types";

function FaceCard({ face }: { face: FaceEntry }) {
  const Wrapper = face.order_id
    ? (props: { children: React.ReactNode }) => (
        <a href={`/order/${face.order_id}`} {...props} />
      )
    : (props: { children: React.ReactNode }) => <div {...props} />;

  return (
    <Wrapper>
      <div
        className={`border border-border bg-card overflow-hidden${face.order_id ? " transition-colors hover:border-primary/40 cursor-pointer" : ""}`}
      >
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
    </Wrapper>
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
