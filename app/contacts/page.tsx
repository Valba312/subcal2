"use client";

import { Mail, MessageCircle } from "lucide-react";

import { usePublicConfig } from "../../components/public-config-provider";

export default function ContactsPage() {
  const { isReady, contacts } = usePublicConfig();

  return (
    <div className="bg-background py-8 sm:py-10">
      <div className="container max-w-4xl">
        <section className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Связь
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Контакты поддержки
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Здесь администратор публикует способы связи, по которым пользователи могут обратиться с вопросами.
          </p>
        </section>

        <section className="mt-6 grid gap-3">
          {!isReady && <div className="h-36 animate-pulse rounded-3xl bg-muted" />}
          {isReady && contacts.length === 0 && (
            <div className="rounded-3xl border border-dashed bg-card p-8 text-center shadow-soft">
              <Mail className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-4 text-lg font-semibold text-foreground">Контакты пока не добавлены</p>
              <p className="mt-2 text-sm text-muted-foreground">Администратор сможет добавить их в админ-панели.</p>
            </div>
          )}
          {contacts.map((contact) => (
            <ContactCard key={contact.id} title={contact.title} value={contact.value} href={contact.href} />
          ))}
        </section>
      </div>
    </div>
  );
}

function ContactCard({ title, value, href }: { title: string; value: string; href: string | null }) {
  const content = (
    <div className="flex flex-col gap-2 rounded-3xl border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{value}</p>
      </div>
      {href && <span className="text-sm font-semibold text-primary">Открыть</span>}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {content}
    </a>
  );
}
