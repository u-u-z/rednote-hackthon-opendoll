import type { SessionStatus, Session } from "../apimod/index.js";

export interface SessionRow {
  id: string;
  agent_name: string;
  agent_context: string;
  candidates: string | null;
  thinking: string | null;
  chosen_face: string | null;
  status: string;
  created_at: string;
}

export function rowToSession(row: SessionRow): Session {
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
