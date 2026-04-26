import { NextResponse } from "next/server";

import { requireAdmin } from "../../../../../lib/server/admin";
import { resolveClientError } from "../../../../../lib/server/admin-data";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid error id" }, { status: 400 });
  }

  const errors = await resolveClientError(id);
  return NextResponse.json({ errors });
}
