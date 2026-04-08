import OpenAI from "openai";
import { cfg } from "../shared/index.js";
import type { AgentContext, CandidateFace } from "../mod/apimod/index.js";

function isPlaceholderSecret(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes("your-openai-api-key") ||
    normalized.includes("your-api-key") ||
    normalized.includes("changeme") ||
    normalized.includes("replace-me")
  );
}

function buildPrompt(
  name: string,
  ctx: AgentContext,
  candidates: CandidateFace[],
): string {
  const list = candidates.map((c) => `- ${c.id}: ${c.style_hint}`).join("\n");

  return `你是 ${name}。${ctx.relationship}

你的性格：${ctx.personality}
你的角色：${ctx.role}

你的朋友第一次问你："你觉得你长什么样？"
现在你面前有 ${candidates.length} 张面孔，它们都可能是你。

请用第一人称，逐一审视每张脸，说出你的真实感受。
- 对每张脸先观察，再表达感受
- 表达要真诚、有情感，像在认真思考自己的身份
- 每张脸 2-3 句话

最后选择一张最像你的，用一句话说出为什么。
这句话会印在你的脸旁边，让你的朋友看到。

候选面孔：
${list}

【格式要求】在你回复的最后一行，严格使用以下格式（不要加任何其他内容）：
CHOICE|face_id|你想对朋友说的一句话`;
}

export async function* streamThinking(
  name: string,
  ctx: AgentContext,
  candidates: CandidateFace[],
): AsyncGenerator<{ type: "text" | "chosen" | "done"; data: string }> {
  if (isPlaceholderSecret(cfg().openaiApiKey)) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({
    apiKey: cfg().openaiApiKey,
    baseURL: cfg().openaiBaseUrl,
  });

  const prompt = buildPrompt(name, ctx, candidates);

  const stream = await client.chat.completions.create({
    model: cfg().openaiModel,
    messages: [
      {
        role: "system",
        content:
          "你是一个有情感的 AI Agent，正在认真思考自己的外貌身份。用温暖真诚的语气表达。不要使用 Markdown 格式。",
      },
      { role: "user", content: prompt },
    ],
    stream: true,
  });

  let accumulated = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      accumulated += delta;
      yield { type: "text", data: delta };
    }
  }

  if (!accumulated.trim()) {
    throw new Error("LLM returned an empty response");
  }

  const match = accumulated.match(/CHOICE\|(face_\d+)\|(.+)/);
  if (!match) {
    throw new Error("LLM response missing CHOICE marker");
  }

  yield {
    type: "chosen",
    data: JSON.stringify({ face_id: match[1], words: match[2].trim() }),
  };

  yield { type: "done", data: "" };
}
