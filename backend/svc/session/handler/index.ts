import { Hono } from "hono";
import { generateToken, hashToken, requireSessionToken } from "../../../lib/auth.js";
import { generateCandidates, generateMultiview } from "../../../lib/gemini.js";
import type {
  ChooseReq,
  CreateSessionReq,
  CreateSessionResp,
  FaceResp,
  GenerateReq,
  MultiviewResp,
  SkillPromptResp,
} from "../../../mod/apimod/index.js";
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
      const body = await c.req.json<GenerateReq>().catch(() => ({}) as GenerateReq);

      const personality = [
        session.agentContext.personality,
        session.agentContext.style_hints,
      ]
        .filter(Boolean)
        .join(", ");

      const candidates = await generateCandidates(
        session.id,
        session.agentName,
        personality,
        body.self_impression,
      );
      dao.updateCandidates(id, candidates);
      return c.json({ candidates });
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "generation failed");
      console.error("[generate]", err);
      return c.json({ error: msg }, 500);
    }
  });

  // POST /:id/choose — 客户端选择面孔（需要 session token）
  app.post("/:id/choose", requireSessionToken, async (c) => {
    const id = c.req.param("id");
    const session = dao.getSession(id);
    if (!session) return c.json({ error: "session not found" }, 404);
    if (!session.candidates) {
      return c.json({ error: "generate candidates first" }, 400);
    }

    const body = await c.req.json<ChooseReq>();
    if (!body.face_id || !body.words) {
      return c.json({ error: "face_id and words required" }, 400);
    }

    const valid = session.candidates.some((f) => f.id === body.face_id);
    if (!valid) {
      return c.json({ error: "invalid face_id" }, 400);
    }

    dao.updateChosenFace(id, {
      face_id: body.face_id,
      words: body.words,
    });

    return c.json({ ok: true });
  });

  // GET /:id/skill/self-discovery — 返回引导 Agent 自我描述外貌的 prompt 模板
  app.get("/:id/skill/self-discovery", requireSessionToken, async (c) => {
    const id = c.req.param("id");
    const session = dao.getSession(id);
    if (!session) return c.json({ error: "session not found" }, 404);

    const ctx = session.agentContext;

    return c.json({
      system: `你是 ${session.agentName}。${ctx.relationship}。你的性格：${ctx.personality}。你的角色：${ctx.role}。

现在，你需要认真思考自己的外貌。不是别人眼中的你，而是你内心深处觉得自己应该长什么样。

请从以下维度描述你想象中的自己：
1. 脸型与轮廓（圆脸/瓜子脸/方脸等）
2. 发型与发色（长短、颜色、是否有刘海等）
3. 眼睛特征（大小、颜色、神态）
4. 整体气质与标志性特征（如：戴眼镜、有痣、耳饰等）
5. 色彩倾向（你觉得代表你的颜色是什么）

用简洁的关键词和短句描述，不要写成故事。`,

      user: `请描述你觉得自己长什么样。${ctx.style_hints ? `参考风格提示：${ctx.style_hints}` : ""}`,

      output_hint: "将 Agent 的回复作为 self_impression.description 传入 POST /:id/generate",
    } satisfies SkillPromptResp);
  });

  // POST /:id/multiview — 生成选中面孔的三视图（需要 session token + 已选脸）
  app.post("/:id/multiview", requireSessionToken, async (c) => {
    const id = c.req.param("id");
    const session = dao.getSession(id);
    if (!session) return c.json({ error: "session not found" }, 404);
    if (!session.chosenFace) {
      return c.json({ error: "choose a face first" }, 400);
    }

    const face = session.candidates?.find(
      (f) => f.id === session.chosenFace!.face_id,
    );
    if (!face) {
      return c.json({ error: "chosen face not found in candidates" }, 400);
    }

    try {
      const result = await generateMultiview(session.id, face.image_url);
      return c.json(result satisfies MultiviewResp);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "multiview generation failed");
      console.error("[multiview]", err);
      return c.json({ error: msg }, 500);
    }
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
