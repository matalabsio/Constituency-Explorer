import fs from "node:fs";
import path from "node:path";
import { dataDir, snapshotAbs } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".csv": "text/csv; charset=utf-8",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params;
  const relative = segments.join("/");
  const abs = snapshotAbs(relative);
  if (!abs || !fs.existsSync(abs)) {
    return NextResponse.json({ error: "snapshot not found" }, { status: 404 });
  }
  const root = path.resolve(dataDir());
  if (!abs.startsWith(root + path.sep)) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }
  const ext = path.extname(abs).toLowerCase();
  const body = fs.readFileSync(abs);
  return new NextResponse(body, {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
