export interface AgentContext {
  role: string;
  personality: string;
  relationship: string;
  style_hints: string;
}

export interface CandidateFace {
  id: string;
  image_url: string;
  style_hint: string;
}

export interface ChosenFace {
  face_id: string;
  words: string;
}

export type SessionStatus = "started" | "generating" | "thinking" | "revealed";

export interface Session {
  id: string;
  agent_name: string;
  agent_context: AgentContext;
  candidates: CandidateFace[] | null;
  thinking: string | null;
  chosen_face: ChosenFace | null;
  status: SessionStatus;
  created_at: string;
}

// ── Request / Response ─────────────────────────────────

export interface CreateSessionReq {
  agent_name: string;
  agent_context: AgentContext;
}

export interface CreateSessionResp {
  session_id: string;
}

export interface GenerateResp {
  candidates: CandidateFace[];
}

export interface FaceResp {
  agent_name: string;
  face_image: string | null;
  agent_words: string;
  context: string;
}
