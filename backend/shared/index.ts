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
  openaiApiKey: string;
  openaiBaseUrl: string;
  openaiModel: string;
  dataDir: string;
}

let _config: Config;
let _orm: ReturnType<typeof drizzle>;

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
    openaiApiKey: env("OPENAI_API_KEY"),
    openaiBaseUrl: env("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    openaiModel: env("OPENAI_MODEL", "gpt-4o"),
    dataDir: path.resolve("data"),
  };

  fs.mkdirSync(path.join(_config.dataDir, "images"), { recursive: true });

  const dbPath = path.join(_config.dataDir, "opendoll.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  _orm = drizzle(sqlite, { schema });

  console.log("[shared] initialized");
}
