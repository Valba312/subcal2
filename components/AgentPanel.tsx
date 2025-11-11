"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { runAgent, type AgentResult } from "../lib/agent";
import { formatMoney } from "../lib/subscriptions";
import type { Advice, Subscription } from "../types/subscription";

type AgentPanelProps = {
  subs: Subscription[];
  onDisable?: (advice: Advice) => void;
  onSwitchToAnnual?: (advice: Advice) => void;
  onIgnore?: (advice: Advice) => void;
};

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        <div className="h-2 w-2 rounded-full bg-primary" />
      </header>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const CHECKLIST_BASE = [
  "Проверить последние списания",
  "Сравнить тарифы и бонусы",
  "Запланировать действие в календаре",
];

const buildChecklist = (advice: Advice): string[] => {
  const steps = [...CHECKLIST_BASE];
  if (advice.savingPerMonth) {
    steps.splice(1, 0, `Зафиксировать ожидаемую экономию ~${formatMoney(advice.savingPerMonth)} ₽/мес`);
  }
  steps[0] = `Сверить подписки из рекомендации «${advice.title}»`;
  return steps;
};

const CATEGORY_PALETTE = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#0EA5E9"];

export default function AgentPanel({ subs, onDisable, onSwitchToAnnual, onIgnore }: AgentPanelProps) {
  const [result, setResult] = useState<AgentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<Record<string, boolean[]>>({});

  const handleRun = useCallback(async () => {
    if (subs.length === 0) {
      setError("Нет подписок для анализа");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await runAgent(subs);
      setResult(data);
    } catch (agentError) {
      console.error("AgentPanel run failed", agentError);
      setError(agentError instanceof Error ? agentError.message : "Не удалось выполнить анализ");
    } finally {
      setIsLoading(false);
    }
  }, [subs]);

  const summary = useMemo(() => {
    if (!result) {
      return null;
    }
    return {
      before: formatMoney(result.monthlyBefore),
      after: formatMoney(result.monthlyAfter),
      saving: formatMoney(result.savingPerMonth),
    };
  }, [result]);

  const topSavings = useMemo(() => {
    if (!result) {
      return [];
    }
    return result.advice
      .filter((item) => typeof item.savingPerMonth === "number" && item.savingPerMonth > 0)
      .sort((a, b) => (b.savingPerMonth ?? 0) - (a.savingPerMonth ?? 0))
      .slice(0, 4)
      .map((item) => ({
        title: item.title,
        saving: item.savingPerMonth ?? 0,
        detail: item.detail,
      }));
  }, [result]);

  const categoryBreakdown = useMemo(() => {
    if (!subs.length) {
      return [];
    }
    const totals = subs.reduce<Record<string, number>>((acc, subscription) => {
      const key = subscription.category ?? "Прочее";
      acc[key] = (acc[key] ?? 0) + subscription.perMonth;
      return acc;
    }, {});
    const sum = Object.values(totals).reduce((total, value) => total + value, 0);
    if (sum === 0) {
      return [];
    }
    return Object.entries(totals).map(([label, value], index) => ({
      label,
      value,
      share: Number(((value / sum) * 100).toFixed(1)),
      color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
    }));
  }, [subs]);

  const handleAction = useCallback(
    (action: "disable" | "annual" | "ignore", advice: Advice) => {
      const handlers = {
        disable: onDisable,
        annual: onSwitchToAnnual,
        ignore: onIgnore,
      } as const;
      const fn = handlers[action];
      if (fn) {
        fn(advice);
      }
    },
    [onDisable, onSwitchToAnnual, onIgnore]
  );

  const toggleChecklistItem = useCallback((adviceKey: string, index: number, checklistLength: number) => {
    setChecklistState((prev) => {
      const current = prev[adviceKey] ?? Array.from({ length: checklistLength }, () => false);
      const next = [...current];
      next[index] = !next[index];
      return { ...prev, [adviceKey]: next };
    });
  }, []);

  const renderConflicts = () => {
    if (!result || result.conflicts.length === 0) {
      return <p className="text-sm text-slate-500">Конфликты не найдены</p>;
    }

    return (
      <ul className="space-y-4">
        {result.conflicts.map((conflict) => (
          <li
            key={`${conflict.group}-${conflict.items.join("-")}`}
            className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 shadow-sm dark:border-amber-400/40 dark:bg-amber-500/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-amber-900 dark:text-amber-100">
              <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs uppercase tracking-wide text-amber-700">
                {conflict.group}
              </span>
              <div className="flex flex-wrap gap-2 text-xs text-amber-900 dark:text-amber-50">
                {conflict.items.map((item) => (
                  <span key={item} className="rounded-full bg-white/60 px-3 py-1 shadow-sm dark:bg-amber-500/30">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-amber-800 dark:text-amber-100">{conflict.reason}</p>
          </li>
        ))}
      </ul>
    );
  };

  const renderAdvice = () => {
    if (!result || result.advice.length === 0) {
      return <p className="text-sm text-slate-500">Советы появятся после анализа</p>;
    }

    return (
      <ul className="space-y-4">
        {result.advice.map((item, index) => {
          const adviceKey = `${item.title}-${index}`;
          const checklist = buildChecklist(item);
          const currentState = checklistState[adviceKey] ?? Array.from({ length: checklist.length }, () => false);

          return (
            <li
              key={adviceKey}
              className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-slate-900 shadow-sm dark:border-slate-700/70 dark:bg-slate-900 dark:text-white"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h4 className="text-base font-semibold">{item.title}</h4>
                  {typeof item.savingPerMonth === "number" && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-200">
                      −{formatMoney(item.savingPerMonth)} ₽/мес
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Чек-лист действий</p>
                <ul className="mt-2 space-y-2">
                  {checklist.map((step, stepIndex) => (
                    <li key={step}>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          checked={currentState[stepIndex] ?? false}
                          onChange={() => toggleChecklistItem(adviceKey, stepIndex, checklist.length)}
                        />
                        <span className="text-slate-700 dark:text-slate-200">{step}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {[
                  { label: "Отключить", action: "disable" },
                  { label: "Сменить тариф", action: "annual" },
                  { label: "Игнорировать", action: "ignore" },
                ].map(({ label, action }) => (
                  <button
                    key={action}
                    type="button"
                    className="rounded-full border border-slate-200/70 px-4 py-1.5 text-slate-700 transition hover:-translate-y-0.5 hover:border-primary hover:text-primary dark:border-slate-700/70 dark:text-white"
                    onClick={() => handleAction(action as "disable" | "annual" | "ignore", item)}
                  >
                    {label}
                  </button>
                ))}
                <Link
                  href="/calculator"
                  className="rounded-full bg-gradient-to-r from-primary to-purple-500 px-4 py-1.5 text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5"
                >
                  Посмотреть расчёт
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard title="AI-агент для подписок">
        <div className="flex flex-col gap-4 rounded-2xl bg-white/40 p-4 text-slate-700 shadow-inner shadow-white/50 dark:bg-slate-900/40 dark:text-slate-200 sm:flex-row sm:items-center">
          <p className="text-sm">
            Агент анализирует подписки, ищет дубликаты и советует, как сократить траты.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleRun}
              disabled={isLoading || subs.length === 0}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Анализируем...
                </span>
              ) : (
                "Проверить конфликты"
              )}
            </button>
            <Link
              href="/calculator"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200/70 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-primary hover:text-primary dark:border-slate-700/70 dark:text-white"
            >
              Открыть калькулятор
            </Link>
          </div>
        </div>
        {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Конфликты">{renderConflicts()}</SectionCard>
        <SectionCard title="Рекомендации">{renderAdvice()}</SectionCard>
      </div>

      <SectionCard title="Экономия">
        {summary ? (
          <div className="flex flex-col gap-6 text-sm font-semibold text-slate-800 dark:text-white">
            <div className="flex flex-wrap items-center gap-6">
              <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-inner dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-wide text-slate-500">До</p>
                <p className="text-2xl">{summary.before}</p>
              </div>
              <span className="text-lg text-slate-400">→</span>
              <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-inner dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-wide text-slate-500">После</p>
                <p className="text-2xl">{summary.after}</p>
              </div>
              <span className="text-lg text-slate-400">=</span>
              <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 px-5 py-3 text-white shadow-lg">
                <p className="text-xs uppercase tracking-wide text-white/80">Экономия</p>
                <p className="text-2xl">{summary.saving}/мес</p>
                <div className="absolute -right-2 -top-2 h-3 w-3 animate-ping rounded-full bg-white/70" />
              </div>
            </div>

            {topSavings.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/60 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/70">
                  Топ экономии
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {topSavings.map((saving) => (
                    <div key={saving.title} className="flex items-center justify-between px-4 py-2 text-slate-700 dark:text-slate-200">
                      <div>
                        <p className="font-medium">{saving.title}</p>
                        <p className="text-xs text-slate-500">{saving.detail}</p>
                      </div>
                      <span className="text-base text-emerald-500">−{formatMoney(saving.saving)} ₽/мес</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {categoryBreakdown.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white/60 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Структура подписок</p>
                <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  {categoryBreakdown.map((slice) => (
                    <div key={slice.label} style={{ width: `${slice.share}%`, backgroundColor: slice.color }} className="h-full" />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
                  {categoryBreakdown.map((slice) => (
                    <span key={slice.label} className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 shadow-sm dark:bg-slate-800/80">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                      {slice.label}: {formatMoney(slice.value)} ₽ ({slice.share}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Запусти анализ, чтобы увидеть потенциал экономии</p>
        )}
      </SectionCard>
    </div>
  );
}
