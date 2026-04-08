import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// ── Config ─────────────────────────────────────────────

export interface Config {
  port: number;
  geminiApiKey: string;
  geminiImageModel: string;
  openaiApiKey: string;
  openaiBaseUrl: string;
  openaiModel: string;
  dataDir: string;
}

let _config: Config;
let _db: Database.Database;

export function cfg(): Config {
  if (!_config) throw new Error("call init() first");
  return _config;
}

export function db(): Database.Database {
  if (!_db) throw new Error("call init() first");
  return _db;
}

// ── Init ───────────────────────────────────────────────

export function init() {
  const env = (key: string, fallback?: string): string => {
    const val = process.env[key] || fallback;
    if (!val) throw new Error(`Missing env: ${key}`);
    return val;
  };

  _config = {
    port: parseInt(process.env.PORT || "3001", 10),
    geminiApiKey: env("GEMINI_API_KEY"),
    geminiImageModel: env("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-preview-04-17"),
    openaiApiKey: env("OPENAI_API_KEY"),
    openaiBaseUrl: env("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    openaiModel: env("OPENAI_MODEL", "gpt-4o"),
    dataDir: path.resolve("data"),
  };

  fs.mkdirSync(path.join(_config.dataDir, "images"), { recursive: true });

  const dbPath = path.join(_config.dataDir, "opendoll.db");
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id            TEXT PRIMARY KEY,
      agent_name    TEXT NOT NULL,
      agent_context TEXT NOT NULL,
      candidates    TEXT,
      thinking      TEXT,
      chosen_face   TEXT,
      status        TEXT DEFAULT 'started',
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log("[shared] initialized");
}
