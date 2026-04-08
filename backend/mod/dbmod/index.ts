import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { sessions } from "./schema.js";

export { sessions };
export type SessionRow = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;
