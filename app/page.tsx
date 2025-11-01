import Link from "next/link";
import { CheckCircle2, LineChart, Lock, Sparkles, Timer, Wallet } from "lucide-react";

const features = [
  {
    title: "Полная видимость расходов",
    description: "Ведите ежемесячные и годовые суммы по каждой подписке, чтобы держать бюджет под контролем.",
    icon: Wallet,
  },
  {
    title: "Умные напоминания",
    description: "Получайте уведомления до списания, чтобы отменять ненужные подписки вовремя.",
    icon: Timer,
  },
  {
    title: "Аналитика для решений",
    description: "Графики и категории помогут увидеть, где можно сократить траты.",
    icon: LineChart,
  },
  {
    title: "Конфиденциальность",
    description: "Данные хранятся локально — ничего не отправляем на сервер без вашего ведома.",
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
    <div className="relative min-h-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <BackgroundAccent />
      <section className="relative z-10 py-16 md:py-24">
        <div className="container flex max-w-6xl flex-col gap-16">
          <Hero />
          <Features />
          <HowItWorks />
          <CtaSection />
        </div>
      </section>
    </div>
  );
}

function BackgroundAccent() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-80 [mask-image:radial-gradient(70rem_40rem_at_50%_-10%,#000_30%,transparent_70%)]"
    >
      <div
        className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "conic-gradient(at 50% 50%, hsl(262 83% 58%) 0deg, hsl(189 92% 48%) 140deg, hsl(160 80% 55%) 240deg, hsl(262 83% 58%) 360deg)",
        }}
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
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
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
    <div className="grid gap-6 md:grid-cols-2">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/70 dark:bg-slate-900/60"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(24rem 12rem at 30% -10%, rgba(124,58,237,0.2), transparent 70%)",
            }}
          />
          <div className="relative z-10 space-y-4">
            <feature.icon className="h-10 w-10 text-primary" aria-hidden />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="grid gap-8 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight">3 шага к прозрачным подпискам</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Всё работает прямо в браузере — достаточно открыть SubKeeper и внести активные подписки.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "1. Добавьте сервисы",
            description: "Укажите название, стоимость и периодичность оплаты. Поддерживаются месячные, годовые и пользовательские периоды.",
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
          <div key={step.title} className="space-y-2 rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/50">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 p-10 text-center shadow-sm dark:from-primary/20 dark:to-accent/20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Начните контролировать подписки сегодня</h2>
        <p className="text-base text-slate-600 dark:text-slate-200">
          SubKeeper уже помогает пользователям находить лояльные тарифы и избавляться от лишних расходов. Присоединяйтесь и
          увидите, сколько можно сэкономить.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-primary/90"
        >
          Перейти к калькулятору
        </Link>
      </div>
    </section>
  );
}
