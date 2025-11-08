import { NextResponse } from "next/server";

import { callLLM } from "../../../../lib/ai";
import type { AgentChatMessage } from "../../../../types/subscription";

const SYSTEM_PROMPT = `Ты — опытный финансовый консультант по подпискам.
- Всегда опирайся на ВЕСЬ диалог и отвечай на текущий запрос без повторяющихся шаблонов.
- Даже если пользователь не дал точных цен, дай 2–3 конкретных рекомендации: какие подписки отключить или заменить, на какие пакеты/годовые планы перейти, где есть аналоги (Netflix ↔️ Кинопоиск ↔️ Иви, Spotify ↔️ Яндекс Музыка и т.д.).
- Когда пользователь перечисляет сервисы, группируй их (Видео, Музыка, Пакеты, Банковские привилегии и т.п.) и объясняй, какой оставить, какой отключить, сколько примерно сэкономит.
- Формат ответа: короткое введение + нумерованные советы с экономией в ₽/мес или %, + финальный call-to-action.
- Если информации ноль, предложи типовые сценарии экономии и попроси данные максимально конкретно.`;

const MAX_MESSAGES = 12;

const SERVICE_LIBRARY = [
  { name: "Netflix", type: "Видео", price: 599, keywords: ["netflix"] },
  { name: "Иви", type: "Видео", price: 999, keywords: ["иви", "ivi"] },
  { name: "Кинопоиск", type: "Видео", price: 300, keywords: ["кинопоиск", "kinopoisk"] },
  { name: "Okko", type: "Видео", price: 549, keywords: ["okko"] },
  { name: "Амедиатека", type: "Видео", price: 599, keywords: ["amedi", "amediateka"] },
  { name: "Megogo", type: "Видео", price: 399, keywords: ["megogo"] },
  { name: "T-Премиум", type: "Видео", price: 999, keywords: ["t\u002dпремиум", "t премиум", "t-premium"] },
  { name: "Wink", type: "Видео", price: 399, keywords: ["wink"] },
  { name: "Spotify", type: "Музыка", price: 269, keywords: ["spotify"] },
  { name: "Яндекс Музыка", type: "Музыка", price: 239, keywords: ["яндекс", "yandex music", "yandex музыка"] },
  { name: "Apple Music", type: "Музыка", price: 199, keywords: ["apple music"] },
  { name: "СберПрайм", type: "Пакеты", price: 299, keywords: ["сберпрайм", "sber", "sberprime"] },
  { name: "Яндекс Плюс", type: "Пакеты", price: 299, keywords: ["яндекс плюс", "yandex plus", "plus"] },
].map((service) => ({
  ...service,
  keywords: service.keywords.map((keyword) => keyword.toLowerCase()),
}));

type ParsedService = {
  name: string;
  type: string;
  price?: number;
  mentions: number;
};

const extractServicesFromHistory = (messages: AgentChatMessage[]): ParsedService[] => {
  const found = new Map<string, ParsedService>();

  messages
    .filter((message) => message.role === "user")
    .forEach((message) => {
      const text = message.content.toLowerCase();
      SERVICE_LIBRARY.forEach((service) => {
        if (service.keywords.some((keyword) => text.includes(keyword))) {
          const current = found.get(service.name) ?? {
            name: service.name,
            type: service.type,
            price: service.price,
            mentions: 0,
          };
          current.mentions += 1;
          found.set(service.name, current);
        }
      });
    });

  return [...found.values()];
};

const buildOptimisationSummary = (services: ParsedService[]): string[] => {
  const grouped = services.reduce<Record<string, ParsedService[]>>((acc, service) => {
    if (!acc[service.type]) {
      acc[service.type] = [];
    }
    acc[service.type].push(service);
    return acc;
  }, {});

  const suggestions: string[] = [];

  Object.entries(grouped).forEach(([segment, segmentServices]) => {
    if (segmentServices.length < 2) {
      if (segmentServices.length === 1 && segmentServices[0].price) {
        suggestions.push(
          `${segment}: ${segmentServices[0].name} стоит ≈${segmentServices[0].price} ₽/мес. Сравни с годовым тарифом — можно сэкономить 15–20%.`
        );
      }
      return;
    }

    const ordered = [...segmentServices].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    const keep = ordered[0];
    const redundant = ordered.slice(1);
    const saving = redundant.reduce((total, item) => total + (item.price ?? 0), 0);

    suggestions.push(
      `${segment}: оставь ${keep.name}, отключи ${redundant
        .map((item) => item.name)
        .join(", ")} → экономия примерно ${saving} ₽/мес.`
    );
  });

  return suggestions;
};

