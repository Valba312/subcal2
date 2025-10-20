import Link from "next/link";
import { CreditCard, BarChart3, Bell, ShieldCheck, Zap, Globe2, ArrowRight } from "lucide-react";

const features = [
  { title: "Управление подписками", desc: "Добавляйте, редактируйте и удаляйте в два клика.", Icon: CreditCard },
  { title: "Аналитика расходов",    desc: "Месячные/годовые траты и категории.",             Icon: BarChart3 },
  { title: "Напоминания",           desc: "Не пропускайте дату продления.",                  Icon: Bell },
  { title: "Конфиденциальность",    desc: "Данные только у вас — в браузере.",               Icon: ShieldCheck },
  { title: "Быстрый старт",         desc: "Без регистрации — открыл и пользуешься.",         Icon: Zap },
  { title: "i18n (ru/en)",          desc: "Интерфейс на русском и английском.",              Icon: Globe2 },
];

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-clip bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* фон с мягким свечением */}
      <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60rem_30rem_at_50%_-10%,#000_20%,transparent_60%)]">
        <div className="absolute -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
             style={{ background:"conic-gradient(at 50% 50%, hsl(262 83% 58%) 0deg, hsl(189 92% 48%) 140deg, hsl(160 80% 55%) 220deg, hsl(262 83% 58%) 360deg)" }} />
      </div>

      <section className="container pt-18 md:pt-24 pb-10">
        {/* HERO */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Личный контроль подписок</span>
          <h1 className="mt-4 text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
            Калькулятор подписок
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-600 dark:text-slate-300">
            Видимость расходов, напоминания и аналитика — всё в одном месте.
          </p>

          {/* CTA + подпись */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Начать бесплатно <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5"/>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Создайте первую подписку — мы покажем, сколько вы экономите в месяц и за год.
            </p>
          </div>

          {/* микроакцент */}
          <div className="mx-auto mt-8 h-1 w-28 rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>

        {/* преимущества */}
        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} i={i} />
          ))}
        </div>
      </section>

      {/* блок доверия */}
      <TrustSection />

      {/* мини-демо */}
      <DemoSection />
    </main>
  );
}

function FeatureCard({ title, desc, Icon, i }:{
  title:string; desc:string; Icon:any; i:number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur transition
                 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-800/60"
      style={{ transitionDelay: `${i * 30}ms` }}
    >
      <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-lg transition group-hover:opacity-100"
           style={{ background:"radial-gradient(40rem 12rem at 20% -10%, rgba(124,58,237,.22), transparent 60%)" }} />
      <div className="relative z-10 flex items-start gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 transition group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary transition-transform group-hover:-translate-y-0.5" strokeWidth={2}/>
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{desc}</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-accent transition group-hover:scale-x-100" />
    </div>
  );
}

/* ---------- БЛОК ДОВЕРИЯ: отзывы + метрики ---------- */
function TrustSection() {
  return (
    <section className="container pb-16 pt-6">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200/70 bg-white/70 p-6 md:p-8 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/60">
        <div className="grid gap-6 md:grid-cols-3">
          {/* метрики */}
          <div className="col-span-1 flex flex-col justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-6">
            <Stat label="Средняя экономия" value="15–25%" />
            <Stat label="Подписок под контролем" value="1000+" />
            <Stat label="Время на учёт" value="~2 мин/нед" />
          </div>
          {/* отзывы */}
          <div className="md:col-span-2 grid gap-4">
            <Quote text="Перенёс все подписки — наконец-то вижу, где утекают деньги. Напоминания спасли от лишних списаний."
                   author="Иван, фрилансер"/>
            <Quote text="За первый месяц срезали 3 ненужные подписки, экономия стала наглядной."
                   author="Мария, маркетолог"/>
          </div>
        </div>
      </div>
    </section>
  );
}
function Stat({label,value}:{label:string;value:string}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
function Quote({text,author}:{text:string;author:string}) {
  return (
    <figure className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-700/70">
      <blockquote className="text-slate-700 dark:text-slate-200">“{text}”</blockquote>
      <figcaption className="mt-2 text-sm text-slate-500 dark:text-slate-400">— {author}</figcaption>
    </figure>
  );
}

/* ---------- МИНИ-ДЕМО: «добавьте подписку» ---------- */
function DemoSection() {
  return (
    <section className="container pb-24 pt-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/60">
        <h3 className="text-xl font-semibold">Как это работает</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Нажмите «Начать бесплатно», затем добавьте первую подписку. Пример ниже:
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto] items-center">
          <input placeholder="Netflix"
                 className="rounded-lg border border-slate-300/70 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"/>
          <span className="text-slate-400">×</span>
          <input placeholder="599 ₽/мес"
                 className="rounded-lg border border-slate-300/70 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"/>
          <button className="rounded-lg bg-primary px-3 py-2 text-white transition hover:bg-primary/90">Добавить</button>
        </div>
      </div>
    </section>
  );
}
