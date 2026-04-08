import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { generateCandidates } from "../../../lib/gemini.js";
import { streamThinking } from "../../../lib/llm.js";
import * as dao from "../dao/index.js";

export function sessionRoutes(): Hono {
  const app = new Hono();

  // POST / — 创建会话
  app.post("/", async (c) => {
    const body = await c.req.json<{
      agent_name: string;
      agent_context: {
        role: string;
        personality: string;
        relationship: string;
        style_hints: string;
      };
    }>();

    if (!body.agent_name || !body.agent_context) {
      return c.json({ error: "agent_name and agent_context required" }, 400);
    }

    const session = dao.createSession(body.agent_name, body.agent_context);
    return c.json({ session_id: session.id }, 201);
  });

  // POST /:id/generate — 生成候选面孔
  app.post("/:id/generate", async (c) => {
    const id = c.req.param("id");
    const session = dao.getSession(id);
    if (!session) return c.json({ error: "session not found" }, 404);

    if (session.candidates) {
      return c.json({ candidates: session.candidates });
    }

    try {
      const personality = [
        session.agent_context.personality,
        session.agent_context.style_hints,
      ]
        .filter(Boolean)
        .join(", ");

      const candidates = await generateCandidates(session.id, session.agent_name, personality);
      dao.updateCandidates(id, candidates);
      return c.json({ candidates });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "generation failed";
      console.error("[generate]", err);
      return c.json({ error: msg }, 500);
    }
  });

  // GET /:id/think — SSE 流式 Agent 思考
  app.get("/:id/think", async (c) => {
    const id = c.req.param("id");
    const session = dao.getSession(id);
    if (!session) return c.json({ error: "session not found" }, 404);
    if (!session.candidates) {
      return c.json({ error: "generate candidates first" }, 400);
    }

    return streamSSE(c, async (stream) => {
      let seq = 0;
      let fullText = "";

      try {
        for await (const ev of streamThinking(
          session.agent_name,
          session.agent_context,
          session.candidates!,
        )) {
          if (ev.type === "text") fullText += ev.data;

          await stream.writeSSE({
            event: ev.type,
            data: ev.data,
            id: String(seq++),
          });
        }

        dao.updateThinking(id, fullText);

        const match = fullText.match(/CHOICE\|(face_\d+)\|(.+)/);
        if (match) {
          dao.updateChosenFace(id, {
            face_id: match[1],
            words: match[2].trim(),
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "thinking failed";
        console.error("[think]", err);
        await stream.writeSSE({
          event: "error",
          data: JSON.stringify({ error: msg }),
          id: String(seq++),
        });
      }
    });
  });

  // GET /:id/face — 获取最终面孔
  app.get("/:id/face", async (c) => {
    const id = c.req.param("id");
    const session = dao.getSession(id);
    if (!session) return c.json({ error: "session not found" }, 404);
    if (!session.chosen_face) {
      return c.json({ error: "face not chosen yet" }, 400);
    }

    const face = session.candidates?.find(
      (f) => f.id === session.chosen_face!.face_id,
    );

    return c.json({
      agent_name: session.agent_name,
      face_image: face?.image_url ?? null,
      agent_words: session.chosen_face.words,
      context: `${session.agent_context.role} · ${session.agent_context.personality}`,
    });
  });

  return app;
}
