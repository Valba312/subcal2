"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { BarChart3, Calendar, CreditCard, Plus, Trash2, WalletCards } from "lucide-react";

import { AuthGuard } from "../../components/auth-guard";
import { FeatureGate } from "../../components/feature-gate";
import { Button } from "../../components/ui/button";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import {
  FREQUENCIES,
  FrequencyOption,
  dayMonthFormatter,
  formatDaysLeft,
  formatMoney,
  getDateInputValue,
  isValidDate,
} from "../../lib/subscriptions";
import { computeSubscriptionAnalytics } from "../../lib/subscription-analytics";
import { cn } from "../../lib/utils";

const progressSteps = ["Название", "Стоимость", "Период", "Дата"];

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
  const { subscriptions, initialized, addSubscription, removeSubscription } = useSubscriptions();
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
        setError("Количество месяцев должно быть больше нуля.");
        return;
      }
      months = custom;
    }

    const result = await addSubscription({
      name: trimmedName,
      cost: costValue,
      currency: form.currency,
      months,
      frequencyLabel: frequency.value === "custom" ? `Каждые ${months} мес.` : frequency.label,
      nextPaymentDate: getDateInputValue(nextPayment),
    });

    if (!result.ok) {
      setError(result.error ?? "Не удалось добавить подписку.");
      return;
    }

    setForm((prev) => ({ ...createInitialFormState(), currency: prev.currency }));
  };

  const handleDelete = (id: number) => {
    void removeSubscription(id);
  };

  return (
    <AuthGuard>
      <FeatureGate feature="calculator">
      <div className="bg-background py-8 sm:py-10">
        <div className="container flex max-w-6xl flex-col gap-6">
          <header className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-primary">SubKeeper</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Калькулятор подписок
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  Добавляйте сервисы, считайте месячный бюджет и держите ближайшие платежи перед глазами.
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/40 px-5 py-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Месячный итог</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{monthlySummary || "0 ₽"}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <SummaryCard label="Подписок" value={subscriptions.length.toString()} icon={<WalletCards className="h-4 w-4" />} />
              <SummaryCard label="Валюты" value={analytics.currencies.join(", ") || "нет"} icon={<BarChart3 className="h-4 w-4" />} />
              <SummaryCard
                label="Ближайший платеж"
                value={
                  upcoming[0]
                    ? `${dayMonthFormatter.format(upcoming[0].nextDate)} · ${formatDaysLeft(upcoming[0].daysLeft)}`
                    : "нет в ближайшие 30 дней"
                }
                icon={<Calendar className="h-4 w-4" />}
              />
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[400px_1fr]">
            <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border bg-card p-6 shadow-soft">
              <div>
                <p className="text-lg font-semibold text-foreground">Новая подписка</p>
                <p className="mt-1 text-sm text-muted-foreground">Заполните стоимость, период и дату следующего списания.</p>
              </div>

              <ProgressStrip currentStep={form.name ? (form.cost ? (form.nextPaymentDate ? 3 : 2) : 1) : 0} />

              {error && (
                <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Field label="Название сервиса">
                <input
                  value={form.name}
                  onChange={(event) => handleFormChange("name", event.target.value)}
                  placeholder="Например, Netflix или Notion"
                  className="form-input"
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-[1fr_112px]">
                <Field label="Стоимость">
                  <input
                    value={form.cost}
                    onChange={(event) => handleFormChange("cost", event.target.value)}
                    inputMode="decimal"
                    placeholder="599"
                    className="form-input"
                  />
                </Field>

                <Field label="Валюта">
                  <select
                    value={form.currency}
                    onChange={(event) => handleFormChange("currency", event.target.value)}
                    className="form-input"
                  >
                    <option value="₽">₽</option>
                    <option value="$">$</option>
                    <option value="€">€</option>
                  </select>
                </Field>
              </div>

              <Field label="Период оплаты">
                <select
                  value={form.frequency}
                  onChange={(event) => handleFormChange("frequency", event.target.value as FormState["frequency"])}
                  className="form-input"
                >
                  {FREQUENCIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              {form.frequency === "custom" && (
                <Field label="Повторять каждые, мес.">
                  <input
                    value={form.customMonths}
                    onChange={(event) => handleFormChange("customMonths", event.target.value)}
                    inputMode="numeric"
                    className="form-input"
                  />
                </Field>
              )}

              <Field label="Следующий платеж">
                <input
                  type="date"
                  value={form.nextPaymentDate}
                  onChange={(event) => handleFormChange("nextPaymentDate", event.target.value)}
                  className="form-input"
                />
              </Field>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Добавить подписку
              </Button>
            </form>

            <div className="space-y-6">
              <div className="rounded-3xl border bg-card p-6 shadow-soft">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Сводка по валютам</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Расходы за 30, 90 и 365 дней.</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {!initialized && <EmptyState text="Загружаем подписки..." />}
                  {initialized && analytics.currencies.length === 0 && (
                    <EmptyState text="Добавьте подписку, чтобы увидеть расчеты." />
                  )}
                  {analytics.currencies.map((currency) => (
                    <div key={currency} className="rounded-2xl border bg-muted/30 p-4 text-sm">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">{currency}</p>
                      <div className="mt-3 grid gap-2 text-foreground">
                        <SummaryLine label="30 дней" value={formatMoney(analytics.monthlyTotals[currency] ?? 0)} />
                        <SummaryLine label="90 дней" value={formatMoney(analytics.quarterlyTotals[currency] ?? 0)} />
                        <SummaryLine label="365 дней" value={formatMoney(analytics.yearlyTotals[currency] ?? 0)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border bg-card p-6 shadow-soft">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Ваши подписки</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{subscriptions.length} сервисов в списке</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {!initialized && <EmptyState text="Загружаем список..." />}
                  {initialized && subscriptions.length === 0 && (
                    <EmptyState text="Список пуст. Добавьте первую подписку в форме слева." />
                  )}
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="grid gap-4 rounded-2xl border bg-background p-4 text-sm transition hover:border-primary/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-foreground">{subscription.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{subscription.frequencyLabel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-semibold text-foreground">
                            {formatMoney(subscription.cost)} {subscription.currency}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatMoney(subscription.cost / subscription.months)} {subscription.currency} / мес.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
                        <span>Следующий платеж: {dayMonthFormatter.format(new Date(subscription.nextPaymentDate))}</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(subscription.id)}
                          className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-semibold text-destructive transition hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Удалить
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
      </FeatureGate>
    </AuthGuard>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-2xl border bg-background px-4 py-3 text-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </p>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed bg-muted/30 px-4 py-5 text-sm text-muted-foreground md:col-span-2">
      {text}
    </p>
  );
}

function ProgressStrip({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {progressSteps.map((step, index) => (
        <div key={step} className="min-w-0">
          <div
            className={cn(
              "h-1.5 rounded-full transition",
              index <= currentStep ? "bg-primary" : "bg-muted"
            )}
          />
          <p className="mt-2 truncate text-[11px] font-semibold uppercase text-muted-foreground">{step}</p>
        </div>
      ))}
    </div>
  );
}
