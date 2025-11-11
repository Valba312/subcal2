"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import AgentChat from "../../components/AgentChat";
import AgentPanel from "../../components/AgentPanel";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import type { Period, Subscription as AgentSubscription } from "../../types/subscription";

const PERIOD_MAP: Record<number, Period> = {
  1: "monthly",
  3: "quarterly",
  12: "yearly",
};

const inferCategory = (name: string): string | undefined => {
  const normalized = name.toLowerCase();
  if (/netflix|ivi|иви|okko|кинопоиск|amediateka|megogo|wink|start|apple tv|t-?премиум/.test(normalized)) {
    return "Видео";
  }
  if (/spotify|яндекс|yandex music|apple music|deezer|boom/.test(normalized)) {
    return "Музыка";
  }
  if (/сберпрайм|yandex plus|яндекс плюс|тинькофф|tinkoff/.test(normalized)) {
    return "Пакет";
  }
  return undefined;
};

const mapToAgentSubscription = (subscription: { id: number; name: string; cost: number; months: number }): AgentSubscription => {
  const months = subscription.months || 1;
  const period = PERIOD_MAP[months] ?? "monthly";
  const perMonth = Number((subscription.cost / months).toFixed(2));
  const category = inferCategory(subscription.name);

  return {
    id: String(subscription.id),
    name: subscription.name,
    perMonth,
    period,
    status: "active",
    category,
    notes: `${subscription.cost}₽ за ${months} мес` + (category ? ` · сегмент: ${category}` : ""),
  };
};

export default function AgentPage() {
  const { subscriptions } = useSubscriptions();
  const [activeTab, setActiveTab] = useState<"optimizer" | "chat">("optimizer");

  const agentSubscriptions = useMemo(
    () =>
      subscriptions.map((subscription) =>
        mapToAgentSubscription({
          id: subscription.id,
          name: subscription.name,
          cost: subscription.cost,
          months: subscription.months,
        })
      ),
    [subscriptions]
  );

  const chatContext = useMemo(() => {
    if (!agentSubscriptions.length) {
      return undefined;
    }
    const monthlyTotal = agentSubscriptions.reduce((total, subscription) => total + subscription.perMonth, 0);
    return {
      summary: {
        subscriptionCount: agentSubscriptions.length,
        monthlyTotal,
      },
      subscriptions: agentSubscriptions,
    };
  }, [agentSubscriptions]);

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white py-10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="container flex max-w-6xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">AI-агент</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Оптимизация подписок</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Агент находит дублирующиеся сервисы, считает экономию и общается в свободной форме, как личный консультант.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard label="Подписок" value={subscriptions.length.toString()}>
            Чем больше сервисов внесено, тем точнее рекомендации.
          </InfoCard>
          <InfoCard label="Категории" value="Видео · Музыка · Пакеты">
            Агент автоматически распознаёт Netflix / Иви / СберПрайм.
          </InfoCard>
          <InfoCard label="Режимы" value="Оптимизация + Чат">
            Анализируйте конфликты или задавайте вопросы вручную.
          </InfoCard>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-slate-600 dark:text-white">
            {[
              { key: "optimizer", label: "Оптимизация подписок" },
              { key: "chat", label: "Чат с агентом" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as "optimizer" | "chat")}
                className={`rounded-2xl px-4 py-2 transition-all ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/30"
                    : "bg-white text-slate-600 hover:text-primary dark:bg-slate-800 dark:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900">
          {activeTab === "optimizer" ? <AgentPanel subs={agentSubscriptions} /> : <AgentChat context={chatContext} />}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="text-xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{children}</p>
    </div>
  );
}
