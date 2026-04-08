import { sql } from "drizzle-orm";
import { customType, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { AgentContext, CandidateFace, ChosenFace, SessionStatus } from "../apimod/index.js";

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
