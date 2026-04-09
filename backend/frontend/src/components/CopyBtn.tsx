import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tab } from "@/types";

export function CopyBtn({ text, accent }: { text: string; accent: Tab }) {
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
