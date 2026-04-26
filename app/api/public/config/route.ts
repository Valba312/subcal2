import { NextResponse } from "next/server";

import { getActiveContacts, getFeatureFlags } from "../../../../lib/server/admin-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [features, contacts] = await Promise.all([getFeatureFlags(), getActiveContacts()]);

  return NextResponse.json(
    {
      features,
      contacts,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
