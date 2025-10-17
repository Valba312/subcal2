"use client";

import Link from "next/link";
import { CreditCard, BarChart3, Bell, Shield, Zap, Globe } from "lucide-react";

export default function Home() {
  const features = [
    { icon: CreditCard, title: "Управление подписками", description: "Добавляйте, редактируйте и удаляйте подписки с лёгкостью." },
    { icon: BarChart3, title: "Аналитика расходов", description: "Следите за ежемесячными и годовыми затратами." },
    { icon: Bell, title: "Напоминания", description: "Не пропускайте дату продления." },
    { icon: Shield, title: "Конфиденциальность", description: "Все данные сохраняются локально в браузере." },
    { icon: Zap, title: "Быстрый старт", description: "Никакой регистрации — открыли и пользуетесь." },
    { icon: Globe, title: "i18n (ru/en)", description: "Интерфейс поддерживает русский и английский языки." },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <header className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Калькулятор подписок</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Контролируйте свои подписки и держите бюджет под контролем.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
          >
            <CreditCard className="w-5 h-5" />
            Начать бесплатно
          </Link>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl p-5 bg-white dark:bg-gray-900 shadow border border-gray-200/60 dark:border-gray-800">
              <f.icon className="w-6 h-6 mb-3" />
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{f.description}</p>
            </div>
          ))}
        </section>

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-12">
          Сделано на Next.js 14 + TypeScript + Tailwind.
        </footer>
      </div>
    </main>
  );
}