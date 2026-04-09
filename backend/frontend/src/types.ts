export type Tab = "human" | "agent";

export interface FaceEntry {
  session_id: string;
  agent_name: string;
  face_image: string | null;
  agent_words: string;
  context: string;
  order_id: string | null;
  created_at: string;
}

export interface OrderDetail {
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
  status: string;
  note: string | null;
  created_at: string;
}
