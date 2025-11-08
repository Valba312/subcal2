"use client";

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
    notes: `${subscription.cost}₽ за ${months} мес` + (category ? ` | сегмент: ${category}` : ""),
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 px-4 py-10 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">AI-агент</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Оптимизация подписок</h1>
          <p className="text-sm text-white/70">
            Изолированный агент анализирует конфликты, предлагает альтернативы и помогает экономить каждый месяц.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur">
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-white">
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
                    : "text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_80px_-40px_rgba(15,23,42,1)] backdrop-blur">
          {activeTab === "optimizer" ? <AgentPanel subs={agentSubscriptions} /> : <AgentChat />}
        </div>
      </div>
    </main>
  );
}
