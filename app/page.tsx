import Link from "next/link";
import { CheckCircle2, LineChart, Lock, Sparkles, Target, Timer, Wallet } from "lucide-react";

const features = [
  {
    title: "Полная видимость расходов",
    description: "Единый экран с ежемесячными и годовыми суммами, конвертацией валют и прогнозом на год.",
    icon: Wallet,
  },
  {
    title: "Умные напоминания",
    description: "SubKeeper заранее подскажет, когда подходит списание, чтобы вы успели отменить или продлить оплату.",
    icon: Timer,
  },
  {
    title: "Аналитика и тренды",
    description: "Линейные графики, круговые диаграммы и фильтры периодов показывают, куда уходит бюджет.",
    icon: LineChart,
  },
  {
    title: "AI-агент",
    description: "Ищет пересечения (Netflix vs Иви), предлагает отключить или заменить, считает экономию.",
    icon: Sparkles,
  },
  {
    title: "Совместное использование",
    description: "Поддержка нескольких профилей и экспорт отчётов для команды или семьи.",
    icon: Target,
  },
  {
    title: "Конфиденциальность",
    description: "Данные остаются локально, мы не отправляем их на сервер без явного согласия.",
    icon: Lock,
  },
];

const checklist = [
  "Добавление подписок в несколько кликов",
  "Расчёт месячных и годовых расходов",
  "Поддержка разных валют и периодов оплаты",
];

export default function Home() {
  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-to-br from-[#ebe8ff] via-white to-[#e6f7ff] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <BackgroundAccent />
      <section className="relative z-10 py-16 md:py-24">
        <div className="container flex max-w-6xl flex-col gap-16">
          <Hero />
          <Features />
          <ProductModules />
          <HowItWorks />
          <CtaSection />
        </div>
      </section>
    </div>
  );
}

function BackgroundAccent() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/10 opacity-70 dark:opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(70rem_40rem_at_50%_-10%,rgba(124,58,237,0.25),transparent_70%)]" />
      <div
        className="absolute -top-48 left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full opacity-80 blur-3xl md:opacity-90"
        style={{
          background:
            "conic-gradient(at 50% 50%, hsl(262 83% 58%) 0deg, hsl(189 92% 48%) 140deg, hsl(160 80% 55%) 240deg, hsl(262 83% 58%) 360deg)",
        }}
      />
      <div
        className="absolute -bottom-40 right-1/3 h-[30rem] w-[30rem] rounded-full opacity-70 blur-3xl md:opacity-80"
        style={{ background: "radial-gradient(circle at 30% 30%, rgba(14,165,233,0.35), transparent 60%)" }}
      />
    </div>
  );
}

function Hero() {
  return (
    <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" aria-hidden />
          Управляйте подписками без хаоса
        </span>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl dark:text-white">
          SubKeeper — умный помощник для подписок
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Сохраняйте баланс между удобством сервисов и контролем расходов. SubKeeper собирает все подписки в одном месте,
          подсказывает, когда пора отменить оплату, и показывает, сколько вы экономите.
        </p>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/calculator"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-primary/90"
          >
            Открыть калькулятор
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary dark:hover:text-white"
          >
            Как это работает
          </Link>
        </div>
      </div>
      <Illustration />
    </div>
  );
}

function Illustration() {
  return (
    <div className="relative isolate mx-auto w-full max-w-[420px] rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="absolute inset-x-8 -top-6 h-12 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-xl" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-slate-900/95 px-4 py-3 text-white shadow-inner">
          <span className="text-sm uppercase tracking-wide text-slate-300">Итого в месяц</span>
          <span className="text-2xl font-bold">6 490 ₽</span>
        </div>
        <div className="grid gap-3">
          {[
            { name: "Netflix Premium", price: "599 ₽", period: "мес" },
            { name: "Spotify Family", price: "269 ₽", period: "мес" },
            { name: "Adobe Creative Cloud", price: "3 299 ₽", period: "мес" },
            { name: "Notion AI", price: "10 $", period: "мес" },
          ].map((sub) => (
            <div
              key={sub.name}
              className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/70"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">{sub.name}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {sub.price} <span className="text-xs uppercase text-slate-400 dark:text-slate-500">/{sub.period}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      {features.map((feature) => (
        <div key={feature.title} className="transition-transform duration-300 hover:-translate-y-1">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(24rem 12rem at 30% -10%, rgba(124,58,237,0.2), transparent 70%)" }} />
            <div className="relative z-10 space-y-4">
              <feature.icon className="h-10 w-10 text-primary" aria-hidden />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function ProductModules() {
  const modules = [
    {
      label: "Калькулятор",
      description: "Добавляйте подписки, пересчитывайте стоимость в месяц и год, фиксируйте валюты.",
      href: "/calculator",
      accent: "Расчёты",
    },
    {
      label: "Аналитика",
      description: "Линейные графики, круговые диаграммы и календарь оплат для планирования бюджета.",
      href: "/analytics",
      accent: "Отчёты",
    },
    {
      label: "AI-агент",
      description: "Ищет конфликты, предлагает отключить дубли и показывает, сколько сэкономите.",
      href: "/agent",
      accent: "Экономия",
    },
  ];

  return (
    <section className="grid gap-6 rounded-3xl border border-white/40 bg-white/70 p-8 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Модули SubKeeper</h2>
        <p className="text-slate-600 dark:text-slate-300">Любой сценарий решается через калькулятор, аналитику или AI-агента.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.label}
            href={module.href}
            className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-white/80 px-5 py-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/70 dark:bg-slate-900/60"
          >
            <span className="text-xs uppercase tracking-[0.15em] text-primary/80">{module.accent}</span>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">{module.label}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{module.description}</p>
            <span className="text-sm font-semibold text-primary">Перейти →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="grid gap-8 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60"
    >
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">3 шага к прозрачным подпискам</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Всё работает прямо в браузере — достаточно открыть SubKeeper и внести активные подписки.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "1. Добавьте сервисы",
            description:
              "Укажите название, стоимость и периодичность оплаты. Поддерживаются месячные, годовые и пользовательские периоды.",
          },
          {
            title: "2. Настройте напоминания",
            description: "SubKeeper подскажет, когда подходит дата списания, чтобы вы могли вовремя продлить или отменить подписку.",
          },
          {
            title: "3. Анализируйте траты",
            description: "Смотрите, сколько тратите на каждый сервис и в сумме, чтобы принимать решения и экономить.",
          },
        ].map((step) => (
          <div key={step.title} className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900">
            <p className="text-sm font-semibold text-primary">{step.title}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-10 shadow-lg dark:border-slate-700/70 dark:bg-slate-900">
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Попробуйте SubKeeper сегодня</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Добавьте свои подписки, настройте напоминания и подключите AI‑агента для поиска дубликатов. Всё бесплатно и максимально просто.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/calculator" className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition hover:bg-primary/90">
              Начать
            </Link>
            <Link href="/agent" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300">
              AI агент
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200/70 bg-slate-50/60 p-6 dark:border-slate-700/70 dark:bg-slate-800/60">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Возможности:</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>• Синхронизированный калькулятор и аналитика</li>
            <li>• AI‑агент для поиска конфликтов</li>
            <li>• Экспорт данных и демо-режим</li>
            <li>• Локальное хранение данных</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
