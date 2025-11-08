"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { sendAgentChat } from "../lib/agent-chat";
import type { AgentChatMessage } from "../types/subscription";

const INITIAL_MESSAGE: AgentChatMessage = {
  role: "assistant",
  content: "Привет! Я помогу найти дубли, оценить экономию и подобрать более выгодные планы. Чем могу помочь?",
};

export default function AgentChat() {
  const [messages, setMessages] = useState<AgentChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isSending) {
      return;
    }

    const nextMessages: AgentChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await sendAgentChat(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
    } catch (chatError) {
      console.error("AgentChat send failed", chatError);
      setError(chatError instanceof Error ? chatError.message : "Не удалось получить ответ" );
      setMessages((prev) => [...prev, { role: "assistant", content: "Упс, не получилось ответить. Попробуй ещё раз чуть позже." }]);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, messages]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div
        ref={listRef}
        className="relative h-[480px] w-full overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-[0_35px_55px_-30px_rgba(15,23,42,1)]"
      >
        <div className="pointer-events-none absolute inset-x-6 top-6 h-32 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"} transition-all duration-300`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-lg shadow-black/20 transition ${
                  message.role === "assistant" ? "bg-white/5 text-white backdrop-blur-sm" : "bg-gradient-to-r from-primary to-purple-500 text-white"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm text-white/80">
                <span className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, dot) => (
                    <span
                      key={dot}
                      className="h-2 w-2 animate-bounce rounded-full bg-white/70"
                      style={{ animationDelay: `${dot * 120}ms` }}
                    />
                  ))}
                </span>
                Думаю над ответом...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Нажми Enter, чтобы отправить. Shift+Enter — новая строка.</span>
          <button type="button" onClick={handleReset} className="text-primary underline-offset-2 hover:underline">
            Сбросить диалог
          </button>
        </div>
        <div className="flex flex-col gap-3 rounded-3xl border border-white/20 bg-white/80 p-5 shadow-[0_25px_45px_-35px_rgba(15,23,42,1)] backdrop-blur dark:border-white/5 dark:bg-slate-900/70">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Спросите агента: например, какие подписки отключить или как платить меньше"
            className="w-full resize-none rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/30 dark:border-slate-700/60 dark:bg-slate-900/40"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || input.trim().length === 0}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSending ? "Агент отвечает..." : "Отправить"}
          </button>
          {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
