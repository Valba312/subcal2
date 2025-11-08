import type { AgentChatMessage } from "../types/subscription";

export type AgentChatReply = {
  reply: string;
};

export async function sendAgentChat(messages: AgentChatMessage[]): Promise<AgentChatReply> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    console.error("sendAgentChat failed", { status: response.status });
    throw new Error("Не удалось получить ответ агента");
  }

  return (await response.json()) as AgentChatReply;
}
