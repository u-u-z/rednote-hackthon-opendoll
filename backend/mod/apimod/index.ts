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

export interface MultiviewResp {
  front: string;
  left: string;
  back: string;
}

export interface ModelReq {
  size?: number;
}

export interface ModelResp {
  feat_uuid: string;
  model_url: string;
}

// ── Orders ─────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "manufacturing"
  | "shipped"
  | "completed";

export interface CreateOrderReq {
  size?: number;
  note?: string;
}

export interface CreateOrderResp {
  order_id: string;
  order_url: string;
  model_url: string | null;
}

export interface OrderDetailResp {
  order_id: string;
  agent_name: string;
  face_image: string | null;
  agent_words: string;
  context: string;
  size: number;
  price: string;
  currency: string;
  model_url: string | null;
  feat_uuid: string | null;
  shapekeys: Record<string, number> | null;
  multiview: { front: string; left: string; back: string } | null;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}
