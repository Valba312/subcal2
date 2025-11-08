import type { Advice, Conflict, Subscription } from "../types/subscription";

export type AgentResult = {
  conflicts: Conflict[];
  advice: Advice[];
  monthlyBefore: number;
  monthlyAfter: number;
  savingPerMonth: number;
};

export async function runAgent(subscriptions: Subscription[]): Promise<AgentResult> {
  const response = await fetch("/api/ai/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscriptions }),
  });

  if (!response.ok) {
    console.error("runAgent failed", { status: response.status });
    throw new Error("Agent request failed");
  }

  return (await response.json()) as AgentResult;
}
