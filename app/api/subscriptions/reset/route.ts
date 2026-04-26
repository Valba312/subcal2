import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/server/auth";
import { DEFAULT_SUBSCRIPTIONS } from "../../../../lib/subscriptions";

export async function POST() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$transaction([
    prisma.subscription.deleteMany({
      where: {
        userId: user.id,
      },
    }),
    prisma.subscription.createMany({
      data: DEFAULT_SUBSCRIPTIONS.map((subscription) => ({
        userId: user.id,
        name: subscription.name,
        cost: subscription.cost,
        currency: subscription.currency,
        months: subscription.months,
        frequencyLabel: subscription.frequencyLabel,
        nextPaymentDate: new Date(subscription.nextPaymentDate),
      })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
