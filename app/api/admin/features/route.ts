import { NextResponse } from "next/server";

import { requireAdmin } from "../../../../lib/server/admin";
import { updateFeatureFlag } from "../../../../lib/server/admin-data";

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const key = typeof body.key === "string" ? body.key : "";
  const enabled = Boolean(body.enabled);

  if (!key) {
    return NextResponse.json({ error: "Feature key is required" }, { status: 400 });
  }

  const features = await updateFeatureFlag(key, enabled);
  return NextResponse.json({ features });
}
