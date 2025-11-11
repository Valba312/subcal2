"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "../../components/ui/button";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { cn } from "../../lib/utils";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/analytics", label: "Аналитика" },
  { href: "/agent", label: "AI агент" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-white/5 dark:bg-slate-950/60">
      <div className="container flex items-center gap-6 py-4">
        <Link href="/" aria-label="SubKeeper — главная" className="flex items-center gap-2 text-lg font-semibold">
          <Logo withText />
        </Link>
        <nav className="flex flex-1 items-center gap-2 overflow-x-auto text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition",
                pathname === link.href
                  ? "bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary dark:text-white"
                  : "text-slate-800 hover:text-primary dark:text-slate-200 dark:hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button asChild variant="default" size="lg" className="hidden md:inline-flex">
            <Link href="/calculator#form" className="flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Добавить подписку
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/calculator#form">Добавить</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
