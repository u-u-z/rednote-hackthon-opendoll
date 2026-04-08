import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";
import { orm } from "../shared/index.js";
import { sessions } from "../mod/dbmod/schema.js";

const TOKEN_PREFIX = "odtk_";
const TOKEN_BYTES = 32;

export function generateToken(): string {
  return TOKEN_PREFIX + crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function extractBearer(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export const requireSessionToken: MiddlewareHandler = async (c, next) => {
  const token = extractBearer(c.req.header("Authorization"));

  if (!token) {
    return c.json({ error: "missing or invalid Authorization header" }, 401);
  }

  if (!token.startsWith(TOKEN_PREFIX)) {
    return c.json({ error: "invalid token format" }, 401);
  }

  const hash = hashToken(token);
  const row = orm()
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.tokenHash, hash))
    .get();

  if (!row) {
    return c.json({ error: "invalid token" }, 401);
  }

  const sessionId = c.req.param("id");
  if (sessionId && row.id !== sessionId) {
    return c.json({ error: "token does not match session" }, 403);
  }

  await next();
};
