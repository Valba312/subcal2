"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type FrequencyOption = {
  value: "monthly" | "quarterly" | "semiannual" | "yearly" | "custom";
  label: string;
  months: number;
};

type Subscription = {
  id: number;
  name: string;
  cost: number;
  currency: string;
  months: number;
  frequencyLabel: string;
};

const FREQUENCIES: FrequencyOption[] = [
  { value: "monthly", label: "Ежемесячно", months: 1 },
  { value: "quarterly", label: "Ежеквартально", months: 3 },
  { value: "semiannual", label: "Раз в полгода", months: 6 },
  { value: "yearly", label: "Ежегодно", months: 12 },
  { value: "custom", label: "Своя периодичность", months: 1 },
];

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  { id: 1, name: "Netflix Premium", cost: 599, currency: "₽", months: 1, frequencyLabel: "Ежемесячно" },
  { id: 2, name: "Spotify Family", cost: 269, currency: "₽", months: 1, frequencyLabel: "Ежемесячно" },
  { id: 3, name: "Adobe Creative Cloud", cost: 3299, currency: "₽", months: 1, frequencyLabel: "Ежемесячно" },
];

type FormState = {
  name: string;
  cost: string;
  currency: string;
  frequency: FrequencyOption["value"];
  customMonths: string;
};

const initialForm: FormState = {
  name: "",
  cost: "",
  currency: "₽",
  frequency: "monthly",
  customMonths: "1",
};

export default function CalculatorPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(DEFAULT_SUBSCRIPTIONS);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const monthly: Record<string, number> = {};

    subscriptions.forEach((subscription) => {
      const monthlyCost = subscription.cost / subscription.months;
      monthly[subscription.currency] = (monthly[subscription.currency] ?? 0) + monthlyCost;
    });

    const yearly = Object.fromEntries(
      Object.entries(monthly).map(([currency, value]) => [currency, value * 12])
    );

    return { monthly, yearly };
  }, [subscriptions]);

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
      frequencyLabel:
        frequency.value === "custom" ? `Каждые ${months} мес.` : frequency.label,
    };

    setSubscriptions((prev) => [...prev, newSubscription]);
    setForm((prev) => ({
      ...initialForm,
      currency: prev.currency,
    }));
  };

  const handleDelete = (id: number) => {
    setSubscriptions((prev) => prev.filter((subscription) => subscription.id !== id));
  };

  const formatCurrency = (value: number) =>
    value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);

  const currencies = Array.from(new Set([...Object.keys(totals.monthly)]));

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-10 dark:from-slate-950 dark:to-slate-900">
      <div className="container flex max-w-6xl flex-col gap-8">
        <header className="space-y-3 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Калькулятор подписок SubKeeper
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Добавьте активные подписки, чтобы увидеть, сколько они стоят в месяц и за год. Все расчёты выполняются локально.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60"
          >
            <div>
              <h2 className="text-lg font-semibold">Новая подписка</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Название, стоимость и период оплаты — этого достаточно, чтобы попасть в расчёт.
              </p>
            </div>

            <label className="block space-y-1 text-sm font-medium">
              <span>Название сервиса</span>
              <input
                value={form.name}
                onChange={(event) => handleFormChange("name", event.target.value)}
                placeholder="Например, Netflix или Notion"
                className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block space-y-1 text-sm font-medium">
                <span>Стоимость</span>
                <input
                  value={form.cost}
                  onChange={(event) => handleFormChange("cost", event.target.value)}
                  inputMode="decimal"
                  placeholder="599"
                  className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
                />
              </label>

              <label className="block space-y-1 text-sm font-medium">
                <span>Валюта</span>
                <select
                  value={form.currency}
                  onChange={(event) => handleFormChange("currency", event.target.value)}
                  className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
                >
                  <option value="₽">₽</option>
                  <option value="$">$</option>
                  <option value="€">€</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1 text-sm font-medium">
              <span>Период оплаты</span>
              <select
                value={form.frequency}
                onChange={(event) =>
                  handleFormChange("frequency", event.target.value as FormState["frequency"])
                }
                className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
              >
                {FREQUENCIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {form.frequency === "custom" && (
              <label className="block space-y-1 text-sm font-medium">
                <span>Каждые … месяцев</span>
                <input
                  value={form.customMonths}
                  onChange={(event) => handleFormChange("customMonths", event.target.value)}
                  inputMode="numeric"
                  placeholder="например, 2"
                  className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2 dark:border-slate-700/70 dark:bg-slate-900/80"
                />
              </label>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Добавить подписку
            </button>
          </form>

          <section className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60">
            <header className="space-y-1">
              <h2 className="text-lg font-semibold">Расходы</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Итоги считаются отдельно по каждой валюте.
              </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              {currencies.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
                  Добавьте первую подписку, чтобы увидеть суммы.
                </div>
              ) : (
                currencies.map((currency) => (
                  <div
                    key={currency}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/50"
                  >
                    <p className="text-xs uppercase text-slate-400">Валюта</p>
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-100">{currency}</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>В месяц</span>
                        <span className="font-semibold">
                          {formatCurrency(totals.monthly[currency])} {currency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>В год</span>
                        <span className="font-semibold">
                          {formatCurrency(totals.yearly[currency])} {currency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Список подписок
              </h3>
              <div className="space-y-3">
                {subscriptions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
                    Пока ничего нет. Добавьте подписку через форму слева.
                  </div>
                ) : (
                  subscriptions.map((subscription) => {
                    const monthlyCost = subscription.cost / subscription.months;
                    const yearlyCost = monthlyCost * 12;

                    return (
                      <div
                        key={subscription.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/70 dark:bg-slate-900/50"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                            {subscription.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatCurrency(subscription.cost)} {subscription.currency} ·{" "}
                            {subscription.frequencyLabel}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-4 dark:text-slate-300">
                          <span>
                            {formatCurrency(monthlyCost)} {subscription.currency} / мес
                          </span>
                          <span>
                            {formatCurrency(yearlyCost)} {subscription.currency} / год
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(subscription.id)}
                          className="inline-flex items-center justify-center rounded-xl border border-transparent bg-slate-900/5 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:bg-slate-50/10 dark:hover:border-red-400/40 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          aria-label={`Удалить подписку ${subscription.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
