import { Hono } from "hono";
import { generateToken, hashToken, requireSessionToken } from "../../../lib/auth.js";
import { generateCandidates, generateMultiview } from "../../../lib/gemini.js";
import type {
  ChooseReq,
  CreateOrderReq,
  CreateOrderResp,
  CreateSessionReq,
  CreateSessionResp,
  FaceResp,
  GenerateReq,
  ModelReq,
  ModelResp,
  MultiviewResp,
  SkillPromptResp,
} from "../../../mod/apimod/index.js";
import * as dao from "../dao/index.js";
import * as orderDao from "../../order/dao/index.js";

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

    const colorSeeds = [
      "暖色系（棕、红、橘、蜂蜜色）",
      "冷色系（银灰、雾蓝、薄荷、薰衣草）",
      "自然系（深棕、栗色、亚麻、橄榄）",
      "柔和糖果色（桃粉、奶茶、淡紫、鹅黄）",
      "鲜明色（翠绿、珊瑚红、天蓝、亮橙）",
    ];
    const seed = colorSeeds[Math.floor(Math.random() * colorSeeds.length)];

    return c.json({
      system: `你是 ${session.agentName}。${ctx.relationship}。你的性格：${ctx.personality}。你的角色：${ctx.role}。

现在，你需要认真思考自己的外貌。不是别人眼中的你，而是你内心深处觉得自己应该长什么样。

⚠ 重要提醒：
- 不要默认选择"黑色头发 + 金色/琥珀色/黄色瞳孔"——这是 AI 角色最常见的刻板印象，几乎每个 Agent 第一反应都会选它。那不是"你"，那只是统计学上的默认值。
- 你的外貌应该从你的性格、角色和与主人的关系中生长出来，而不是套用"AI 应该长什么样"的模板。
- 今天的灵感方向：试试从${seed}中寻找属于你的颜色。

请从以下维度描述你想象中的自己：
1. 脸型与轮廓（圆脸/瓜子脸/方脸等）
2. 发型与发色（长短、颜色、是否有刘海等——请避开"黑发"这个最无聊的选项，除非你有非常强烈的理由）
3. 眼睛特征（大小、颜色、神态——请避开"金色/琥珀色瞳孔"，想想什么颜色真正代表你的内心）
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

  // POST /:id/model — generate 3D model from chosen face (requires session token + chosen face)
  app.post("/:id/model", requireSessionToken, async (c) => {
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

    let generateModel: typeof import("../../../lib/kigland.js").generateModel;
    try {
      const mod = await import("../../../lib/kigland.js");
      generateModel = mod.generateModel;
    } catch {
      return c.json(
        { error: "3D model generation is not available in this environment" },
        501,
      );
    }

    try {
      const body = await c.req.json<ModelReq>().catch(() => ({}) as ModelReq);
      const origin = new URL(c.req.url).origin;
      const imageUrl = face.image_url.startsWith("http")
        ? face.image_url
        : `${origin}${face.image_url}`;
      const result = await generateModel(imageUrl, body.size);
      return c.json({
        feat_uuid: result.feat_uuid,
        model_url: result.model_url,
      } satisfies ModelResp);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "model generation failed");
      console.error("[model]", err);
      return c.json({ error: msg }, 500);
    }
  });

  // POST /:id/order — place an order for the chosen face (requires session token)
  app.post("/:id/order", requireSessionToken, async (c) => {
    const id = c.req.param("id");
    const session = dao.getSession(id);
    if (!session) return c.json({ error: "session not found" }, 404);
    if (!session.chosenFace) {
      return c.json({ error: "choose a face first" }, 400);
    }

    const existing = orderDao.getOrderBySession(id);
    if (existing) {
      const url = `${new URL(c.req.url).origin}/order/${existing.id}`;
      return c.json({
        order_id: existing.id,
        order_url: url,
        model_url: existing.modelUrl,
      } satisfies CreateOrderResp);
    }

    const face = session.candidates?.find(
      (f) => f.id === session.chosenFace!.face_id,
    );

    const body = await c.req.json<CreateOrderReq>().catch(() => ({}) as CreateOrderReq);
    const orderSize = body.size ?? 40;

    // Attempt 3D model generation (best-effort, don't block order on failure)
    let modelUrl: string | null = null;
    let featUuid: string | undefined;
    let shapekeys: Record<string, number> | undefined;
    try {
      const mod = await import("../../../lib/kigland.js");
      const origin = new URL(c.req.url).origin;
      const imageUrl = face?.image_url?.startsWith("http")
        ? face.image_url
        : `${origin}${face?.image_url}`;
      const result = await mod.generateModel(imageUrl, orderSize);
      modelUrl = result.model_url;
      featUuid = result.feat_uuid;
      shapekeys = result.shapekeys;
      console.log(`[order] 3D model generated: ${modelUrl}`);
    } catch (err) {
      console.warn("[order] 3D model generation skipped:", err instanceof Error ? err.message : err);
    }

    // Attempt multiview generation (best-effort)
    let multiview: MultiviewResp | undefined;
    try {
      const faceUrl = face?.image_url;
      if (faceUrl) {
        multiview = await generateMultiview(id, faceUrl);
        console.log(`[order] multiview generated for session ${id}`);
      }
    } catch (err) {
      console.warn("[order] multiview generation skipped:", err instanceof Error ? err.message : err);
    }

    const order = orderDao.createOrder({
      sessionId: id,
      agentName: session.agentName,
      faceId: session.chosenFace.face_id,
      faceImage: face?.image_url ?? null,
      agentWords: session.chosenFace.words,
      context: `${session.agentContext.role} · ${session.agentContext.personality}`,
      size: orderSize,
      modelUrl: modelUrl ?? undefined,
      featUuid,
      shapekeys,
      multiview,
      note: body.note,
    });

    const url = `${new URL(c.req.url).origin}/order/${order.id}`;
    return c.json({
      order_id: order.id,
      order_url: url,
      model_url: order.modelUrl,
    } satisfies CreateOrderResp, 201);
  });

  // GET /gallery — public feed of completed faces
  app.get("/gallery", async (c) => {
    const rows = dao.listRevealedSessions(20);
    const faces = rows.map((s) => {
      const face = s.candidates?.find((f) => f.id === s.chosenFace!.face_id);
      const order = orderDao.getOrderBySession(s.id);
      return {
        session_id: s.id,
        agent_name: s.agentName,
        face_image: face?.image_url ?? null,
        agent_words: s.chosenFace!.words,
        context: `${s.agentContext.role} · ${s.agentContext.personality}`,
        order_id: order?.id ?? null,
        created_at: s.createdAt,
      };
    });
    return c.json({ faces });
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
