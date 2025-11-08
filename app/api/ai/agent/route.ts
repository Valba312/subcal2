import { NextResponse } from "next/server";

import { callLLM } from "../../../../lib/ai";
import type { Advice, Conflict, Subscription } from "../../../../types/subscription";

type AgentRequest = {
  subscriptions: Subscription[];
};

type AgentResponse = {
  conflicts: Conflict[];
  advice: Advice[];
  monthlyBefore: number;
  monthlyAfter: number;
  savingPerMonth: number;
};

const SYSTEM_PROMPT = `Ты опытный финансовый советник по подпискам.
- Анализируй каждый сервис и категоризируй: видео (Netflix, Кинопоиск, Иви/IVI, Okko, Амедиатека, Apple TV+, Megogo, Wink, Start, T-Премиум), музыка (Spotify, Яндекс.Музыка, Apple Music и др.), пакеты и банки (СберПрайм, Яндекс.Плюс, Тинькофф Премиум) и т.д.
- Ищи дубли и пересечения (например, Netflix vs Кинопоиск vs Иви) и давай конкретный совет: что оставить, что отключить, где перейти на годовой план.
- Обязательно считай экономию в рублях за месяц и объясняй, почему рекомендация полезна (перекрытие каталога, бонусы в пакетах и т.п.).
- Строго возвращай JSON с конфликтами, советами и расчётом monthlyBefore/After.`;

const STREAMING_KEYWORDS = [
  "netflix",
  "иви",
  "ivi",
  "кино",
  "okko",
  "amediateka",
  "amedia",
  "hbo",
  "t-",
  "t премиум",
  "wink",
  "start",
  "megogo",
  "apple tv",
].map((item) => item.toLowerCase());

const MUSIC_KEYWORDS = ["spotify", "яндекс", "yandex music", "apple music", "deezer", "boom", "sound"].map((item) => item.toLowerCase());

const BUNDLE_KEYWORDS = ["сберпрайм", "yandex plus", "яндекс плюс", "прайм", "тинькофф", "tinkoff"].map((item) => item.toLowerCase());

const classifySubscription = (subscription: Subscription): { segment: string; label: string } => {
  const name = subscription.name.toLowerCase();
  if (STREAMING_KEYWORDS.some((keyword) => name.includes(keyword))) {
    return { segment: "Видео", label: "streaming" };
  }
  if (MUSIC_KEYWORDS.some((keyword) => name.includes(keyword))) {
    return { segment: "Музыка", label: "music" };
  }
  if (BUNDLE_KEYWORDS.some((keyword) => name.includes(keyword))) {
    return { segment: "Пакеты", label: "bundle" };
  }
  return { segment: "Прочее", label: "other" };
};

const buildMockAgentResponse = (subscriptions: Subscription[]): AgentResponse => {
  const monthlyBefore = subscriptions.reduce((total, item) => total + item.perMonth, 0);
  const grouped = subscriptions.reduce<Record<string, Subscription[]>>((acc, subscription) => {
    const { segment } = classifySubscription(subscription);
    if (!acc[segment]) {
      acc[segment] = [];
    }
    acc[segment].push(subscription);
    return acc;
  }, {});

  const conflicts: Conflict[] = [];
  const advice: Advice[] = [];

  Object.entries(grouped).forEach(([segment, items]) => {
    if (segment === "Прочее" || items.length < 2) {
      return;
    }
    const sorted = [...items].sort((a, b) => a.perMonth - b.perMonth);
    const keeper = sorted[0];
    const redundant = sorted.slice(1);
    const saving = redundant.reduce((total, item) => total + item.perMonth, 0);

    conflicts.push({
      group: segment,
      items: items.map((item) => item.name),
      reason: `${segment} сервисы дублируют друг друга по контенту и оплачиваются параллельно`,
    });

    advice.push({
      title: `Оптимизировать ${segment}`,
      detail: `Оставь ${keeper.name} (${keeper.perMonth} ₽/мес), отключи ${redundant
        .map((item) => `${item.name} (${item.perMonth} ₽/мес)`) 
        .join(", ")} → экономия ${saving} ₽/мес`,
      savingPerMonth: saving,
    });
  });

  const monthlyAfter = Math.max(monthlyBefore - advice.reduce((sum, tip) => sum + (tip.savingPerMonth ?? 0), 0), 0);

  if (advice.length === 0) {
    advice.push({
      title: "Обновить годовые планы",
      detail: "Проверь, есть ли годовые планы со скидкой 15–20% и объединённые пакеты вроде СберПрайм или Яндекс Плюс.",
    });
  }

  return {
    conflicts,
    advice,
    monthlyBefore,
    monthlyAfter,
    savingPerMonth: monthlyBefore - monthlyAfter,
  };
};

const isPositiveNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const normalizeConflict = (raw: unknown): Conflict | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const { group, items, reason } = raw as Record<string, unknown>;
  if (typeof group !== "string" || typeof reason !== "string" || !Array.isArray(items)) {
    return null;
  }
  const filtered = items.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (filtered.length === 0) {
    return null;
  }
  return { group: group.trim(), items: filtered, reason: reason.trim() };
};

const normalizeAdvice = (raw: unknown): Advice | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const { title, detail, savingPerMonth } = raw as Record<string, unknown>;
  if (typeof title !== "string" || typeof detail !== "string") {
    return null;
  }
  const normalized: Advice = {
    title: title.trim(),
    detail: detail.trim(),
  };
  if (isPositiveNumber(savingPerMonth)) {
    normalized.savingPerMonth = savingPerMonth;
  }
  return normalized;
};

const buildPrompt = (subscriptions: Subscription[]): string => {
  if (subscriptions.length === 0) {
    return "Нет активных подписок. Верни пустые массивы и нулевые суммы.";
  }
  const list = subscriptions
    .map((subscription) => {
      const details = [
        `ID: ${subscription.id}`,
        `Название: ${subscription.name}`,
        `Статус: ${subscription.status}`,
        `Период: ${subscription.period}`,
        `Цена в месяц: ${subscription.perMonth}`,
        `Категория: ${subscription.category ?? "—"}`,
        `Ноты: ${subscription.notes ?? "—"}`,
      ];
      return details.join(" | ");
    })
    .join("\n");

  return `${list}\n\nВерни СТРОГО JSON со структурой:\n{\n  "conflicts": Conflict[],\n  "advice": Advice[],\n  "monthlyBefore": number,\n  "monthlyAfter": number,\n  "savingPerMonth": number\n}\nГде advice.savingPerMonth опционален. Избегай выдуманных данных — если не уверен, поясни reason и оставь saving пустым.`;
};

export async function POST(request: Request): Promise<NextResponse<AgentResponse | { error: string }>> {
  let body: AgentRequest;

  try {
    body = (await request.json()) as AgentRequest;
  } catch (error) {
    console.error("agent: invalid JSON body", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.subscriptions)) {
    return NextResponse.json({ error: "'subscriptions' must be an array" }, { status: 400 });
  }

  const validSubscriptions = body.subscriptions.filter((subscription): subscription is Subscription => {
    return (
      typeof subscription === "object" &&
      subscription !== null &&
      typeof subscription.id === "string" &&
      typeof subscription.name === "string" &&
      typeof subscription.perMonth === "number"
    );
  });

  if (validSubscriptions.length === 0) {
    return NextResponse.json({ error: "Provide at least one valid subscription" }, { status: 400 });
  }

  const estimatedMonthlyBefore = validSubscriptions.reduce((total, item) => total + (item.perMonth || 0), 0);

  try {
    const raw = await callLLM({
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(validSubscriptions),
      json: true,
      mock: buildMockAgentResponse(validSubscriptions),
    });

    let parsed: Partial<AgentResponse>;
    try {
      parsed = JSON.parse(raw) as Partial<AgentResponse>;
    } catch (error) {
      console.error("agent: failed to parse LLM response", { raw, error });
      return NextResponse.json({ error: "Failed to parse LLM response" }, { status: 500 });
    }

    const conflicts = Array.isArray(parsed.conflicts)
      ? parsed.conflicts.map((conflict) => normalizeConflict(conflict)).filter((item): item is Conflict => !!item)
      : [];

    const advice = Array.isArray(parsed.advice)
      ? parsed.advice.map((entry) => normalizeAdvice(entry)).filter((item): item is Advice => !!item)
      : [];

    const monthlyBefore = isPositiveNumber(parsed.monthlyBefore) ? parsed.monthlyBefore : estimatedMonthlyBefore;
    const monthlyAfter = isPositiveNumber(parsed.monthlyAfter) ? parsed.monthlyAfter : Math.max(monthlyBefore - 1, 0);
    const savingPerMonth = isPositiveNumber(parsed.savingPerMonth)
      ? parsed.savingPerMonth
      : Math.max(monthlyBefore - monthlyAfter, 0);

    return NextResponse.json({
      conflicts,
      advice,
      monthlyBefore,
      monthlyAfter,
      savingPerMonth,
    });
  } catch (error) {
    console.error("agent: LLM call failed", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
