import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cfg } from "../shared/index.js";
import { sessionRoutes } from "./session/handler/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const distDir = path.resolve(__dirname, "../frontend/dist");

const MIME: Record<string, string> = {
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

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

  app.get("/:file{.+\\.(?:md|json|txt)$}", async (c) => {
    const file = c.req.param("file");
    if (/[^a-zA-Z0-9._\-\/]/.test(file)) {
      return c.json({ error: "invalid path" }, 400);
    }
    const filepath = path.join(publicDir, file);
    if (!filepath.startsWith(publicDir) || !fs.existsSync(filepath)) {
      return c.json({ error: "not found" }, 404);
    }
    const ext = path.extname(filepath);
    const data = fs.readFileSync(filepath, "utf-8");
    return new Response(data, {
      headers: { "Content-Type": MIME[ext] || "text/plain; charset=utf-8" },
    });
  });

  app.get("/api/health", (c) => c.json({ status: "ok" }));

  // ── Frontend static files (production) ──────────────
  if (fs.existsSync(distDir)) {
    app.use(
      "/assets/*",
      serveStatic({ root: "./frontend/dist" })
    );
    app.get("*", (c) => {
      const indexPath = path.join(distDir, "index.html");
      if (!fs.existsSync(indexPath)) {
        return c.json({ error: "frontend not built" }, 404);
      }
      const html = fs.readFileSync(indexPath, "utf-8");
      return c.html(html);
    });
  }

  return app;
}
