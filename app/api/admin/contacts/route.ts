import { NextResponse } from "next/server";

import { requireAdmin } from "../../../../lib/server/admin";
import { createContact } from "../../../../lib/server/admin-data";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const value = typeof body.value === "string" ? body.value.trim() : "";
  const href = typeof body.href === "string" && body.href.trim() ? body.href.trim() : null;

  if (!title || !value) {
    return NextResponse.json({ error: "Название и контакт обязательны" }, { status: 400 });
  }

  const contacts = await createContact({ title, value, href });
  return NextResponse.json({ contacts });
}
