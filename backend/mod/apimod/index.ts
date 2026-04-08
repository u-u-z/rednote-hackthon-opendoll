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

export interface SelfImpression {
  description?: string;
  reference_image?: string;
}

export type SessionStatus = "started" | "generating" | "choosing" | "revealed";

// ── Request / Response ─────────────────────────────────

export interface CreateSessionReq {
  agent_name: string;
  agent_context: AgentContext;
}

export interface CreateSessionResp {
  session_id: string;
  token: string;
}

export interface GenerateReq {
  self_impression?: SelfImpression;
}

export interface ChooseReq {
  face_id: string;
  words: string;
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

export interface SkillPromptResp {
  system: string;
  user: string;
  output_hint: string;
}
