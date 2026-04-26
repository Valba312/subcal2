"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole, UserPlus } from "lucide-react";

import { useAuth } from "./auth-provider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isReady, user } = useAuth();

  if (!isReady) {
    return (
      <div className="container py-10">
        <div className="h-72 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="bg-gradient-to-b from-[#f7f4ff] via-white to-white py-16 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="container max-w-3xl">
        <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <LockKeyhole className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">Создайте аккаунт, чтобы сохранить подписки</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Регистрация открывает личный кабинет с отдельными данными, аналитикой и AI-агентом. После входа ваши подписки будут храниться отдельно от других пользователей на этом устройстве.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth?mode=register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              Зарегистрироваться
            </Link>
            <Link
              href="/auth?mode=login"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
