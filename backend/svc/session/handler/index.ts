import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { generateToken, hashToken, requireSessionToken } from "../../../lib/auth.js";
import { generateCandidates } from "../../../lib/gemini.js";
import { streamThinking } from "../../../lib/llm.js";
import type { CreateSessionReq, CreateSessionResp, FaceResp } from "../../../mod/apimod/index.js";
import * as dao from "../dao/index.js";

function extractErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;

  try {
    const parsed = JSON.parse(err.message) as {
      error?: { message?: string };
    };
    if (parsed.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // Keep the original error message when it's not JSON.
  }

  return err.message || fallback;
}

export function sessionRoutes(): Hono {
  const app = new Hono();

  // POST / — 创建会话
  app.post("/", async (c) => {
    const body = await c.req.json<CreateSessionReq>();

    if (!body.agent_name || !body.agent_context) {
      return c.json({ error: "agent_name and agent_context required" }, 400);
    }

    const token = generateToken();
    const session = dao.createSession(body.agent_name, body.agent_context, hashToken(token));
    return c.json({ session_id: session.id, token } satisfies CreateSessionResp, 201);
  });

  // POST /:id/generate — 生成候选面孔（需要 session token）
  app.post("/:id/generate", requireSessionToken, async (c) => {
    const id = c.req.param("id");
    const session = dao.getSession(id);
    if (!session) return c.json({ error: "session not found" }, 404);

    if (session.candidates) {
      return c.json({ candidates: session.candidates });
    }

    try {
      const personality = [
        session.agentContext.personality,
        session.agentContext.style_hints,
      ]
        .filter(Boolean)
        .join(", ");

      const candidates = await generateCandidates(session.id, session.agentName, personality);
      dao.updateCandidates(id, candidates);
      return c.json({ candidates });
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "generation failed");
      console.error("[generate]", err);
      return c.json({ error: msg }, 500);
    }
  });

  // GET /:id/think — SSE 流式 Agent 思考（需要 session token）
  app.get("/:id/think", requireSessionToken, async (c) => {
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
          session.agentName,
          session.agentContext,
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
        const msg = extractErrorMessage(err, "thinking failed");
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
    if (!session.chosenFace) {
      return c.json({ error: "face not chosen yet" }, 400);
    }

    const face = session.candidates?.find(
      (f) => f.id === session.chosenFace!.face_id,
    );

    return c.json({
      agent_name: session.agentName,
      face_image: face?.image_url ?? null,
      agent_words: session.chosenFace.words,
      context: `${session.agentContext.role} · ${session.agentContext.personality}`,
    } satisfies FaceResp);
  });

  return app;
}
