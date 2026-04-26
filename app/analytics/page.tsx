"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, ListChecks, RefreshCw, Sparkles } from "lucide-react";

import { AuthGuard } from "../../components/auth-guard";
import { FeatureGate } from "../../components/feature-gate";
import { Button } from "../../components/ui/button";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import { computeSubscriptionAnalytics, type CalendarEntry } from "../../lib/subscription-analytics";
import { addDays, dayMonthFormatter, formatDaysLeft, formatMoney, monthFormatter } from "../../lib/subscriptions";
import { cn } from "../../lib/utils";

type AnalyticsView = "all" | "charts" | "calendar" | "lists";

const TrendChart = dynamic(() => import("./_components/trend-chart").then((mod) => mod.TrendChart), {
  ssr: false,
  loading: () => <div className="mt-4 h-64 animate-pulse rounded-3xl bg-muted" />,
});

const PieBreakdown = dynamic(() => import("./_components/pie-breakdown").then((mod) => mod.PieBreakdown), {
  ssr: false,
  loading: () => <div className="mt-4 h-64 animate-pulse rounded-3xl bg-muted" />,
});

const PIE_COLORS = ["#6366f1", "#22d3ee", "#f97316", "#14b8a6", "#ec4899"];
const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthTitleFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });
const fullDateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

const viewOptions: Array<{ value: AnalyticsView; label: string; icon: React.ReactNode }> = [
  { value: "all", label: "Все", icon: <Sparkles className="h-4 w-4" aria-hidden="true" /> },
  { value: "charts", label: "Графики", icon: <BarChart3 className="h-4 w-4" aria-hidden="true" /> },
  { value: "calendar", label: "Календарь", icon: <CalendarDays className="h-4 w-4" aria-hidden="true" /> },
  { value: "lists", label: "Списки", icon: <ListChecks className="h-4 w-4" aria-hidden="true" /> },
];

