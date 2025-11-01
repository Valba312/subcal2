import { NextResponse } from "next/server";

import { callLLM } from "../../../../lib/ai";
import type { Category } from "../../../../types/subscription";

const ALLOWED_CATEGORIES: Category[] = [
  "Entertainment",
  "Productivity",
  "Education",
  "Utilities",
  "Finance",
  "Health",
  "Gaming",
  "Cloud",
  "Other",
];

const SYSTEM_PROMPT =
  "Определи category и tags строго по схеме. Допустимые категории: ['Entertainment','Productivity','Education','Utilities','Finance','Health','Gaming','Cloud','Other']. Если сомневаешься — Other. Верни строго JSON.";

type CategorizeRequest = {
  name: string;
  notes?: string;
  url?: string;
};

type CategorizeResponse = {
  category: Category;
  tags: string[];
};

function buildPrompt({ name, notes, url }: CategorizeRequest): string {
  const payload = [
    `Название: ${name}`,
    `Описание: ${notes ?? "—"}`,
    `URL: ${url ?? "—"}`,
  ].join("\n");

  return `${payload}\n\nВерни JSON с ключами "category" и "tags" (массив строк).`;
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter((tag) => tag.length > 0);
}

function normalizeCategory(category: unknown): Category {
  if (typeof category === "string") {
    const normalized = ALLOWED_CATEGORIES.find((item) => item === category);
    if (normalized) {
      return normalized;
    }
  }
  return "Other";
}

export async function POST(request: Request): Promise<NextResponse<CategorizeResponse | { error: string }>> {
  let body: CategorizeRequest;

  try {
    body = (await request.json()) as CategorizeRequest;
  } catch (error) {
    console.error("categorize: invalid JSON body", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.name || body.name.trim().length === 0) {
    return NextResponse.json({ error: "'name' is required" }, { status: 400 });
  }

  try {
    const result = await callLLM({
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(body),
      json: true,
    });

    try {
      const parsed = JSON.parse(result) as { category?: unknown; tags?: unknown };
      const category = normalizeCategory(parsed.category);
      const tags = normalizeTags(parsed.tags);

      return NextResponse.json({ category, tags });
    } catch (error) {
      console.error("categorize: failed to parse LLM response", { result, error });
      return NextResponse.json({ error: "Failed to parse LLM response" }, { status: 500 });
    }
  } catch (error) {
    console.error("categorize: LLM call failed", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
