"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, DollarSign, TrendingUp } from "lucide-react";

type Cycle = "monthly" | "yearly";

interface Subscription {
  id: number;
  name: string;
  cost: number;
  currency: string;
  nextPayment: string; // ISO date
  category: string;
  billingCycle: Cycle;
  description?: string;
}

const CURRENCIES = ["RUB", "USD", "EUR"] as const;
const CATEGORIES = ["Видео", "Музыка", "Облако", "ПО", "Игры", "Другое"] as const;

export default function Dashboard() {
  const [items, setItems] = useState<Subscription[]>([
    {
      id: 1,
      name: "Netflix",
      cost: 9.99,
      currency: "USD",
      nextPayment: new Date().toISOString().slice(0, 10),
      category: "Видео",
      billingCycle: "monthly",
      description: "Стандартный план",
    },
    {
      id: 2,
      name: "iCloud",
      cost: 0.99,
      currency: "USD",
      nextPayment: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().slice(0, 10),
      category: "Облако",
      billingCycle: "monthly",
    },
  ]);

  const [visibleAmounts, setVisibleAmounts] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Subscription, "id">>({
    name: "",
    cost: 0,
    currency: "USD",
    nextPayment: new Date().toISOString().slice(0, 10),
    category: "Другое",
    billingCycle: "monthly",
    description: "",
  });

  const resetForm = () =>
    setForm({
      name: "",
      cost: 0,
      currency: "USD",
      nextPayment: new Date().toISOString().slice(0, 10),
      category: "Другое",
      billingCycle: "monthly",
      description: "",
    });

  const totals = useMemo(() => {
    const monthly = items.reduce((sum, s) => sum + (s.billingCycle === "monthly" ? s.cost : s.cost / 12), 0);
    const yearly = items.reduce((sum, s) => sum + (s.billingCycle === "yearly" ? s.cost : s.cost * 12), 0);
    return { monthly, yearly };
  }, [items]);

  const startEdit = (id: number) => {
    const s = items.find((x) => x.id === id);
    if (!s) return;
    setEditingId(id);
    const { id: _id, ...rest } = s;
    setForm(rest);
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) {
      setEditingId(null);
      resetForm();
    }
  };

  const submit = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setItems((prev) => prev.map((x) => (x.id === editingId ? { ...x, ...form } : x)));
      setEditingId(null);
      resetForm();
    } else {
      const nextId = (items.at(-1)?.id ?? 0) + 1;
      setItems((prev) => [...prev, { id: nextId, ...form }]);
      resetForm();
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Мои подписки</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVisibleAmounts((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              {visibleAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {visibleAmounts ? "Скрыть суммы" : "Показать суммы"}
            </button>
            <Link href="/" className="text-sm underline">На главную</Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 bg-white dark:bg-gray-900 shadow border border-gray-200/60 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="w-4 h-4" /> В месяц
            </div>
            <div className="text-2xl font-semibold">
              {visibleAmounts ? totals.monthly.toFixed(2) : "•••"} USD*
            </div>
            <p className="text-xs text-gray-500 mt-1">* Для простоты суммы сведены к USD без конвертации.</p>
          </div>
          <div className="rounded-2xl p-5 bg-white dark:bg-gray-900 shadow border border-gray-200/60 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="w-4 h-4" /> В год
            </div>
            <div className="text-2xl font-semibold">
              {visibleAmounts ? totals.yearly.toFixed(2) : "•••"} USD*
            </div>
            <p className="text-xs text-gray-500 mt-1">* Эквивалент по циклам оплаты.</p>
          </div>
          <div className="rounded-2xl p-5 bg-white dark:bg-gray-900 shadow border border-gray-200/60 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingUp className="w-4 h-4" /> Всего подписок
            </div>
            <div className="text-2xl font-semibold">{items.length}</div>
          </div>
        </div>

        {/* Editor */}
        <div className="rounded-2xl p-5 bg-white dark:bg-gray-900 shadow border border-gray-200/60 dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-3">{editingId ? "Редактировать подписку" : "Добавить подписку"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="rounded-lg border px-3 py-2 bg-transparent"
              placeholder="Название (например, Netflix)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              className="rounded-lg border px-3 py-2 bg-transparent"
              placeholder="Стоимость"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
            />
            <select
              className="rounded-lg border px-3 py-2 bg-transparent"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="rounded-lg border px-3 py-2 bg-transparent"
              value={form.nextPayment}
              onChange={(e) => setForm({ ...form, nextPayment: e.target.value })}
            />
            <select
              className="rounded-lg border px-3 py-2 bg-transparent"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border px-3 py-2 bg-transparent"
              value={form.billingCycle}
              onChange={(e) => setForm({ ...form, billingCycle: e.target.value as Cycle })}
            >
              <option value="monthly">Ежемесячно</option>
              <option value="yearly">Ежегодно</option>
            </select>
          </div>
          <textarea
            className="rounded-lg border px-3 py-2 bg-transparent w-full mt-3"
            placeholder="Описание (необязательно)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-2 mt-3">
            <button onClick={submit} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? "Сохранить" : "Добавить"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
                className="rounded-lg px-4 py-2 border hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Отмена
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl p-5 bg-white dark:bg-gray-900 shadow border border-gray-200/60 dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-3">Список</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Название</th>
                  <th className="py-2 pr-4">Стоимость</th>
                  <th className="py-2 pr-4">Валюта</th>
                  <th className="py-2 pr-4">Цикл</th>
                  <th className="py-2 pr-4">Категория</th>
                  <th className="py-2 pr-4">Следующий платёж</th>
                  <th className="py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-t border-gray-200/60 dark:border-gray-800">
                    <td className="py-2 pr-4">{s.name}</td>
                    <td className="py-2 pr-4">{visibleAmounts ? s.cost.toFixed(2) : "•••"}</td>
                    <td className="py-2 pr-4">{s.currency}</td>
                    <td className="py-2 pr-4">{s.billingCycle === "monthly" ? "Месяц" : "Год"}</td>
                    <td className="py-2 pr-4">{s.category}</td>
                    <td className="py-2 pr-4">{s.nextPayment}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(s.id)} className="rounded-md px-2 py-1 border hover:bg-gray-50 dark:hover:bg-gray-900 inline-flex items-center gap-1">
                          <Edit2 className="w-4 h-4" /> Правка
                        </button>
                        <button onClick={() => deleteItem(s.id)} className="rounded-md px-2 py-1 border hover:bg-gray-50 dark:hover:bg-gray-900 inline-flex items-center gap-1">
                          <Trash2 className="w-4 h-4" /> Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}