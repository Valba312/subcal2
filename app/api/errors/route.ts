import { NextResponse } from "next/server";

import { recordClientError } from "../../../lib/server/admin-data";
import { getCurrentUser } from "../../../lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await getCurrentUser();
    const message = typeof body.message === "string" ? body.message.slice(0, 2000) : "Unknown client error";
    const stack = typeof body.stack === "string" ? body.stack.slice(0, 8000) : null;
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : null;
    const userAgent = typeof body.userAgent === "string" ? body.userAgent.slice(0, 500) : null;
    const severity = typeof body.severity === "string" ? body.severity.slice(0, 50) : "critical";

    await recordClientError({
      message,
      stack,
      path,
      userAgent,
      severity,
      userId: user?.id ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Record client error failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
