import { afterEach, describe, expect, it, vi } from "vitest";

import { computeSubscriptionAnalytics } from "../lib/subscription-analytics";
import type { Subscription } from "../lib/subscriptions";

const subscription = (overrides: Partial<Subscription>): Subscription => ({
  id: 1,
  name: "Base subscription",
  cost: 100,
  currency: "RUB",
  months: 1,
  frequencyLabel: "Monthly",
  nextPaymentDate: "2026-05-20",
  ...overrides,
});

describe("computeSubscriptionAnalytics", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("normalizes subscription costs and groups totals by currency", () => {
    vi.setSystemTime(new Date("2026-05-17T10:00:00.000Z"));

    const analytics = computeSubscriptionAnalytics([
      subscription({ id: 1, name: "Monthly", cost: 300, currency: "RUB", months: 1 }),
      subscription({
        id: 2,
        name: "Annual",
        cost: 1200,
        currency: "RUB",
        months: 12,
        frequencyLabel: "Yearly",
        nextPaymentDate: "2026-06-01",
      }),
      subscription({ id: 3, name: "Dollar", cost: 15, currency: "USD", months: 3 }),
    ]);

    expect(analytics.currencies).toEqual(["RUB", "USD"]);
    expect(analytics.monthlyTotals).toEqual({ RUB: 400, USD: 5 });
    expect(analytics.quarterlyTotals).toEqual({ RUB: 1200, USD: 15 });
    expect(analytics.yearlyTotals).toEqual({ RUB: 4800, USD: 60 });
    expect(analytics.subscriptionCountByCurrency).toEqual({ RUB: 2, USD: 1 });
    expect(analytics.averageMonthlyPerSubscription).toEqual({ RUB: 200, USD: 5 });
    expect(analytics.topSubscriptions.map((item) => item.subscription.name)).toEqual([
      "Monthly",
      "Annual",
      "Dollar",
    ]);
  });

  it("builds upcoming payments and calendar entries from the current date", () => {
    vi.setSystemTime(new Date("2026-05-17T10:00:00.000Z"));

    const analytics = computeSubscriptionAnalytics([
      subscription({ id: 1, name: "Soon", cost: 300, nextPaymentDate: "2026-05-20" }),
      subscription({ id: 2, name: "Tomorrow", cost: 100, nextPaymentDate: "2026-05-18" }),
      subscription({ id: 3, name: "Later", cost: 500, nextPaymentDate: "2026-07-30" }),
    ]);

    expect(analytics.upcomingPayments.map((payment) => payment.name)).toEqual(["Tomorrow", "Soon"]);
    expect(analytics.nextPaymentDetails[1]?.daysLeft).toBe(3);
    expect(analytics.nextPaymentDetails[2]?.daysLeft).toBe(1);
    expect(analytics.nextPaymentDetails[3]?.daysLeft).toBeGreaterThan(30);
    expect(analytics.calendar[0].items.map((item) => item.name)).toEqual(["Tomorrow"]);
    expect(analytics.calendar.some((entry) => entry.items.some((item) => item.name === "Later"))).toBe(false);
  });

  it("marks subscriptions with invalid payment dates as missing schedule details", () => {
    vi.setSystemTime(new Date("2026-05-17T10:00:00.000Z"));

    const analytics = computeSubscriptionAnalytics([
      subscription({ id: 1, nextPaymentDate: "not-a-date" }),
    ]);

    expect(analytics.nextPaymentDetails[1]).toBeNull();
    expect(analytics.upcomingPayments).toEqual([]);
    expect(analytics.calendar).toEqual([]);
  });
});