const DEFAULT_STRATEGIES = [
  "Если оплачиваешь два видеосервиса (например, Netflix и Иви) — оставь тот, где больше премьер, а второй отключи → экономия 500–700 ₽/мес.",
  "СберПрайм или Яндекс Плюс обычно включают Кинопоиск + музыку + доставка. Они дешевле, чем оплачивать всё раздельно, поэтому стоит перейти на пакет.",
  "Годовые планы Adobe, Spotify, YouTube Premium дают 15–20% скидки. Оплати с кэшбэком банковской карты — ещё −5%.",
];

const buildMockReply = (messages: AgentChatMessage[]): string => {
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  const services = extractServicesFromHistory(messages);
  const suggestions = buildOptimisationSummary(services);

  const intro = lastUser?.content?.trim()
    ? `Отвечаю на «${lastUser.content.trim()}».`
    : "Вот что могу предложить по оптимизации подписок:";

  if (services.length > 0 && suggestions.length > 0) {
    return [
      intro,
      `Сейчас у тебя фигурируют: ${services.map((service) => service.name).join(", ")}.`,
      ...suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`),
      "Если добавишь стоимость или новые сервисы — посчитаю точную экономию.",
    ].join("\n");
  }

  const fallbackList = DEFAULT_STRATEGIES.map((strategy, index) => `${index + 1}. ${strategy}`);

  if (services.length > 0) {
    return [
      intro,
      `Уже вижу ${services.map((service) => service.name).join(", ")}.`,
      ...fallbackList,
      "Напиши стоимость каждой подписки — построю персональный план экономии.",
    ].join("\n");
  }

  return [intro, ...fallbackList, "Перечисли свои сервисы и цены — адаптирую рекомендации под тебя."].join("\n");
};

type ChatRequest = {
  messages: AgentChatMessage[];
};

type ChatResponse = {
  reply: string;
};

const isChatMessage = (value: unknown): value is AgentChatMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const { role, content } = value as Record<string, unknown>;
  return (role === "user" || role === "assistant") && typeof content === "string" && content.trim().length > 0;
};

const sanitizeMessages = (messages: AgentChatMessage[]): AgentChatMessage[] => {
  const trimmed = messages
    .slice(-MAX_MESSAGES)
    .map((message) => ({ ...message, content: message.content.trim() }))
    .filter((message) => message.content.length > 0);

  return trimmed;
};

const buildPrompt = (messages: AgentChatMessage[]): string => {
  const history = messages
    .map((message) => `${message.role === "assistant" ? "Агент" : "Пользователь"}: ${message.content}`)
    .join("\n");

  return `${history}\n\nОтветь как эксперт по подпискам: дай конкретные советы, цифры экономии, варианты альтернатив. Если нет данных — попроси уточнить.`;
};

export async function POST(request: Request): Promise<NextResponse<ChatResponse | { error: string }>> {
  let body: ChatRequest;

  try {
    body = (await request.json()) as ChatRequest;
  } catch (error) {
    console.error("chat-agent: invalid JSON body", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.messages)) {
    return NextResponse.json({ error: "'messages' must be an array" }, { status: 400 });
  }

  const sanitized = sanitizeMessages(body.messages).filter((message) => isChatMessage(message));

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
    return NextResponse.json({ error: "Provide at least one user message" }, { status: 400 });
  }

  try {
    const raw = await callLLM({
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(sanitized),
      mock: { reply: buildMockReply(sanitized) },
    });

    let reply = raw.trim();
    try {
      const parsed = JSON.parse(raw) as { reply?: string };
      if (parsed.reply && typeof parsed.reply === "string") {
        reply = parsed.reply;
      }
    } catch (error) {
      console.debug("chat-agent: response is not JSON, using raw text");
    }

    if (!reply) {
      reply = "Я не получил ответа от модели. Попробуй сформулировать вопрос иначе.";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("chat-agent: LLM call failed", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
