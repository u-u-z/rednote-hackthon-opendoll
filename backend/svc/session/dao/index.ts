import { nanoid } from "nanoid";
import {
  db,
  type Session,
  type SessionStatus,
  type AgentContext,
  type CandidateFace,
  type ChosenFace,
} from "../../../shared/index.js";

interface SessionRow {
  id: string;
  agent_name: string;
  agent_context: string;
  candidates: string | null;
  thinking: string | null;
  chosen_face: string | null;
  status: string;
  created_at: string;
}

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    agent_name: row.agent_name,
    agent_context: JSON.parse(row.agent_context),
    candidates: row.candidates ? JSON.parse(row.candidates) : null,
    thinking: row.thinking,
    chosen_face: row.chosen_face ? JSON.parse(row.chosen_face) : null,
    status: row.status as SessionStatus,
    created_at: row.created_at,
  };
}

export function createSession(agentName: string, ctx: AgentContext): Session {
  const id = `sess_${nanoid(12)}`;
  db()
    .prepare("INSERT INTO sessions (id, agent_name, agent_context) VALUES (?, ?, ?)")
    .run(id, agentName, JSON.stringify(ctx));
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
