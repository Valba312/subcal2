import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
      <div className="container flex items-center gap-6 py-4">
        <Link href="/" aria-label="SubKeeper — главная">
          <Logo withText />
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
          <Link
            href="/agent"
            className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200"
          >
            AI агент
          </Link>
          <Link
            href="/analytics"
            className="rounded-lg border border-primary/50 bg-white px-4 py-2 text-primary transition hover:border-primary hover:text-primary/90 dark:bg-slate-900 dark:text-primary-200"
          >
            Аналитика
          </Link>
          <Link
            href="/calculator"
            className="rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
          >
            Калькулятор
          </Link>
        </nav>
      </div>
    </header>
  );
}
