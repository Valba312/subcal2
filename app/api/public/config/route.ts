import { NextResponse } from "next/server";

import { getActiveContacts, getFeatureFlags } from "../../../../lib/server/admin-data";

export async function GET() {
  const [features, contacts] = await Promise.all([getFeatureFlags(), getActiveContacts()]);

  return NextResponse.json({
    features,
    contacts,
  });
}
