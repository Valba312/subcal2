import { NextResponse } from "next/server";

import { requireAdmin } from "../../../../../lib/server/admin";
import { deleteContact, updateContact } from "../../../../../lib/server/admin-data";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid contact id" }, { status: 400 });
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const value = typeof body.value === "string" ? body.value.trim() : "";
  const href = typeof body.href === "string" && body.href.trim() ? body.href.trim() : null;
  const isActive = Boolean(body.isActive);

  if (!title || !value) {
    return NextResponse.json({ error: "Название и контакт обязательны" }, { status: 400 });
  }

  const contacts = await updateContact(id, { title, value, href, isActive });
  return NextResponse.json({ contacts });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid contact id" }, { status: 400 });
  }

  const contacts = await deleteContact(id);
  return NextResponse.json({ contacts });
}
