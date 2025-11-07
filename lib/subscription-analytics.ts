import {
  MS_PER_DAY,
  Subscription,
  addDays,
  addMonths,
  getNextPaymentDate,
  startOfMonth,
} from "./subscriptions";

export type PeriodComparisonItem = {
  currency: string;
  month: number;
  quarter: number;
  year: number;
  quarterDiff: number;
  yearDiff: number;
};

export type UpcomingPayment = {
  id: number;
  name: string;
  currency: string;
  cost: number;
  nextDate: Date;
  daysLeft: number;
};

export type ForecastMonth = {
  date: Date;
  totals: Record<string, number>;
  key: string;
};

export type FrequencyDistributionItem = {
  label: string;
  count: number;
  totals: Record<string, number>;
  monthlyTotal: number;
};

export type CalendarEntry = {
  date: Date;
  totals: Record<string, number>;
  items: Array<{ id: number; name: string; currency: string; cost: number }>;
};

export type TopSubscription = {
  subscription: Subscription;
  monthlyCost: number;
};

export type SubscriptionAnalytics = {
  currencies: string[];
  monthlyTotals: Record<string, number>;
  quarterlyTotals: Record<string, number>;
  yearlyTotals: Record<string, number>;
  periodComparison: PeriodComparisonItem[];
  monthlyForecast: ForecastMonth[];
  maxTotalsByCurrency: Record<string, number>;
  highestMonthByCurrency: Record<string, { date: Date; total: number }>;
  upcomingPayments: UpcomingPayment[];
  nextPaymentDetails: Record<number, { date: Date; daysLeft: number } | null>;
  frequencyDistribution: FrequencyDistributionItem[];
  topSubscriptions: TopSubscription[];
  averageMonthlyPerSubscription: Record<string, number>;
  calendar: CalendarEntry[];
  subscriptionCountByCurrency: Record<string, number>;
};

