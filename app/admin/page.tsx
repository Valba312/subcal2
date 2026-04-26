"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { AuthGuard } from "../../components/auth-guard";
import { usePublicConfig } from "../../components/public-config-provider";
import { Button } from "../../components/ui/button";
import { formatMoney } from "../../lib/subscriptions";

type AdminStats = {
  admin: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  totals: {
    users: number;
    subscriptions: number;
    activeSessions: number;
    monthlyTotals: Record<string, number>;
  };
  features: Array<{
    key: "calculator" | "analytics" | "agent";
    label: string;
    description: string;
    enabled: boolean;
    updatedAt: string;
  }>;
  contacts: Array<{
    id: number;
    title: string;
    value: string;
    href: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  errors: Array<{
    id: number;
    message: string;
    stack: string | null;
    path: string | null;
    userAgent: string | null;
    userId: string | null;
    severity: string;
    createdAt: string;
    resolvedAt: string | null;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    subscriptionsCount: number;
    sessionsCount: number;
    monthlyByCurrency: Record<string, number>;
  }>;
  recentSubscriptions: Array<{
    id: number;
    name: string;
    cost: number;
    currency: string;
    months: number;
    frequencyLabel: string;
    nextPaymentDate: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
};

const defaultContactForm = {
  title: "",
  value: "",
  href: "",
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contactForm, setContactForm] = useState(defaultContactForm);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const { refreshConfig } = usePublicConfig();

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminStats | { error?: string };

      if (!response.ok) {
        const errorMessage = "error" in payload ? payload.error : null;
        throw new Error(response.status === 403 ? "Нет доступа к админ-панели." : errorMessage ?? "Не удалось загрузить статистику.");
      }

      setStats(payload as AdminStats);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить статистику.");
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const monthlyTotal = useMemo(() => formatTotals(stats?.totals.monthlyTotals ?? {}), [stats]);
  const openErrors = stats?.errors.filter((item) => !item.resolvedAt) ?? [];

  const updateFeature = async (key: string, enabled: boolean) => {
    setPendingAction(`feature-${key}`);
    try {
      const response = await fetch("/api/admin/features", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, enabled }),
      });

      if (!response.ok) {
        throw new Error("Не удалось обновить блок.");
      }

      await loadStats();
      await refreshConfig();
    } catch (featureError) {
      setError(featureError instanceof Error ? featureError.message : "Не удалось обновить блок.");
    } finally {
      setPendingAction(null);
    }
  };

  const createContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPendingAction("contact-create");

    try {
      const response = await fetch("/api/admin/contacts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        throw new Error("Не удалось добавить контакт.");
      }

      setContactForm(defaultContactForm);
      await loadStats();
      await refreshConfig();
    } catch (contactError) {
      setError(contactError instanceof Error ? contactError.message : "Не удалось добавить контакт.");
    } finally {
      setPendingAction(null);
    }
  };

  const toggleContact = async (contact: NonNullable<AdminStats["contacts"]>[number]) => {
    setPendingAction(`contact-${contact.id}`);
    try {
      const response = await fetch(`/api/admin/contacts/${contact.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...contact, isActive: !contact.isActive }),
      });

      if (!response.ok) {
        throw new Error("Не удалось обновить контакт.");
      }

      await loadStats();
      await refreshConfig();
    } catch (contactError) {
      setError(contactError instanceof Error ? contactError.message : "Не удалось обновить контакт.");
    } finally {
      setPendingAction(null);
    }
  };

  const deleteContact = async (id: number) => {
    setPendingAction(`contact-${id}`);
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Не удалось удалить контакт.");
      }

      await loadStats();
      await refreshConfig();
    } catch (contactError) {
      setError(contactError instanceof Error ? contactError.message : "Не удалось удалить контакт.");
    } finally {
      setPendingAction(null);
    }
  };

  const resolveError = async (id: number) => {
    setPendingAction(`error-${id}`);
    try {
      const response = await fetch(`/api/admin/errors/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Не удалось обработать ошибку.");
      }

      await loadStats();
    } catch (resolveErrorRequest) {
      setError(resolveErrorRequest instanceof Error ? resolveErrorRequest.message : "Не удалось обработать ошибку.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <AuthGuard>
      <div className="bg-background py-8 sm:py-10">
        <div className="container flex max-w-6xl flex-col gap-6">
          <header className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Admin
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Админ-панель SubKeeper
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  Управление доступностью блоков, контактами и критическими ошибками пользователей.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/analytics">К аналитике</Link>
              </Button>
            </div>
          </header>

          {isLoading && <LoadingState />}
          {!isLoading && error && <AccessDenied message={error} />}
          {!isLoading && stats && (
            <>
              <section className="grid gap-3 md:grid-cols-4">
                <MetricCard title="Пользователи" value={stats.totals.users.toString()} icon={<UsersRound className="h-5 w-5" />} />
                <MetricCard title="Подписки" value={stats.totals.subscriptions.toString()} icon={<WalletCards className="h-5 w-5" />} />
                <MetricCard title="Активные сессии" value={stats.totals.activeSessions.toString()} icon={<Activity className="h-5 w-5" />} />
                <MetricCard title="Критические ошибки" value={openErrors.length.toString()} icon={<AlertTriangle className="h-5 w-5" />} />
              </section>

              <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <Panel title="Закрытие блоков">
                  <div className="mt-4 space-y-3">
                    {stats.features.map((feature) => (
                      <div key={feature.key} className="rounded-2xl border bg-background p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-foreground">{feature.label}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                          <button
                            type="button"
                            disabled={pendingAction === `feature-${feature.key}`}
                            onClick={() => updateFeature(feature.key, !feature.enabled)}
                            className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                              feature.enabled
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                : "border-destructive/30 bg-destructive/10 text-destructive"
                            }`}
                          >
                            {feature.enabled ? "Открыт" : "Закрыт"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Контакты для пользователей">
                  <form onSubmit={createContact} className="mt-4 grid gap-3 rounded-2xl border bg-background p-4">
                    <input
                      value={contactForm.title}
                      onChange={(event) => setContactForm((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Название: Telegram, Email, Поддержка"
                      className="form-input"
                    />
                    <input
                      value={contactForm.value}
                      onChange={(event) => setContactForm((prev) => ({ ...prev, value: event.target.value }))}
                      placeholder="Контакт: @subkeeper или support@mail.com"
                      className="form-input"
                    />
                    <input
                      value={contactForm.href}
                      onChange={(event) => setContactForm((prev) => ({ ...prev, href: event.target.value }))}
                      placeholder="Ссылка: https://t.me/... или mailto:..."
                      className="form-input"
                    />
                    <Button type="submit" disabled={pendingAction === "contact-create"}>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Добавить контакт
                    </Button>
                  </form>

                  <div className="mt-4 space-y-3">
                    {stats.contacts.length === 0 && <EmptyLine text="Контакты пока не добавлены." />}
                    {stats.contacts.map((contact) => (
                      <div key={contact.id} className="rounded-2xl border bg-background px-4 py-3 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{contact.title}</p>
                            <p className="truncate text-muted-foreground">{contact.value}</p>
                            {contact.href && <p className="truncate text-xs text-muted-foreground">{contact.href}</p>}
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => toggleContact(contact)}
                              disabled={pendingAction === `contact-${contact.id}`}
                              className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
                            >
                              {contact.isActive ? "Скрыть" : "Показать"}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteContact(contact.id)}
                              disabled={pendingAction === `contact-${contact.id}`}
                              className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                              aria-label="Удалить контакт"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <Panel title="Критические ошибки пользователей">
                  <div className="mt-4 space-y-3">
                    {stats.errors.length === 0 && <EmptyLine text="Ошибок пока нет." />}
                    {stats.errors.map((item) => (
                      <div key={item.id} className="rounded-2xl border bg-background p-4 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{item.message}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.path ?? "без пути"} · {dateTimeFormatter.format(new Date(item.createdAt))}
                            </p>
                          </div>
                          {item.resolvedAt ? (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Обработана
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => resolveError(item.id)}
                              disabled={pendingAction === `error-${item.id}`}
                              className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
                            >
                              Закрыть
                            </button>
                          )}
                        </div>
                        {item.stack && (
                          <pre className="mt-3 max-h-28 overflow-auto rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                            {item.stack}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Статистика">
                  <div className="mt-4 grid gap-3">
                    <MetricRow label="Расходы в месяц" value={monthlyTotal} />
                    <MetricRow label="Пользователей" value={stats.totals.users.toString()} />
                    <MetricRow label="Подписок" value={stats.totals.subscriptions.toString()} />
                    <MetricRow label="Активных сессий" value={stats.totals.activeSessions.toString()} />
                  </div>
                </Panel>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <Panel title="Пользователи">
                  <div className="mt-4 overflow-hidden rounded-2xl border">
                    <div className="grid grid-cols-[1.2fr_0.8fr_0.6fr] gap-3 bg-muted/50 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                      <span>Аккаунт</span>
                      <span>Расходы в месяц</span>
                      <span className="text-right">Подписки</span>
                    </div>
                    <div className="divide-y">
                      {stats.users.map((user) => (
                        <div key={user.id} className="grid grid-cols-[1.2fr_0.8fr_0.6fr] gap-3 px-4 py-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <p className="text-muted-foreground">{formatTotals(user.monthlyByCurrency)}</p>
                          <p className="text-right font-semibold text-foreground">{user.subscriptionsCount}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title="Ближайшие подписки">
                  <div className="mt-4 space-y-3">
                    {stats.recentSubscriptions.length === 0 && <EmptyLine text="Подписок пока нет." />}
                    {stats.recentSubscriptions.map((subscription) => (
                      <div key={subscription.id} className="rounded-2xl border bg-background px-4 py-3 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{subscription.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{subscription.user.email}</p>
                          </div>
                          <p className="shrink-0 font-semibold text-foreground">
                            {formatMoney(subscription.cost)} {subscription.currency}
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {subscription.frequencyLabel} · {dateFormatter.format(new Date(subscription.nextPaymentDate))}
                        </p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </section>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-card p-5 shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">{icon}</div>
      <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">{title}</p>
      <p className="mt-1 truncate text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border bg-background px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function LoadingState() {
  return <div className="h-72 animate-pulse rounded-3xl bg-muted" />;
}

function AccessDenied({ message }: { message: string }) {
  return (
    <section className="rounded-3xl border border-dashed bg-card p-10 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <LockKeyhole className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-foreground">Доступ закрыт</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{message}</p>
      <p className="mx-auto mt-3 max-w-xl text-xs text-muted-foreground">
        Добавьте email нужного аккаунта в ADMIN_EMAILS в .env и перезапустите dev-сервер.
      </p>
    </section>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed bg-muted/30 px-4 py-5 text-sm text-muted-foreground">{text}</p>;
}

function formatTotals(totals: Record<string, number>) {
  return (
    Object.entries(totals)
      .map(([currency, value]) => `${formatMoney(value)} ${currency}`)
      .join(" • ") || "0"
  );
}
