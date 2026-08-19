import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export function dataDir(): string {
  return process.env.KURUPAM_DATA_DIR ?? path.resolve(process.cwd(), "..", "data");
}

export function dbFile(): string {
  return process.env.KURUPAM_DB_PATH ?? path.join(dataDir(), "kurupam.db");
}

let cached: Database.Database | null = null;

export function getDb(): Database.Database | null {
  const file = dbFile();
  if (!fs.existsSync(file)) {
    return null;
  }
  if (!cached) {
    cached = new Database(file, { fileMustExist: true });
    cached.pragma("foreign_keys = ON");
  }
  return cached;
}

export function snapshotAbs(relativePath: string): string | null {
  if (!relativePath || relativePath.includes("..")) {
    return null;
  }
  const abs = path.resolve(dataDir(), relativePath);
  const root = path.resolve(dataDir());
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    return null;
  }
  return abs;
}