export function computeSubscriptionAnalytics(
  subscriptions: Subscription[]
): SubscriptionAnalytics {
  const monthlyTotals: Record<string, number> = {};
  const quarterlyTotals: Record<string, number> = {};
  const yearlyTotals: Record<string, number> = {};
  const subscriptionCountByCurrency: Record<string, number> = {};

  const frequencyDistributionMap = new Map<string, FrequencyDistributionItem>();
  const now = new Date();
  const forecastMonths = 6;
  const forecastStart = startOfMonth(now);
  const forecastHorizon = startOfMonth(addMonths(forecastStart, forecastMonths));
  const monthlyForecastBuckets = new Map<string, { date: Date; totals: Record<string, number> }>();
  const calendarHorizon = addDays(now, 60);
  const calendarMap = new Map<string, CalendarEntry>();

  for (let i = 0; i < forecastMonths; i += 1) {
    const monthDate = addMonths(forecastStart, i);
    const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
    monthlyForecastBuckets.set(key, { date: monthDate, totals: {} });
  }

  const nextPaymentDetails: Record<number, { date: Date; daysLeft: number } | null> = {};
  const upcomingThreshold = addDays(now, 30);
  const upcomingPayments: UpcomingPayment[] = [];
  const topSubscriptions: TopSubscription[] = [];

  subscriptions.forEach((subscription) => {
    const monthlyCost = subscription.cost / subscription.months;
    monthlyTotals[subscription.currency] =
      (monthlyTotals[subscription.currency] ?? 0) + monthlyCost;
    quarterlyTotals[subscription.currency] =
      (quarterlyTotals[subscription.currency] ?? 0) + monthlyCost * 3;
    yearlyTotals[subscription.currency] =
      (yearlyTotals[subscription.currency] ?? 0) + monthlyCost * 12;
    subscriptionCountByCurrency[subscription.currency] =
      (subscriptionCountByCurrency[subscription.currency] ?? 0) + 1;

    topSubscriptions.push({
      subscription,
      monthlyCost,
    });

    const frequencyBucket =
      frequencyDistributionMap.get(subscription.frequencyLabel) ??
      {
        label: subscription.frequencyLabel,
        count: 0,
        totals: {},
        monthlyTotal: 0,
      };
    frequencyBucket.count += 1;
    frequencyBucket.totals[subscription.currency] =
      (frequencyBucket.totals[subscription.currency] ?? 0) + monthlyCost;
    frequencyBucket.monthlyTotal += monthlyCost;
    frequencyDistributionMap.set(subscription.frequencyLabel, frequencyBucket);

    const nextDate = getNextPaymentDate(subscription, now);
    if (nextDate) {
      const daysLeft = Math.max(0, Math.ceil((nextDate.getTime() - now.getTime()) / MS_PER_DAY));
      nextPaymentDetails[subscription.id] = { date: nextDate, daysLeft };
      if (nextDate <= upcomingThreshold) {
        upcomingPayments.push({
          id: subscription.id,
          name: subscription.name,
          currency: subscription.currency,
          cost: subscription.cost,
          nextDate,
          daysLeft,
        });
      }
    } else {
      nextPaymentDetails[subscription.id] = null;
    }

    let forecastDate = getNextPaymentDate(subscription, forecastStart);
    while (forecastDate && forecastDate < forecastHorizon) {
      const bucketKey = `${forecastDate.getFullYear()}-${forecastDate.getMonth()}`;
      const bucket = monthlyForecastBuckets.get(bucketKey);
      if (bucket) {
        bucket.totals[subscription.currency] =
          (bucket.totals[subscription.currency] ?? 0) + subscription.cost;
      }
      forecastDate = addMonths(forecastDate, subscription.months);
    }

    let calendarDate = getNextPaymentDate(subscription, now);
    while (calendarDate && calendarDate <= calendarHorizon) {
      const key = calendarDate.toISOString().slice(0, 10);
      const entry =
        calendarMap.get(key) ??
        {
          date: new Date(calendarDate.getTime()),
          totals: {},
          items: [],
        };
      entry.totals[subscription.currency] =
        (entry.totals[subscription.currency] ?? 0) + subscription.cost;
      entry.items.push({
        id: subscription.id,
        name: subscription.name,
        currency: subscription.currency,
        cost: subscription.cost,
      });
      calendarMap.set(key, entry);
      calendarDate = addMonths(calendarDate, subscription.months);
    }
  });

  upcomingPayments.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
  topSubscriptions.sort((a, b) => b.monthlyCost - a.monthlyCost);

  const currencies = Array.from(
    new Set([
      ...Object.keys(monthlyTotals),
      ...subscriptions.map((subscription) => subscription.currency),
    ])
  );

  const periodComparison: PeriodComparisonItem[] = currencies.map((currency) => {
    const month = monthlyTotals[currency] ?? 0;
    const quarter = quarterlyTotals[currency] ?? 0;
    const year = yearlyTotals[currency] ?? 0;
    return {
      currency,
      month,
      quarter,
      year,
      quarterDiff: quarter - month,
      yearDiff: year - month,
    };
  });

  const monthlyForecast: ForecastMonth[] = Array.from(monthlyForecastBuckets.entries())
    .map(([key, bucket]) => ({
      key,
      date: bucket.date,
      totals: bucket.totals,
    }))
    .filter((bucket) => Object.values(bucket.totals).some((value) => value > 0));

  const maxTotalsByCurrency: Record<string, number> = {};
  const highestMonthByCurrency: Record<string, { date: Date; total: number }> = {};

  monthlyForecast.forEach((bucket) => {
    Object.entries(bucket.totals).forEach(([currency, total]) => {
      if (total <= 0) {
        return;
      }
      maxTotalsByCurrency[currency] = Math.max(maxTotalsByCurrency[currency] ?? 0, total);
      const current = highestMonthByCurrency[currency];
      if (!current || total > current.total) {
        highestMonthByCurrency[currency] = { date: bucket.date, total };
      }
    });
  });

  const frequencyDistribution = Array.from(frequencyDistributionMap.values()).sort(
    (a, b) => b.monthlyTotal - a.monthlyTotal
  );

  const averageMonthlyPerSubscription: Record<string, number> = {};
  Object.entries(subscriptionCountByCurrency).forEach(([currency, count]) => {
    if (count > 0) {
      averageMonthlyPerSubscription[currency] = (monthlyTotals[currency] ?? 0) / count;
    }
  });

  const calendar = Array.from(calendarMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return {
    currencies,
    monthlyTotals,
    quarterlyTotals,
    yearlyTotals,
    periodComparison,
    monthlyForecast,
    maxTotalsByCurrency,
    highestMonthByCurrency,
    upcomingPayments,
    nextPaymentDetails,
    frequencyDistribution,
    topSubscriptions,
    averageMonthlyPerSubscription,
    calendar,
    subscriptionCountByCurrency,
  };
}
