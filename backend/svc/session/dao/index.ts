import { nanoid } from "nanoid";
import { db } from "../../../shared/index.js";
import type { Session, AgentContext, CandidateFace, ChosenFace } from "../../../mod/apimod/index.js";
import { type SessionRow, rowToSession } from "../../../mod/dbmod/index.js";

export function createSession(agentName: string, ctx: AgentContext, tokenHash: string): Session {
  const id = `sess_${nanoid(12)}`;
  db()
    .prepare("INSERT INTO sessions (id, agent_name, agent_context, token_hash) VALUES (?, ?, ?, ?)")
    .run(id, agentName, JSON.stringify(ctx), tokenHash);
  return getSession(id)!;
}

export function getSession(id: string): Session | null {
  const row = db()
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .get(id) as SessionRow | undefined;
  return row ? rowToSession(row) : null;
}

export function updateCandidates(id: string, candidates: CandidateFace[]): void {
  db()
    .prepare("UPDATE sessions SET candidates = ?, status = 'generating' WHERE id = ?")
    .run(JSON.stringify(candidates), id);
}

export function updateThinking(id: string, thinking: string): void {
  db()
    .prepare("UPDATE sessions SET thinking = ?, status = 'thinking' WHERE id = ?")
    .run(thinking, id);
}

export function updateChosenFace(id: string, face: ChosenFace): void {
  db()
    .prepare("UPDATE sessions SET chosen_face = ?, status = 'revealed' WHERE id = ?")
    .run(JSON.stringify(face), id);
}
