export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/60 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800">
      <div className="container h-14 flex items-center gap-6">
        <a href="/" className="font-extrabold">Subwave</a>
        <nav className="ml-auto flex items-center gap-5 text-sm">
          <a href="/features" className="hover:text-primary">Возможности</a>
          <a href="/pricing"  className="hover:text-primary">Цены</a>
          <a href="/about"    className="hover:text-primary">О нас</a>
          <a href="/dashboard" className="rounded-lg bg-primary px-3 py-2 text-white hover:bg-primary/90">Открыть</a>
        </nav>
      </div>
    </header>
  );
}
