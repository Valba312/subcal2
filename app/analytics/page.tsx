"use client";

import Link from "next/link";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { BarChart3, RefreshCw, Sparkles } from "lucide-react";

import { computeSubscriptionAnalytics } from "../../lib/subscription-analytics";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import {
  dayMonthFormatter,
  formatMoney,
  formatDaysLeft,
  monthFormatter,
} from "../../lib/subscriptions";

const TrendChart = dynamic(() => import("./_components/trend-chart").then((mod) => mod.TrendChart), {
  ssr: false,
  loading: () => <div className="mt-4 h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />,
});

const PieBreakdown = dynamic(() => import("./_components/pie-breakdown").then((mod) => mod.PieBreakdown), {
  ssr: false,
  loading: () => <div className="mt-4 h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />,
});

export default function AnalyticsPage() {
  const { subscriptions, resetToDefaults } = useSubscriptions();
  const analytics = useMemo(() => computeSubscriptionAnalytics(subscriptions), [subscriptions]);
  const hasSubscriptions = subscriptions.length > 0;

  const chartData = analytics.monthlyForecast.slice(0, 6).map((bucket) => ({
    month: monthFormatter.format(bucket.date),
    total: Object.values(bucket.totals).reduce((acc, value) => acc + value, 0),
  }));

  const pieData = analytics.currencies.map((currency) => ({
    name: currency,
    value: analytics.monthlyTotals[currency] ?? 0,
  }));

  const upcoming = analytics.upcomingPayments.slice(0, 4);
  const PIE_COLORS = ["#6366f1", "#22d3ee", "#f97316", "#14b8a6", "#ec4899"];

  return (
    <div className="bg-gradient-to-b from-white to-slate-50 py-10 dark:from-slate-950 dark:to-slate-900">
      <div className="container flex max-w-6xl flex-col gap-8">
        <header className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Отчёты SubKeeper</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Аналитика и прогнозы
              </h1>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Графики расходов, круговые диаграммы и календарь оплат помогают принимать решения заранее.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700/70 dark:text-slate-200"
              >
                <Sparkles className="h-4 w-4" aria-hidden /> Вернуться в калькулятор
              </Link>
              <button
                type="button"
                onClick={resetToDefaults}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700/70 dark:text-slate-200"
              >
                <RefreshCw className="h-4 w-4" aria-hidden /> Сбросить на демо-данные
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard title="Валюта" value={analytics.currencies.join(", ") || "—"} />
            <SummaryCard title="Всего подписок" value={subscriptions.length.toString()} />
            <SummaryCard
              title="Средний чек"
              value={
                Object.entries(analytics.averageMonthlyPerSubscription)
                  .map(([currency, value]) => `${formatMoney(value)} ${currency}`)
                  .join(" • ") || "—"
              }
            />
          </div>
        </header>

        {!hasSubscriptions ? (
          <section className="rounded-3xl border border-dashed border-slate-300/70 bg-white/80 p-10 text-center shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-100">Пока нет данных</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Добавьте подписки в калькулятор или загрузите демо-набор, чтобы построить отчёты.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/calculator" className="rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white">
                Открыть калькулятор
              </Link>
              <button
                type="button"
                onClick={resetToDefaults}
                className="rounded-2xl border border-slate-300/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700/70 dark:text-slate-200"
              >
                Загрузить демо
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Тренд расходов</h2>
                  <span className="text-xs uppercase text-slate-400">6 месяцев</span>
                </div>
                <TrendChart data={chartData} />
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Распределение по валютам</h2>
                <PieBreakdown data={pieData} colors={PIE_COLORS} />
                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      {entry.name}: <span className="font-semibold">{formatMoney(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ближайшие платежи</h2>
                  <span className="text-xs uppercase text-slate-400">30 дней</span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  {upcoming.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {dayMonthFormatter.format(item.nextDate)} · {formatDaysLeft(item.daysLeft)}
                        </p>
                      </div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">
                        {formatMoney(item.cost)} {item.currency}
                      </p>
                    </div>
                  ))}
                  {upcoming.length === 0 && <p className="text-slate-500 dark:text-slate-400">Нет списаний в ближайшие 30 дней.</p>}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Популярные периоды</h2>
                  <BarChart3 className="h-4 w-4 text-primary" aria-hidden />
                </div>
                <div className="mt-4 space-y-3">
                  {analytics.frequencyDistribution.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white">
                        <span>{item.label}</span>
                        <span>{item.count}×</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {Object.entries(item.totals)
                          .map(([currency, value]) => `${formatMoney(value)} ${currency}`)
                          .join(" • ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
      <p className="text-xs uppercase text-slate-400">{title}</p>
      <p className="text-base font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
