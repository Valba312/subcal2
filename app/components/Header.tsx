"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plus, ShieldCheck, UserPlus } from "lucide-react";

import { useAuth } from "../../components/auth-provider";
import { usePublicConfig } from "../../components/public-config-provider";
import { Button } from "../../components/ui/button";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { cn } from "../../lib/utils";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/analytics", label: "Аналитика" },
  { href: "/agent", label: "AI агент" },
  { href: "/contacts", label: "Контакты" },
];

export default function Header() {
  const pathname = usePathname();
  const { isReady, user, logout } = useAuth();
  const { isFeatureEnabled } = usePublicConfig();
  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.href === "/calculator") {
      return isFeatureEnabled("calculator") || user?.isAdmin;
    }
    if (link.href === "/analytics") {
      return isFeatureEnabled("analytics") || user?.isAdmin;
    }
    if (link.href === "/agent") {
      return isFeatureEnabled("agent") || user?.isAdmin;
    }
    return true;
  });
  const links = user?.isAdmin ? [...visibleLinks, { href: "/admin", label: "Админ" }] : visibleLinks;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex items-center gap-4 py-4">
        <Link href="/" aria-label="SubKeeper - главная" className="flex items-center gap-2 text-lg font-semibold">
          <Logo withText />
        </Link>

        <nav className="flex flex-1 items-center gap-2 overflow-x-auto text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                pathname === link.href
                  ? "bg-primary/15 text-primary"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              {link.href === "/admin" && <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isReady && user ? (
            <>
              <div className="max-w-44 truncate rounded-full border bg-card px-4 py-2 text-sm text-foreground">
                {user.name}
              </div>
              <Button asChild size="lg" className="hidden md:inline-flex">
                <Link href="/calculator#form" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Добавить подписку
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Выйти
              </Button>
            </>
          ) : (
            <Button asChild size="lg" className="hidden md:inline-flex">
              <Link href="/auth?mode=register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Регистрация
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isReady && user ? (
            <>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/calculator#form">Добавить</Link>
              </Button>
              <Button type="button" size="sm" variant="outline" className="text-xs" onClick={logout}>
                Выйти
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/auth?mode=register">Вход</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
