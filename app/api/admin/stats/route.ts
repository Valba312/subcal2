import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/server/admin";
import { getAllContacts, getClientErrors, getFeatureFlags } from "../../../../lib/server/admin-data";
import { getDateInputValue } from "../../../../lib/subscriptions";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, subscriptions, activeSessions, features, contacts, errors] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
            sessions: true,
          },
        },
      },
    }),
    prisma.subscription.findMany({
      orderBy: {
        nextPaymentDate: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.session.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
    }),
    getFeatureFlags(),
    getAllContacts(),
    getClientErrors(20),
  ]);

  const monthlyTotals = subscriptions.reduce<Record<string, number>>((totals, subscription) => {
    totals[subscription.currency] = (totals[subscription.currency] ?? 0) + subscription.cost / subscription.months;
    return totals;
  }, {});

  const subscriptionsByUser = users.map((user) => {
    const userSubscriptions = subscriptions.filter((subscription) => subscription.userId === user.id);
    const monthlyByCurrency = userSubscriptions.reduce<Record<string, number>>((totals, subscription) => {
      totals[subscription.currency] = (totals[subscription.currency] ?? 0) + subscription.cost / subscription.months;
      return totals;
    }, {});

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      subscriptionsCount: user._count.subscriptions,
      sessionsCount: user._count.sessions,
      monthlyByCurrency,
    };
  });

  return NextResponse.json({
    admin,
    totals: {
      users: users.length,
      subscriptions: subscriptions.length,
      activeSessions,
      monthlyTotals,
    },
    users: subscriptionsByUser,
    features,
    contacts,
    errors,
    recentSubscriptions: subscriptions.slice(0, 12).map((subscription) => ({
      id: subscription.id,
      name: subscription.name,
      cost: subscription.cost,
      currency: subscription.currency,
      months: subscription.months,
      frequencyLabel: subscription.frequencyLabel,
      nextPaymentDate: getDateInputValue(subscription.nextPaymentDate),
      user: subscription.user,
    })),
  });
}
