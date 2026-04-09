import { Hono } from "hono";
import type { OrderDetailResp } from "../../../mod/apimod/index.js";
import * as dao from "../dao/index.js";

export function orderRoutes(): Hono {
  const app = new Hono();

  // GET /:orderId — public order detail (for the human's browser)
  app.get("/:orderId", async (c) => {
    const orderId = c.req.param("orderId");
    const order = dao.getOrder(orderId);
    if (!order) return c.json({ error: "order not found" }, 404);

    return c.json({
      order_id: order.id,
      agent_name: order.agentName,
      face_image: order.faceImage,
      agent_words: order.agentWords,
      context: order.context,
      size: order.size,
      price: order.price,
      currency: order.currency,
      model_url: order.modelUrl,
      status: order.status,
      note: order.note,
      created_at: order.createdAt,
    } satisfies OrderDetailResp);
  });

  return app;
}