export default function AnalyticsPage() {
  const { subscriptions, initialized, resetToDefaults } = useSubscriptions();
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AnalyticsView>("all");
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
  const selectedCalendarEntry =
    analytics.calendar.find((entry) => getDateKey(entry.date) === selectedDateKey) ?? analytics.calendar[0] ?? null;

  const showCharts = activeView === "all" || activeView === "charts";
  const showCalendar = activeView === "all" || activeView === "calendar";
  const showLists = activeView === "all" || activeView === "lists";

  return (
    <AuthGuard>
      <FeatureGate feature="analytics">
      <div className="bg-background py-8 sm:py-10">
        <div className="container flex max-w-6xl flex-col gap-6">
          <header className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-primary">Отчеты SubKeeper</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Аналитика и прогнозы
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  Выберите, что показывать: графики, календарь платежей или списки ближайших списаний.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline">
                  <Link href="/calculator">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    К калькулятору
                  </Link>
                </Button>
                <Button type="button" variant="outline" onClick={resetToDefaults}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Демо-данные
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <SummaryCard title="Валюты" value={analytics.currencies.join(", ") || "нет"} />
              <SummaryCard title="Всего подписок" value={subscriptions.length.toString()} />
              <SummaryCard
                title="Средний чек"
                value={
                  Object.entries(analytics.averageMonthlyPerSubscription)
                    .map(([currency, value]) => `${formatMoney(value)} ${currency}`)
                    .join(" • ") || "нет данных"
                }
              />
            </div>
          </header>

          {!initialized || !hasSubscriptions ? (
            <EmptyReportsState initialized={initialized} onReset={resetToDefaults} />
          ) : (
            <>
              <ViewSelector activeView={activeView} onChange={setActiveView} />

              {showCharts && (
                <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <Panel
                    title="Тренд расходов"
                    aside={<span className="text-xs font-semibold uppercase text-muted-foreground">6 месяцев</span>}
                  >
                    <TrendChart data={chartData} />
                  </Panel>

                  <Panel title="Распределение по валютам">
                    <PieBreakdown data={pieData} colors={PIE_COLORS} />
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {pieData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                          />
                          <span>
                            {entry.name}:{" "}
                            <span className="font-semibold text-foreground">{formatMoney(entry.value)}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </section>
              )}

              {showCalendar && (
                <PaymentCalendar
                  entries={analytics.calendar}
                  selectedEntry={selectedCalendarEntry}
                  onSelectDate={setSelectedDateKey}
                />
              )}

              {showLists && (
                <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <Panel
                    title="Ближайшие платежи"
                    aside={<span className="text-xs font-semibold uppercase text-muted-foreground">30 дней</span>}
                  >
                    <div className="mt-4 space-y-3 text-sm">
                      {upcoming.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background px-4 py-3"
                        >
                          <div>
                            <p className="text-base font-semibold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {dayMonthFormatter.format(item.nextDate)} · {formatDaysLeft(item.daysLeft)}
                            </p>
                          </div>
                          <p className="text-base font-semibold text-foreground">
                            {formatMoney(item.cost)} {item.currency}
                          </p>
                        </div>
                      ))}
                      {upcoming.length === 0 && <EmptyLine text="Нет списаний в ближайшие 30 дней." />}
                    </div>
                  </Panel>

                  <Panel title="Популярные периоды" aside={<BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />}>
                    <div className="mt-4 space-y-3">
                      {analytics.frequencyDistribution.map((item) => (
                        <div key={item.label} className="rounded-2xl border bg-background px-4 py-3">
                          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                            <span>{item.label}</span>
                            <span>{item.count}x</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {Object.entries(item.totals)
                              .map(([currency, value]) => `${formatMoney(value)} ${currency}`)
                              .join(" • ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </section>
              )}
            </>
          )}
        </div>
      </div>
      </FeatureGate>
    </AuthGuard>
  );
}

function ViewSelector({
  activeView,
  onChange,
}: {
  activeView: AnalyticsView;
  onChange: (view: AnalyticsView) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">Показывать</p>
        <p className="text-xs text-muted-foreground">Переключите состав отчета на экране.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        {viewOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition",
              activeView === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:border-primary hover:text-primary"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PaymentCalendar({
  entries,
  selectedEntry,
  onSelectDate,
}: {
  entries: CalendarEntry[];
  selectedEntry: CalendarEntry | null;
  onSelectDate: (dateKey: string) => void;
}) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const calendarStart = getCalendarStart(visibleMonth);
  const days = Array.from({ length: 42 }, (_, index) => addDays(calendarStart, index));
  const entriesByDate = new Map(entries.map((entry) => [getDateKey(entry.date), entry]));
  const monthLabel = monthTitleFormatter.format(visibleMonth);

  const changeMonth = (direction: -1 | 1) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  const resetMonth = () => {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Panel
        title="Календарь оплат"
        aside={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background text-foreground transition hover:border-primary hover:text-primary"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={resetMonth}
              className="inline-flex min-h-9 items-center gap-2 rounded-xl border bg-background px-3 text-xs font-semibold uppercase text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
              {monthLabel}
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background text-foreground transition hover:border-primary hover:text-primary"
              aria-label="Следующий месяц"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        }
      >
        <div className="mt-5 grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="px-2 text-center text-xs font-semibold uppercase text-muted-foreground">
              {day}
            </div>
          ))}

          {days.map((date) => {
            const dateKey = getDateKey(date);
            const entry = entriesByDate.get(dateKey);
            const isCurrentMonth =
              date.getMonth() === visibleMonth.getMonth() && date.getFullYear() === visibleMonth.getFullYear();
            const isToday = dateKey === getDateKey(today);
            const isSelected = selectedEntry ? getDateKey(selectedEntry.date) === dateKey : false;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => entry && onSelectDate(dateKey)}
                disabled={!entry}
                className={cn(
                  "flex min-h-20 flex-col rounded-2xl border p-2 text-left transition",
                  isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground",
                  entry && "hover:border-primary hover:bg-primary/5",
                  isSelected && "border-primary bg-primary/10",
                  !entry && "cursor-default opacity-70"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday && "bg-primary text-primary-foreground"
                  )}
                >
                  {date.getDate()}
                </span>
                {entry && (
                  <span className="mt-auto space-y-1">
                    <span className="block h-1.5 w-8 rounded-full bg-primary" />
                    <span className="block truncate text-xs font-semibold text-foreground">
                      {formatTotals(entry.totals)}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="День оплаты">
        {selectedEntry ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">{fullDateFormatter.format(selectedEntry.date)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Итого: {formatTotals(selectedEntry.totals)}</p>
            </div>

            <div className="space-y-3">
              {selectedEntry.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-background px-4 py-3 text-sm"
                >
                  <span className="min-w-0 truncate font-semibold text-foreground">{item.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatMoney(item.cost)} {item.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyLine text="В ближайшие 60 дней платежей нет." />
        )}
      </Panel>
    </section>
  );
}

function EmptyReportsState({ initialized, onReset }: { initialized: boolean; onReset: () => void }) {
  return (
    <section className="rounded-3xl border border-dashed bg-card p-10 text-center shadow-soft">
      <p className="text-lg font-semibold text-foreground">{initialized ? "Пока нет данных" : "Загружаем данные..."}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
        Добавьте подписки в калькулятор или загрузите демо-набор, чтобы построить отчеты и календарь оплат.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/calculator">Открыть калькулятор</Link>
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Загрузить демо
        </Button>
      </div>
    </section>
  );
}

function Panel({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {aside}
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background px-4 py-3 text-sm">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
      <p className="mt-1 truncate text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="mt-4 rounded-2xl border border-dashed bg-muted/30 px-4 py-5 text-sm text-muted-foreground">{text}</p>;
}

function getCalendarStart(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const mondayBasedDay = (firstDay.getDay() + 6) % 7;
  return addDays(firstDay, -mondayBasedDay);
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTotals(totals: Record<string, number>) {
  return (
    Object.entries(totals)
      .map(([currency, value]) => `${formatMoney(value)} ${currency}`)
      .join(" • ") || "0"
  );
}
