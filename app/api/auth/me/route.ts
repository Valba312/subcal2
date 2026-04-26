import { NextResponse } from "next/server";

import { isAdminUser } from "../../../../lib/server/admin";
import { getCurrentUser } from "../../../../lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user: user ? { ...user, isAdmin: isAdminUser(user) } : null });
  } catch (error) {
    console.error("Me error", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
