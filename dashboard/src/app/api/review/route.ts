import { updateReviewStatus } from "@/lib/queries";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id: number;
      status: string;
      classification?: string | null;
      note?: string | null;
    };
    updateReviewStatus(body.id, body.status, body.classification ?? null, body.note ?? null);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "review failed";
    const readonly = message.includes("read-only");
    return NextResponse.json(
      { error: message },
      { status: readonly ? 403 : 400 }
    );
  }
}
