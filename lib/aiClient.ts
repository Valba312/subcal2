"use client";

import type { ChatMessage } from "../types/chat";

type FetchChatParams = {
  conversationId?: string;
  messages: ChatMessage[];
  context?: unknown;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => void;
};

type FetchChatResult = {
  message: ChatMessage;
  conversationId?: string;
};

const STREAM_CONTENT_TYPE = "text/event-stream";

const createMessageId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const cleanSSEPayload = (input: string) =>
  input
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => (line.startsWith("data:") ? line.slice(5).trim() : line.trim()))
    .join("\n");

export async function fetchChat({ conversationId, messages, context, signal, onChunk }: FetchChatParams): Promise<FetchChatResult> {
  const payload: Record<string, unknown> = {
    messages,
  };
  if (conversationId) {
    payload.conversationId = conversationId;
  }
  if (typeof context !== "undefined") {
    payload.context = context;
  }

  console.debug("aiClient.fetchChat: sending request", {
    messageCount: messages.length,
    lastRole: messages.at(-1)?.role,
  });

  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let errorMessage = "Не удалось получить ответ";
    try {
      const errorPayload = await response.json();
      if (typeof errorPayload?.error === "string") {
        errorMessage = errorPayload.error;
      }
    } catch {
      // ignore json parse errors
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const expectedConversationId = response.headers.get("x-conversation-id") ?? conversationId;

  if (contentType.includes(STREAM_CONTENT_TYPE) && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aggregated = "";
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const segments = buffer.split("\n\n");
      buffer = segments.pop() ?? "";

      segments.forEach((segment) => {
        const data = cleanSSEPayload(segment);
        if (!data || data === "[DONE]") {
          return;
        }
        aggregated += data;
        console.debug("aiClient.fetchChat: stream chunk", { size: data.length });
        onChunk?.(data);
      });
    }

    const streamedMessage: ChatMessage = {
      id: response.headers.get("x-message-id") ?? createMessageId(),
      role: "assistant",
      content: aggregated.trim(),
      createdAt: Date.now(),
    };

    return { message: streamedMessage, conversationId: expectedConversationId };
  }

  const data = (await response.json()) as FetchChatResult;
  console.debug("aiClient.fetchChat: received response", {
    messageLength: data.message?.content?.length ?? 0,
  });
  return data;
}
