import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  BarChart3,
  Bell,
  ShieldCheck,
  Zap,
  Globe2,
} from "lucide-react";

type Feature = {
  title: string;
  desc: string;
  Icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Управление подписками",
    desc: "Добавляйте, редактируйте и удаляйте в два клика.",
    Icon: CreditCard,
  },
  {
    title: "Аналитика расходов",
    desc: "Месячные/годовые траты и категории.",
    Icon: BarChart3,
  },
  {
    title: "Напоминания",
    desc: "Не пропускайте дату продления.",
    Icon: Bell,
  },
  {
    title: "Конфиденциальность",
    desc: "Все данные хранятся локально в браузере.",
    Icon: ShieldCheck,
  },
  {
    title: "Быстрый старт",
    desc: "Без регистрации — открыл и пользуешься.",
    Icon: Zap,
  },
  {
    title: "i18n (ru/en)",
    desc: "Интерфейс на русском и английском.",
    Icon: Globe2,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-clip bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* декоративный фон */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60rem_30rem_at_50%_-10%,#000_20%,transparent_60%)]"
      >
        <div className="absolute -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
             style={{ background:
               "conic-gradient(at 50% 50%, hsl(262 83% 58%) 0deg, hsl(189 92% 48%) 140deg, hsl(160 80% 55%) 220deg, hsl(262 83% 58%) 360deg)" }} />
      </div>

      <section className="container mx-auto px-4 pt-20 pb-10">
        {/* hero */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-primary">
            Калькулятор подписок
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
            Контролируйте свои подписки и держите бюджет под контролем.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-white shadow-sm transition
                         hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 blur-md transition group-hover:opacity-100" />
              <span className="translate-y-[1px]">🚀</span>
              Начать бесплатно
            </Link>

            <a
              href="https://github.com"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-slate-700 transition hover:-translate-y-0.5 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              ⭐ Посмотреть исходники
            </a>
          </div>

          {/* маленький акцент под hero */}
          <div className="mx-auto mt-8 h-1 w-28 rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>

        {/* фичи */}
        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} i={i} />
          ))}
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  desc,
  Icon,
  i,
}: {
  title: string;
  desc: string;
  Icon: LucideIcon;
  i: number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur transition
                 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-800/60"
      style={{ transitionDelay: `${i * 30}ms` }}
    >
      {/* светящийся акцент при ховере */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-lg transition group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(40rem 12rem at 20% -10%, rgba(124,58,237,.22), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex items-start gap-3">
        <div
          className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 transition
                     group-hover:scale-110"
        >
          <Icon className="h-6 w-6 text-primary transition-transform group-hover:-translate-y-0.5" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {desc}
          </p>
        </div>
      </div>

      {/* нижняя подсветка при ховере */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-accent transition group-hover:scale-x-100" />
    </div>
  );
}
