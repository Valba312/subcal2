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
