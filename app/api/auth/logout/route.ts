import { NextResponse } from "next/server";

import { clearSessionCookie, removeCurrentSession } from "../../../../lib/server/auth";

export async function POST() {
  try {
    await removeCurrentSession();
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("Logout error", error);
    const response = NextResponse.json({ error: "Не удалось завершить сессию." }, { status: 500 });
    clearSessionCookie(response);
    return response;
  }
}
