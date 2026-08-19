import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const BUNDLED_DIR = path.join(process.cwd(), "data");
const BUNDLED_DB = path.join(BUNDLED_DIR, "kurupam.db");

export function dataDir(): string {
  if (process.env.KURUPAM_DATA_DIR) return process.env.KURUPAM_DATA_DIR;
  if (fs.existsSync(/* turbopackIgnore: true */ BUNDLED_DB)) return BUNDLED_DIR;
  return path.join(process.cwd(), "..", "data");
}

export function dbFile(): string {
  if (process.env.KURUPAM_DB_PATH) return process.env.KURUPAM_DB_PATH;
  return path.join(dataDir(), "kurupam.db");
}

export function isSqliteReadonly(): boolean {
  return process.env.VERCEL === "1" || process.env.SQLITE_READONLY === "1";
}

let cached: Database.Database | null = null;

export function getDb(): Database.Database | null {
  const file = dbFile();
  if (!fs.existsSync(/* turbopackIgnore: true */ file)) {
    return null;
  }
  if (!cached) {
    cached = new Database(file, {
      fileMustExist: true,
      readonly: isSqliteReadonly(),
    });
    cached.pragma("foreign_keys = ON");
  }
  return cached;
}

export function snapshotAbs(relativePath: string): string | null {
  if (!relativePath || relativePath.includes("..")) {
    return null;
  }
  const root = path.resolve(/* turbopackIgnore: true */ dataDir());
  const abs = path.resolve(/* turbopackIgnore: true */ root, relativePath);
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    return null;
  }
  return abs;
}
