import type { Category } from "../types/subscription";

type CategorizeInput = {
  name: string;
  notes?: string;
  url?: string;
};

type CategorizeResult = {
  category: Category;
  tags: string[];
};

export async function aiCategorize(input: CategorizeInput): Promise<CategorizeResult> {
  const response = await fetch("/api/ai/categorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    console.error("aiCategorize failed", { status: response.status });
    throw new Error("aiCategorize failed");
  }

  return (await response.json()) as CategorizeResult;
}
