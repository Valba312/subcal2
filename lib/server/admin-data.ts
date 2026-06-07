import { prisma } from "../prisma";

export type FeatureKey = "calculator" | "analytics" | "agent";

export type FeatureFlag = {
  key: FeatureKey;
  label: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
};

export type PublicContact = {
  id: number;
  title: string;
  value: string;
  href: string | null;
  isActive: boolean;
  createdAt: string;
};

export type ClientErrorRecord = {
  id: number;
  message: string;
  stack: string | null;
  path: string | null;
  userAgent: string | null;
  userId: string | null;
  severity: string;
  createdAt: string;
  resolvedAt: string | null;
};

const defaultFeatures: Array<Omit<FeatureFlag, "enabled" | "updatedAt">> = [
  {
    key: "calculator",
    label: "Калькулятор",
    description: "Форма добавления подписок и личный список сервисов.",
  },
  {
    key: "analytics",
    label: "Аналитика",
    description: "Графики, календарь оплат и сводки по расходам.",
  },
  {
    key: "agent",
    label: "AI агент",
    description: "Чат и оптимизация подписок через AI.",
  },
];

let setupPromise: Promise<void> | null = null;

export const ensureAdminTables = () => {
  setupPromise ??= setupAdminTables();
  return setupPromise;
};

async function setupAdminTables() {
  await Promise.all(
    defaultFeatures.map((feature) =>
      prisma.featureFlag.upsert({
        where: { key: feature.key },
        update: {},
        create: { ...feature, enabled: true },
      })
    )
  );
}

const toIso = (value: Date | null | undefined) => (value ? value.toISOString() : null);

export async function getFeatureFlags() {
  await ensureAdminTables();
  const rows = await prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  return rows.map((row) => ({
    key: row.key as FeatureKey,
    label: row.label,
    description: row.description,
    enabled: row.enabled,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function updateFeatureFlag(key: string, enabled: boolean) {
  await ensureAdminTables();
  await prisma.featureFlag.update({
    where: { key },
    data: { enabled },
  });
  return getFeatureFlags();
}

export async function getActiveContacts() {
  await ensureAdminTables();
  const rows = await prisma.appContact.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    value: row.value,
    href: row.href,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getAllContacts() {
  await ensureAdminTables();
  const rows = await prisma.appContact.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    value: row.value,
    href: row.href,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createContact(input: { title: string; value: string; href?: string | null }) {
  await ensureAdminTables();
  await prisma.appContact.create({
    data: {
      title: input.title,
      value: input.value,
      href: input.href ?? null,
      isActive: true,
    },
  });
  return getAllContacts();
}

export async function updateContact(
  id: number,
  input: { title: string; value: string; href?: string | null; isActive: boolean }
) {
  await ensureAdminTables();
  await prisma.appContact.update({
    where: { id },
    data: {
      title: input.title,
      value: input.value,
      href: input.href ?? null,
      isActive: input.isActive,
    },
  });
  return getAllContacts();
}

export async function deleteContact(id: number) {
  await ensureAdminTables();
  await prisma.appContact.delete({ where: { id } });
  return getAllContacts();
}

export async function recordClientError(input: {
  message: string;
  stack?: string | null;
  path?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  severity?: string;
}) {
  await ensureAdminTables();
  await prisma.clientError.create({
    data: {
      message: input.message,
      stack: input.stack ?? null,
      path: input.path ?? null,
      userAgent: input.userAgent ?? null,
      userId: input.userId ?? null,
      severity: input.severity ?? "critical",
    },
  });
}

export async function getClientErrors(limit = 30) {
  await ensureAdminTables();
  const rows = await prisma.clientError.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    message: row.message,
    stack: row.stack,
    path: row.path,
    userAgent: row.userAgent,
    userId: row.userId,
    severity: row.severity,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: toIso(row.resolvedAt),
  }));
}

export async function resolveClientError(id: number) {
  await ensureAdminTables();
  await prisma.clientError.update({
    where: { id },
    data: { resolvedAt: new Date() },
  });
  return getClientErrors();
}
