"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Wrench } from "lucide-react";

import { useAuth } from "./auth-provider";
import { type PublicFeature, usePublicConfig } from "./public-config-provider";

export function FeatureGate({ feature, children }: { feature: PublicFeature["key"]; children: ReactNode }) {
  const { user } = useAuth();
  const { isReady, isFeatureEnabled, contacts } = usePublicConfig();

  if (!isReady || isFeatureEnabled(feature) || user?.isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="container flex min-h-[calc(100dvh-80px)] items-center py-10">
      <section className="mx-auto w-full max-w-2xl rounded-3xl border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Wrench className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-foreground">Раздел временно закрыт</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Администратор закрыл этот блок для разработки. Если нужно срочно связаться с командой, используйте контакты ниже.
        </p>

        {contacts.length > 0 && (
          <div className="mt-6 grid gap-3 text-left">
            {contacts.map((contact) => (
              <ContactLink key={contact.id} contact={contact} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link className="text-sm font-semibold text-primary hover:underline" href="/contacts">
            Все контакты
          </Link>
        </div>
      </section>
    </div>
  );
}

function ContactLink({ contact }: { contact: { title: string; value: string; href: string | null } }) {
  const content = (
    <span className="flex items-center justify-between gap-4 rounded-2xl border bg-background px-4 py-3 text-sm">
      <span className="font-semibold text-foreground">{contact.title}</span>
      <span className="text-muted-foreground">{contact.value}</span>
    </span>
  );

  if (!contact.href) {
    return content;
  }

  return (
    <a href={contact.href} target="_blank" rel="noreferrer">
      {content}
    </a>
  );
}
