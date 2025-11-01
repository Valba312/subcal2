"use client";

import { useState } from "react";

import { aiCategorize } from "../lib/categorize";
import type { Category, Subscription } from "../types/subscription";

const CATEGORY_OPTIONS: Category[] = [
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

type SubscriptionFormValues = {
  name: string;
  notes: string;
  url: string;
  category: Category;
  tags: string[];
};

type SubscriptionFormProps = {
  defaultValues?: Partial<Subscription>;
  onSubmit?: (values: SubscriptionFormValues) => void | Promise<void>;
};

export default function SubscriptionForm({ defaultValues, onSubmit }: SubscriptionFormProps) {
  const [formState, setFormState] = useState({
    name: defaultValues?.name ?? "",
    notes: defaultValues?.notes ?? "",
    url: defaultValues?.url ?? "",
    category: defaultValues?.category ?? "Other",
  });
  const [tagsInput, setTagsInput] = useState(() => (defaultValues?.tags ?? []).join(", "));
  const [isCategorizing, setIsCategorizing] = useState(false);

  const handleFieldChange = <Field extends keyof typeof formState>(
    field: Field,
    value: (typeof formState)[Field]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoCategorize = async () => {
    if (!formState.name.trim()) {
      return;
    }

    setIsCategorizing(true);
    try {
      const result = await aiCategorize({
        name: formState.name,
        notes: formState.notes || undefined,
        url: formState.url || undefined,
      });
      setFormState((prev) => ({ ...prev, category: result.category }));
      setTagsInput(result.tags.join(", "));
    } catch (error) {
      console.error("SubscriptionForm auto categorize failed", error);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onSubmit) {
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      await onSubmit({
        name: formState.name.trim(),
        notes: formState.notes.trim(),
        url: formState.url.trim(),
        category: formState.category,
        tags,
      });
    } catch (error) {
      console.error("SubscriptionForm submit failed", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid gap-4">
        <label className="space-y-1 text-sm font-medium">
          <span>Название</span>
          <input
            value={formState.name}
            onChange={(event) => handleFieldChange("name", event.target.value)}
            placeholder="Например, Notion или Adobe"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900/70"
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Заметки</span>
          <textarea
            value={formState.notes}
            onChange={(event) => handleFieldChange("notes", event.target.value)}
            rows={3}
            placeholder="Дополнительная информация"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900/70"
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>URL</span>
          <input
            value={formState.url}
            onChange={(event) => handleFieldChange("url", event.target.value)}
            placeholder="https://service.com"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900/70"
          />
        </label>
      </div>

      <div className="grid gap-3">
        <label className="space-y-1 text-sm font-medium">
          <span className="flex items-center justify-between">
            <span>Категория</span>
            <button
              type="button"
              onClick={handleAutoCategorize}
              disabled={isCategorizing || formState.name.trim().length === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500"
            >
              {isCategorizing ? "Определяем..." : "Определить автоматически"}
            </button>
          </span>
          <select
            value={formState.category}
            onChange={(event) => handleFieldChange("category", event.target.value as Category)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900/70"
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Теги (через запятую)</span>
          <input
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="productivity, notes"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900/70"
          />
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
      >
        Сохранить подписку
      </button>
    </form>
  );
}
