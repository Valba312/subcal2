"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Plus, ShieldCheck, UserPlus, X } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container flex items-center gap-2 py-3 md:gap-4 md:py-4">
        <Link href="/" aria-label="SubKeeper - главная" className="flex shrink-0 items-center gap-2 text-lg font-semibold">
          <Logo withText />
        </Link>

        <nav className="hidden flex-1 items-center gap-2 overflow-x-auto text-sm font-medium md:flex">
          {links.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} />
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
              <Button type="button" variant="outline" onClick={handleLogout}>
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

        <div className="ml-auto flex items-center gap-2 md:hidden">
          {isReady && !user && (
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/auth?mode=register">Вход</Link>
            </Button>
          )}
          <ThemeToggle />
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-card text-foreground transition hover:border-primary hover:text-primary"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t bg-background/95 shadow-soft md:hidden">
          <nav className="container grid gap-2 py-3 text-sm font-medium">
            {links.map((link) => (
              <NavLink key={link.href} link={link} pathname={pathname} mobile />
            ))}

            <div className="mt-2 grid gap-2 border-t pt-3">
              {isReady && user ? (
                <>
                  <div className="truncate rounded-2xl border bg-card px-4 py-3 text-sm text-foreground">
                    {user.name}
                  </div>
                  <Link
                    href="/calculator#form"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Добавить подписку
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  href="/auth?mode=register"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Регистрация
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({
  link,
  pathname,
  mobile = false,
}: {
  link: { href: string; label: string };
  pathname: string;
  mobile?: boolean;
}) {
  const isActive = pathname === link.href;

  return (
    <Link
      href={link.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        mobile
          ? "flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 transition"
          : "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm transition md:px-4",
        isActive
          ? mobile
            ? "border-primary/30 bg-primary/15 text-primary"
            : "bg-primary/15 text-primary"
          : mobile
            ? "bg-card text-foreground hover:border-primary hover:text-primary"
            : "text-foreground/80 hover:bg-muted hover:text-foreground"
      )}
    >
      {link.href === "/admin" && <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
      {link.label}
    </Link>
  );
}
