"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchChat } from "../lib/aiClient";
import type { ChatMessage } from "../types/chat";

const MAX_HISTORY = 20;

const createMessageId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createMessage = (role: ChatMessage["role"], content: string): ChatMessage => ({
  id: createMessageId(),
  role,
  content,
  createdAt: Date.now(),
});

const limitMessages = (list: ChatMessage[]) => list.slice(-MAX_HISTORY);

const INITIAL_MESSAGE: ChatMessage = {
  id: createMessageId(),
  role: "assistant",
  content: "Привет! Я помогу найти дубли, оценить экономию и подобрать более выгодные планы. Чем могу помочь?",
  createdAt: Date.now(),
};

type AgentChatProps = {
  context?: unknown;
};

export default function AgentChat({ context }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [toast, setToast] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    },
    []
  );

  const handleAbort = useCallback(() => {
    if (abortControllerRef.current) {
      console.debug("AgentChat: abort requested");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsSending(false);
    }
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleAbort();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleAbort]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const content = input.trim();
      if (!content || isSending) {
        return;
      }

      console.debug("AgentChat: submit", { contentLength: content.length, totalMessages: messages.length });

      const userMessage = createMessage("user", content);
      const baseHistory = [...messages, userMessage];
      const payloadHistory = limitMessages(baseHistory);
      const assistantMessage = createMessage("assistant", "");
      const optimisticHistory = [...baseHistory, assistantMessage];

      setMessages(optimisticHistory);
      setInput("");
      setIsSending(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await fetchChat({
          conversationId,
          context,
          messages: payloadHistory,
          signal: controller.signal,
          onChunk: (chunk) => {
            console.debug("AgentChat: stream chunk", { size: chunk.length });
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessage.id ? { ...message, content: `${message.content}${chunk}` } : message
              )
            );
          },
        });

        setConversationId(result.conversationId ?? conversationId);
        setMessages((prev) => prev.map((message) => (message.id === assistantMessage.id ? result.message : message)));
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          setMessages((prev) => prev.filter((message) => message.id !== assistantMessage.id));
          showToast("Ответ остановлен");
        } else {
          console.error("AgentChat: send failed", error);
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content: "Упс, не получилось ответить. Попробуй ещё раз чуть позже.",
                  }
                : message
            )
          );
          showToast(error instanceof Error ? error.message : "Не удалось получить ответ");
        }
      } finally {
        setIsSending(false);
        abortControllerRef.current = null;
      }
    },
    [conversationId, context, input, isSending, messages, showToast]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = useCallback(() => {
    handleAbort();
    setConversationId(undefined);
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(null);
  }, [handleAbort]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div
        ref={listRef}
        className="relative h-[460px] w-full overflow-y-auto rounded-[32px] border border-slate-200/80 bg-white/95 p-6 text-slate-900 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/90 dark:text-white"
      >
        <div className="pointer-events-none absolute inset-x-6 top-0 h-16 bg-gradient-to-b from-white/70 to-transparent dark:from-slate-900/70" />
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"} transition-all duration-300`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm transition ${
                  message.role === "assistant"
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "bg-gradient-to-r from-primary to-purple-500 text-white"
                }`}
              >
                {message.content && message.content.trim().length > 0 ? (
                  message.content
                ) : (
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-300">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <span
                        key={`dot-${message.id}-${index}`}
                        className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: `${index * 120}ms` }}
                      />
                    ))}
                    Агент печатает...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Нажми Enter, чтобы отправить. Shift+Enter — новая строка. ESC или «Отмена» — остановят ответ.</span>
          <button type="button" onClick={handleReset} className="text-primary underline-offset-2 hover:underline">
            Сбросить диалог
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_25px_45px_-35px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-slate-900"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Спросите агента: например, какие подписки отключить или как платить меньше"
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSending || input.trim().length === 0}
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending ? "Агент отвечает..." : "Отправить"}
            </button>
            <button
              type="button"
              onClick={handleAbort}
              disabled={!isSending}
              className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
            >
              Отмена
            </button>
          </div>
          {toast && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{toast}</p>}
        </form>
      </div>
    </div>
  );
}
