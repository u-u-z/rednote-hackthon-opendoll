import { eq, desc, isNotNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { orm } from "../../../shared/index.js";
import { sessions } from "../../../mod/dbmod/schema.js";
import type { AgentContext, CandidateFace, ChosenFace } from "../../../mod/apimod/index.js";

export function createSession(agentName: string, ctx: AgentContext, tokenHash: string) {
  const id = `sess_${nanoid(12)}`;
  orm().insert(sessions).values({
    id,
    agentName,
    agentContext: ctx,
    tokenHash,
  }).run();
  return getSession(id)!;
}

export function getSession(id: string) {
  return orm().select().from(sessions).where(eq(sessions.id, id)).get();
}

export function updateCandidates(id: string, candidates: CandidateFace[]) {
  orm()
    .update(sessions)
    .set({ candidates, status: "generating" })
    .where(eq(sessions.id, id))
    .run();
}


export function updateChosenFace(id: string, face: ChosenFace) {
  orm()
    .update(sessions)
    .set({ chosenFace: face, status: "revealed" })
    .where(eq(sessions.id, id))
    .run();
}

export function listRevealedSessions(limit = 20) {
  return orm()
    .select()
    .from(sessions)
    .where(isNotNull(sessions.chosenFace))
    .orderBy(desc(sessions.createdAt))
    .limit(limit)
    .all();
}
