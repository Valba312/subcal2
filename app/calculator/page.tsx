"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, Calendar, Plus, Trash2 } from "lucide-react";

import {
  FREQUENCIES,
  FrequencyOption,
  Subscription,
  dayMonthFormatter,
  formatDaysLeft,
  formatMoney,
  getDateInputValue,
  isValidDate,
} from "../../lib/subscriptions";
import { computeSubscriptionAnalytics } from "../../lib/subscription-analytics";
import { useSubscriptions } from "../../hooks/useSubscriptions";

import { cn } from "../../lib/utils";

const progressSteps = [
  "Название",
  "Стоимость",
  "Период",
  "Следующий платёж",
];

type FormState = {
  name: string;
  cost: string;
  currency: string;
  frequency: FrequencyOption["value"];
  customMonths: string;
  nextPaymentDate: string;
};

const createInitialFormState = (): FormState => ({
  name: "",
  cost: "",
  currency: "₽",
  frequency: "monthly",
  customMonths: "1",
  nextPaymentDate: getDateInputValue(new Date()),
});

export default function CalculatorPage() {
  const { subscriptions, addSubscription, removeSubscription } = useSubscriptions();
  const [form, setForm] = useState<FormState>(() => createInitialFormState());
  const [error, setError] = useState<string | null>(null);

  const analytics = useMemo(() => computeSubscriptionAnalytics(subscriptions), [subscriptions]);
  const monthlySummary = analytics.currencies
    .map((currency) => `${formatMoney(analytics.monthlyTotals[currency] ?? 0)} ${currency}`)
    .join(" • ");

  const upcoming = analytics.upcomingPayments.slice(0, 3);

  const handleFormChange = <Field extends keyof FormState>(field: Field, value: FormState[Field]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const costValue = Number(form.cost.replace(",", "."));
    const frequency = FREQUENCIES.find((item) => item.value === form.frequency)!;

    if (!trimmedName) {
      setError("Добавьте название подписки.");
      return;
    }

    if (!Number.isFinite(costValue) || costValue <= 0) {
      setError("Стоимость должна быть положительным числом.");
      return;
    }

    if (!form.nextPaymentDate) {
      setError("Укажите дату следующего платежа.");
      return;
    }

    const nextPayment = new Date(form.nextPaymentDate);
    if (!isValidDate(nextPayment)) {
      setError("Укажите корректную дату следующего платежа.");
      return;
    }

    let months = frequency.months;

    if (frequency.value === "custom") {
      const custom = Number(form.customMonths);
      if (!Number.isFinite(custom) || custom <= 0) {
        setError("Количество месяцев для собственной периодичности должно быть больше нуля.");
        return;
      }
      months = custom;
    }

    const newSubscription: Subscription = {
      id: Date.now(),
      name: trimmedName,
      cost: costValue,
      currency: form.currency,
      months,
      frequencyLabel: frequency.value === "custom" ? `Каждые ${months} мес.` : frequency.label,
      nextPaymentDate: getDateInputValue(nextPayment),
    };

    addSubscription(newSubscription);
    setForm((prev) => ({ ...createInitialFormState(), currency: prev.currency }));
  };

  const handleDelete = (id: number) => {
    removeSubscription(id);
  };

  return (
    <div className="bg-gradient-to-b from-[#f5f4ff] via-white to-white py-10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="container flex max-w-6xl flex-col gap-8">
        <header className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">SubKeeper</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Калькулятор подписок
              </h1>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Добавляйте активные сервисы, смотрите ежемесячный итог и готовьтесь к предстоящим платежам.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3 text-sm shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
              <p className="text-xs uppercase text-slate-400">Месячный итог</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{monthlySummary || "0 ₽"}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Подписок" value={subscriptions.length.toString()} icon={<Plus className="h-4 w-4" />} />
            <SummaryCard label="Валюта" value={analytics.currencies.join(", ") || "—"} icon={<BarChart3 className="h-4 w-4" />} />
            <SummaryCard
              label="Ближайший платёж"
              value={
                upcoming[0]
                  ? `${dayMonthFormatter.format(upcoming[0].nextDate)} · ${formatDaysLeft(upcoming[0].daysLeft)}`
                  : "нет в ближайшие 30 дней"
              }
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Новая подписка</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">6 минут в месяц — и бюджет под контролем.</p>
            </div>
            <ProgressStrip currentStep={form.name ? (form.cost ? (form.nextPaymentDate ? 3 : 2) : 1) : 0} />
            {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
            <label className="block space-y-2 text-sm font-medium">
              <span>Название сервиса</span>
              <input
                value={form.name}
                onChange={(event) => handleFormChange("name", event.target.value)}
                placeholder="Например, Netflix или Notion"
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block space-y-2 text-sm font-medium">
                <span>Стоимость</span>
                <input
                  value={form.cost}
                  onChange={(event) => handleFormChange("cost", event.target.value)}
                  inputMode="decimal"
                  placeholder="599"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm outline-none transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                <span>Валюта</span>
                <select
                  value={form.currency}
                  onChange={(event) => handleFormChange("currency", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm outline-none transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
                >
                  <option value="₽">₽</option>
                  <option value="$">$</option>
                  <option value="€">€</option>
                </select>
              </label>
            </div>
            <label className="block space-y-2 text-sm font-medium">
              <span>Период оплаты</span>
              <select
                value={form.frequency}
                onChange={(event) => handleFormChange("frequency", event.target.value as FormState["frequency"])}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm outline-none transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
              >
                {FREQUENCIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {form.frequency === "custom" && (
              <label className="block space-y-2 text-sm font-medium">
                <span>Каждые сколько месяцев?</span>
                <input
                  value={form.customMonths}
                  onChange={(event) => handleFormChange("customMonths", event.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm outline-none transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
                />
              </label>
            )}
            <label className="block space-y-2 text-sm font-medium">
              <span>Следующий платёж</span>
              <input
                type="date"
                value={form.nextPaymentDate}
                onChange={(event) => handleFormChange("nextPaymentDate", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm outline-none transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
              />
            </label>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Добавить подписку
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Сводка по валютам</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {analytics.currencies.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Добавьте подписку, чтобы увидеть расчёты.</p>
                )}
                {analytics.currencies.map((currency) => (
                  <div key={currency} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700/70 dark:bg-slate-900">
                    <p className="text-xs uppercase text-slate-400">{currency}</p>
                    <div className="mt-2 space-y-1 text-slate-700 dark:text-slate-200">
                      <p>
                        30 дней: <span className="font-semibold">{formatMoney(analytics.monthlyTotals[currency] ?? 0)}</span>
                      </p>
                      <p>
                        90 дней: <span className="font-semibold">{formatMoney(analytics.quarterlyTotals[currency] ?? 0)}</span>
                      </p>
                      <p>
                        365 дней: <span className="font-semibold">{formatMoney(analytics.yearlyTotals[currency] ?? 0)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ваши подписки</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">{subscriptions.length} сервисов</span>
              </div>
              <div className="mt-4 space-y-3">
                {subscriptions.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-300/70 bg-slate-50/80 px-4 py-5 text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/40">
                    Список пуст — добавьте первую подписку в форме слева.
                  </p>
                )}
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="grid gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm shadow-sm transition hover:-translate-y-0.5 dark:border-slate-700/70 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{subscription.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{subscription.frequencyLabel}</p>
                      </div>
                      <div className="text-right text-slate-900 dark:text-white">
                        <p className="text-base font-semibold">{formatMoney(subscription.cost)} {subscription.currency}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatMoney(subscription.cost / subscription.months)} {subscription.currency} / мес</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Следующий платёж: {dayMonthFormatter.format(new Date(subscription.nextPaymentDate))}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(subscription.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-slate-700/70 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden /> Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-primary">{icon}</span>
      <div>
        <p className="text-xs uppercase text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function ProgressStrip({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
      {progressSteps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border text-[11px]",
              index <= currentStep ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-400"
            )}
          >
            {index + 1}
          </span>
          <span className="hidden text-[11px] uppercase tracking-[0.08em] text-slate-500 md:inline">{step}</span>
          {index < progressSteps.length - 1 && <div className="hidden h-px w-6 bg-slate-200 md:block" />}
        </div>
      ))}
    </div>
  );
}
