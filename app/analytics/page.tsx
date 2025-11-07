"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BarChart3, CalendarDays, LineChart, Sparkles, TrendingUp } from "lucide-react";
import { computeSubscriptionAnalytics } from "../../lib/subscription-analytics";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import {
  capitalizeFirstLetter,
  dayMonthFormatter,
  formatDaysLeft,
  formatDifference,
  formatMoney,
  monthFormatter,
} from "../../lib/subscriptions";

export default function AnalyticsPage() {
  const { subscriptions, resetToDefaults } = useSubscriptions();
  const analytics = useMemo(
    () => computeSubscriptionAnalytics(subscriptions),
    [subscriptions]
  );

  const hasSubscriptions = subscriptions.length > 0;
  const earliestUpcoming = analytics.upcomingPayments[0] ?? null;
  const topSubscription = analytics.topSubscriptions[0] ?? null;
  const topSubscriptionNextPayment = topSubscription
    ? analytics.nextPaymentDetails[topSubscription.subscription.id]
    : null;
  const averageSummary = Object.entries(analytics.averageMonthlyPerSubscription)
    .map(([currency, value]) => `${formatMoney(value)} ${currency}`)
    .join(" • ");
  const currencyCards = analytics.currencies.filter(
    (currency) => (analytics.monthlyTotals[currency] ?? 0) > 0
  );
  const frequencyMax = analytics.frequencyDistribution.reduce(
    (max, item) => Math.max(max, item.monthlyTotal),
    0
  );
  const calendarPreview = analytics.calendar.slice(0, 10);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-10 dark:from-slate-950 dark:to-slate-900">
      <div className="container flex max-w-6xl flex-col gap-8">
        <header className="space-y-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Аналитика подписок
              </h1>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Прогнозы расходов, календари оплат и распределение по периодам — всё здесь. Данные
                синхронизируются с калькулятором.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <LineChart className="h-4 w-4" aria-hidden />
                Вернуться в калькулятор
              </Link>
              <button
                type="button"
                onClick={resetToDefaults}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-сlate-800"
              >
                Сбросить на демо-данные
              </button>
            </div>
          </div>
        </header>

        {!hasSubscriptions ? (
          <section className="rounded-3xl border border-dashed border-slate-300/70 bg-white/80 p-10 text-center shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-100">
              Пока нет данных для анализа
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Добавьте подписки в калькулятор или восстановите демо-набор, чтобы построить отчёты.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                Открыть калькулятор
              </Link>
              <button
                type="button"
                onClick={resetToDefaults}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                Загрузить демо
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                  <div>
                    <p className="text-xs uppercase text-slate-400">Активных подписок</p>
                    <p className="text-2xl font-semibold text-slate-700 dark:text-slate-100">
                      {subscriptions.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-сlate-700/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-primary" aria-hidden />
                  <div className="flex-1">
                    <p className="text-xs uppercase text-slate-400">Ближайший платёж</p>
                    {earliestUpcoming ? (
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                        {capitalizeFirstLetter(dayMonthFormatter.format(earliestUpcoming.nextDate))} ·{" "}
                        {formatDaysLeft(earliestUpcoming.daysLeft)}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Не ожидается в ближайшие 30 дней
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
                  <div className="flex-1">
                    <p className="text-xs uppercase text-slate-400">Средний чек в месяц</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-сlate-100">
                      {averageSummary || "—"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
                  <div className="flex-1">
                    <p className="text-xs uppercase text-slate-400">Лидер расходов</p>
                    {topSubscription ? (
                      <>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                          {topSubscription.subscription.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatMoney(topSubscription.monthlyCost)}{" "}
                          {topSubscription.subscription.currency} / мес
                          {topSubscriptionNextPayment
                            ? ` · ${formatDaysLeft(topSubscriptionNextPayment.daysLeft)}`
                            : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Нет данных</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                Итоги по валютам
              </h2>
              <div className="grid gap-4 см:grid-cols-2 xl:grid-cols-3">
                {currencyCards.map((currency) => (
                  <div
                    key={currency}
                    className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60"
                  >
                    <p className="text-xs uppercase text-slate-400">{currency}</p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>30 дней</span>
                        <span className="font-semibold">
                          {formatMoney(analytics.monthlyTotals[currency] ?? 0)} {currency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>90 дней</span>
                        <span className="font-semibold">
                          {formatMoney(analytics.quarterlyTotals[currency] ?? 0)} {currency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>365 дней</span>
                        <span className="font-semibold">
                          {formatMoney(analytics.yearlyTotals[currency] ?? 0)} {currency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Распределение по периодам
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Суммы пересчитаны в ежемесячный эквивалент и отсортированы по вкладу в бюджет.
                  </p>
                </div>
                {analytics.frequencyDistribution.length === 0 ? (
                  <p className="text-sm text-сlate-500 dark:text-slate-400">
                    Добавьте подписки, чтобы увидеть распределение.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.frequencyDistribution.map((bucket) => {
                      const width =
                        frequencyMax > 0 ? Math.max(8, (bucket.monthlyTotal / frequencyMax) * 100) : 0;
                      return (
                        <div
                          key={bucket.label}
                          className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-700/70"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                              {bucket.label}
                            </p>
                            <span className="text-xs uppercase text-slate-400 dark:text-slate-500">
                              {bucket.count} шт.
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/50">
                              <div
                                className="absolute left-0 top-0 h-full rounded-full bg-primary/80"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <div className="w-32 text-right text-xs text-slate-500 dark:text-slate-400">
                              {Object.entries(bucket.totals)
                                .map(([currency, value]) => `${formatMoney(value)} ${currency}`)
                                .join(" • ")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Топ расходов
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Пять подписок с наибольшей ежемесячной нагрузкой.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {analytics.topSubscriptions.slice(0, 5).map((item, index) => {
                    const nextPayment = analytics.nextPaymentDetails[item.subscription.id];
                    return (
                      <div
                        key={item.subscription.id}
                        className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-700/70"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                              #{index + 1}
                            </p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                              {item.subscription.name}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                            {formatMoney(item.monthlyCost)} {item.subscription.currency} / мес
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Полная стоимость: {formatMoney(item.subscription.cost)}{" "}
                          {item.subscription.currency} · {item.subscription.frequencyLabel}
                          {nextPayment
                            ? ` · ${capitalizeFirstLetter(
                                dayMonthFormatter.format(nextPayment.date)
                              )}`
                            : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Сравнение периодов по валютам
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Видно, как краткосрочные траты масштабируются до квартала и года.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                  <thead className="bg-slate-100/70 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Валюта</th>
                      <th className="px-4 py-3">30 дней</th>
                      <th className="px-4 py-3">90 дней</th>
                      <th className="px-4 py-3">365 дней</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {analytics.periodComparison.map((item) => (
                      <tr key={item.currency} className="text-slate-600 dark:text-slate-300">
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-100">
                          {item.currency}
                        </td>
                        <td className="px-4 py-3">
                          {formatMoney(item.month)} {item.currency}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {formatMoney(item.quarter)} {item.currency}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDifference(item.quarterDiff, item.currency)} к месяцу
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {formatMoney(item.year)} {item.currency}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDifference(item.yearDiff, item.currency)} к месяцу
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-сlate-200">
                      Прогноз расходов на 6 месяцев
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Помогает увидеть пики выплат и спланировать буфер.
                    </p>
                  </div>
                </div>
                {analytics.monthlyForecast.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Недостаточно данных для построения прогноза.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {analytics.monthlyForecast.map((month) => (
                      <div key={month.key} className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                          {capitalizeFirstLetter(monthFormatter.format(month.date))}
                        </p>
                        <div className="space-y-2">
                          {Object.entries(month.totals).map(([currency, value]) => {
                            if (value <= 0) {
                              return null;
                            }
                            const maxValue = analytics.maxTotalsByCurrency[currency] ?? value;
                            const width = maxValue > 0 ? Math.max(10, (value / maxValue) * 100) : 0;
                            return (
                              <div
                                key={`${month.key}-${currency}`}
                                className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                              >
                                <span className="w-12 text-xs uppercase text-slate-400 dark:text-slate-500">
                                  {currency}
                                </span>
                                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/50">
                                  <div
                                    className="absolute left-0 top-0 h-full rounded-full bg-primary/80"
                                    style={{ width: `${width}%` }}
                                  />
                                </div>
                                <span className="w-24 text-right font-semibold text-slate-700 dark:text-slate-100">
                                  {formatMoney(value)} {currency}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Ближайшие 30 дней
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Календарь списаний, который требует внимания в первую очередь.
                  </p>
                </div>
                {analytics.upcomingPayments.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    В ближайшие 30 дней платежей не ожидается.
                  </p>
                ) : (
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {analytics.upcomingPayments.map((payment) => (
                      <li
                        key={payment.id}
                        className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-700/70"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-сlate-700 dark:text-slate-100">
                            {payment.name}
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-100">
                            {formatMoney(payment.cost)} {payment.currency}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {capitalizeFirstLetter(dayMonthFormatter.format(payment.nextDate))} ·{" "}
                          {formatDaysLeft(payment.daysLeft)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-primary" aria-hidden />
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Календарь оплат на 60 дней
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-сlate-400">
                    Показываем до 10 ближайших дат. Повторяющиеся платежи будут подсвечены группами.
                  </p>
                </div>
              </div>
              {calendarPreview.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Нет запланированных платежей в горизонте 60 дней.
                </p>
              ) : (
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {calendarPreview.map((entry) => (
                    <div
                      key={entry.date.toISOString()}
                      className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-700/70"
                    >
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                        {capitalizeFirstLetter(dayMonthFormatter.format(entry.date))}
                      </p>
                      <div className="mt-2 space-y-2">
                        {entry.items.map((item) => (
                          <div
                            key={`${entry.date.toISOString()}-${item.id}`}
                            className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400"
                          >
                            <span>{item.name}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-100">
                              {formatMoney(item.cost)} {item.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
