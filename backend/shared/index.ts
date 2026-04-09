import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "../mod/dbmod/schema.js";

// ── Config ─────────────────────────────────────────────

export interface Config {
  port: number;
  geminiApiKey: string;
  geminiBaseUrl: string;
  geminiImageModel: string;
  dataDir: string;
}

let _config: Config;
let _orm: ReturnType<typeof drizzle>;

function ensureSchema(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      agent_name TEXT NOT NULL,
      agent_context TEXT NOT NULL,
      candidates TEXT,
      thinking TEXT,
      chosen_face TEXT,
      token_hash TEXT DEFAULT '' NOT NULL,
      status TEXT DEFAULT 'started' NOT NULL,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY NOT NULL,
      session_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      face_id TEXT NOT NULL,
      face_image TEXT,
      agent_words TEXT NOT NULL,
      context TEXT NOT NULL,
      size INTEGER DEFAULT 40 NOT NULL,
      price TEXT DEFAULT '998.00' NOT NULL,
      currency TEXT DEFAULT 'CNY' NOT NULL,
      model_url TEXT,
      status TEXT DEFAULT 'pending' NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL
    );
  `);

  // Backfill columns added after initial schema
  const addColumnIfMissing = (table: string, col: string, def: string) => {
    const cols = sqlite.pragma(`table_info(${table})`) as { name: string }[];
    if (!cols.some((c) => c.name === col)) {
      sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    }
  };
  addColumnIfMissing("orders", "model_url", "TEXT");
  addColumnIfMissing("orders", "feat_uuid", "TEXT");
  addColumnIfMissing("orders", "shapekeys", "TEXT");
}

export function cfg(): Config {
  if (!_config) throw new Error("call init() first");
  return _config;
}

export function orm() {
  if (!_orm) throw new Error("call init() first");
  return _orm;
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
    geminiBaseUrl: env("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com"),
    geminiImageModel: env("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-preview-04-17"),
    dataDir: path.resolve("data"),
  };

  fs.mkdirSync(path.join(_config.dataDir, "images"), { recursive: true });

  const dbPath = path.join(_config.dataDir, "opendoll.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  ensureSchema(sqlite);
  _orm = drizzle(sqlite, { schema });

  console.log("[shared] initialized");
}
