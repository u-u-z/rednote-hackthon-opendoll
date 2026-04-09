import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { orm } from "../../../shared/index.js";
import { orders } from "../../../mod/dbmod/schema.js";

interface CreateOrderOpts {
  sessionId: string;
  agentName: string;
  faceId: string;
  faceImage: string | null;
  agentWords: string;
  context: string;
  size?: number;
  modelUrl?: string;
  featUuid?: string;
  shapekeys?: Record<string, number>;
  multiview?: { front: string; left: string; back: string };
  note?: string;
}

export function createOrder(opts: CreateOrderOpts) {
  const id = `ord_${nanoid(12)}`;
  orm()
    .insert(orders)
    .values({
      id,
      sessionId: opts.sessionId,
      agentName: opts.agentName,
      faceId: opts.faceId,
      faceImage: opts.faceImage,
      agentWords: opts.agentWords,
      context: opts.context,
      size: opts.size ?? 40,
      modelUrl: opts.modelUrl,
      featUuid: opts.featUuid,
      shapekeys: opts.shapekeys ? JSON.stringify(opts.shapekeys) : undefined,
      multiview: opts.multiview ? JSON.stringify(opts.multiview) : undefined,
      note: opts.note,
    })
    .run();
  return getOrder(id)!;
}

export function getOrder(id: string) {
  return orm().select().from(orders).where(eq(orders.id, id)).get();
}

export function getOrderBySession(sessionId: string) {
  return orm()
    .select()
    .from(orders)
    .where(eq(orders.sessionId, sessionId))
    .get();
}
