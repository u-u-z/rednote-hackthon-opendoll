import { sql } from "drizzle-orm";
import { customType, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { AgentContext, CandidateFace, ChosenFace, OrderStatus, SessionStatus } from "../apimod/index.js";

const jsonText = <T>() =>
  customType<{ data: T; driverData: string }>({
    dataType() {
      return "text";
    },
    toDriver(value: T) {
      return JSON.stringify(value);
    },
    fromDriver(value: string) {
      return JSON.parse(value) as T;
    },
  });

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  agentName: text("agent_name").notNull(),
  agentContext: jsonText<AgentContext>()("agent_context").notNull(),
  candidates: jsonText<CandidateFace[]>()("candidates"),
  thinking: text("thinking"),
  chosenFace: jsonText<ChosenFace>()("chosen_face"),
  tokenHash: text("token_hash").notNull().default(""),
  status: text("status").$type<SessionStatus>().notNull().default("started"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  agentName: text("agent_name").notNull(),
  faceId: text("face_id").notNull(),
  faceImage: text("face_image"),
  agentWords: text("agent_words").notNull(),
  context: text("context").notNull(),
  size: integer("size").notNull().default(40),
  price: text("price").notNull().default("998.00"),
  currency: text("currency").notNull().default("CNY"),
  modelUrl: text("model_url"),
  featUuid: text("feat_uuid"),
  shapekeys: text("shapekeys"),
  multiview: text("multiview"),
  status: text("status").$type<OrderStatus>().notNull().default("pending"),
  note: text("note"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
