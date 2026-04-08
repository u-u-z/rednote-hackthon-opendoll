import { Hono } from "hono";
import { cors } from "hono/cors";
import fs from "node:fs";
import path from "node:path";
import { cfg } from "../shared/index.js";
import { sessionRoutes } from "./session/handler/index.js";

export function createApp(): Hono {
  const app = new Hono();

  app.use("/api/*", cors());

  app.route("/api/session", sessionRoutes());

  app.get("/api/images/:filename", async (c) => {
    const filename = c.req.param("filename");
    if (/[^a-zA-Z0-9._\-]/.test(filename)) {
      return c.json({ error: "invalid filename" }, 400);
    }
    const filepath = path.join(cfg().dataDir, "images", filename);
    if (!fs.existsSync(filepath)) {
      return c.json({ error: "not found" }, 404);
    }
    const data = fs.readFileSync(filepath);
    return new Response(data, {
      headers: { "Content-Type": "image/png" },
    });
  });

  app.get("/api/health", (c) => c.json({ status: "ok" }));

  return app;
}
