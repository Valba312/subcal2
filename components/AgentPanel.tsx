"use client";

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
    <section className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-6 shadow-[0_20px_35px_-25px_rgba(15,23,42,0.6)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_50px_-30px_rgba(76,29,149,0.7)] dark:border-white/5 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 blur-3xl" />
      </div>
      <header className="relative flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_12px_rgba(109,40,217,0.6)]" />
      </header>
      <div className="relative mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function AgentPanel({ subs, onDisable, onSwitchToAnnual, onIgnore }: AgentPanelProps) {
  const [result, setResult] = useState<AgentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const renderConflicts = () => {
    if (!result || result.conflicts.length === 0) {
      return <p className="text-sm text-slate-500">Конфликты не найдены</p>;
    }

    return (
      <ul className="space-y-4">
        {result.conflicts.map((conflict) => (
          <li
            key={`${conflict.group}-${conflict.items.join("-")}`}
            className="relative overflow-hidden rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50/80 via-white to-yellow-100/80 p-4 shadow-[0_10px_30px_-20px_rgba(180,83,9,0.8)] transition-all duration-300 hover:-translate-y-0.5 dark:border-amber-400/40 dark:from-amber-500/10 dark:via-slate-900 dark:to-amber-500/5"
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-transparent blur-2xl" />
            </div>
            <div className="relative flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-amber-900 dark:text-amber-100">
              <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/20">
                {conflict.group}
              </span>
              <div className="flex flex-wrap gap-2 text-xs text-slate-900 dark:text-amber-50">
                {conflict.items.map((item) => (
                  <span key={item} className="rounded-full bg-white/60 px-3 py-1 shadow-sm dark:bg-amber-500/30">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <p className="relative mt-3 text-sm text-amber-800 dark:text-amber-200">{conflict.reason}</p>
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
        {result.advice.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-indigo-900/80 p-5 text-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.9)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h4 className="text-base font-semibold tracking-tight">{item.title}</h4>
                {typeof item.savingPerMonth === "number" && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-200">
                    −{formatMoney(item.savingPerMonth)} ₽ / мес
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-200">{item.detail}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {[
                { label: "Отключить", action: "disable" },
                { label: "Сменить на годовой", action: "annual" },
                { label: "Игнорировать", action: "ignore" },
              ].map(({ label, action }) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                  onClick={() => handleAction(action as "disable" | "annual" | "ignore", item)}
                >
                  {label}
                </button>
              ))}
            </div>
          </li>
        ))}
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
        </div>
        {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Конфликты">{renderConflicts()}</SectionCard>
        <SectionCard title="Рекомендации">{renderAdvice()}</SectionCard>
      </div>

      <SectionCard title="Экономия">
        {summary ? (
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-800 dark:text-white">
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
        ) : (
          <p className="text-sm text-slate-500">Запусти анализ, чтобы увидеть потенциал экономии</p>
        )}
      </SectionCard>
    </div>
  );
}
