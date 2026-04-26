import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/server/auth";
import { getDateInputValue, isValidDate } from "../../../lib/subscriptions";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({
    subscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      name: subscription.name,
      cost: subscription.cost,
      currency: subscription.currency,
      months: subscription.months,
      frequencyLabel: subscription.frequencyLabel,
      nextPaymentDate: getDateInputValue(subscription.nextPaymentDate),
    })),
  });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const cost = typeof body.cost === "number" ? body.cost : Number(body.cost);
    const currency = typeof body.currency === "string" ? body.currency : "";
    const months = typeof body.months === "number" ? body.months : Number(body.months);
    const frequencyLabel = typeof body.frequencyLabel === "string" ? body.frequencyLabel : "";
    const nextPaymentDate = typeof body.nextPaymentDate === "string" ? new Date(body.nextPaymentDate) : new Date("");

    if (!name) {
      return NextResponse.json({ error: "Укажите название подписки." }, { status: 400 });
    }

    if (!Number.isFinite(cost) || cost <= 0) {
      return NextResponse.json({ error: "Стоимость должна быть больше нуля." }, { status: 400 });
    }

    if (!Number.isInteger(months) || months <= 0) {
      return NextResponse.json({ error: "Период оплаты указан некорректно." }, { status: 400 });
    }

    if (!frequencyLabel) {
      return NextResponse.json({ error: "Не удалось определить тип подписки." }, { status: 400 });
    }

    if (!isValidDate(nextPaymentDate)) {
      return NextResponse.json({ error: "Укажите корректную дату следующего платежа." }, { status: 400 });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        name,
        cost,
        currency,
        months,
        frequencyLabel,
        nextPaymentDate,
      },
    });

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        name: subscription.name,
        cost: subscription.cost,
        currency: subscription.currency,
        months: subscription.months,
        frequencyLabel: subscription.frequencyLabel,
        nextPaymentDate: getDateInputValue(subscription.nextPaymentDate),
      },
    });
  } catch (error) {
    console.error("Create subscription error", error);
    return NextResponse.json({ error: "Не удалось сохранить подписку." }, { status: 500 });
  }
}
