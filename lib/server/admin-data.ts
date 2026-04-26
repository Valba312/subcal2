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

type FeatureFlagRow = Omit<FeatureFlag, "enabled"> & { enabled: number };
type PublicContactRow = Omit<PublicContact, "isActive"> & { isActive: number };

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
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS FeatureFlag (
      key TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS AppContact (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      value TEXT NOT NULL,
      href TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ClientError (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      stack TEXT,
      path TEXT,
      userAgent TEXT,
      userId TEXT,
      severity TEXT NOT NULL DEFAULT 'critical',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolvedAt DATETIME
    )
  `);

  for (const feature of defaultFeatures) {
    await prisma.$executeRawUnsafe(
      `
        INSERT OR IGNORE INTO FeatureFlag (key, label, description, enabled)
        VALUES (?, ?, ?, 1)
      `,
      feature.key,
      feature.label,
      feature.description
    );
  }
}

export async function getFeatureFlags() {
  await ensureAdminTables();
  const rows = await prisma.$queryRawUnsafe<FeatureFlagRow[]>(
    "SELECT key, label, description, enabled, updatedAt FROM FeatureFlag ORDER BY key"
  );

  return rows.map((row) => ({
    ...row,
    enabled: Boolean(row.enabled),
  }));
}

export async function updateFeatureFlag(key: string, enabled: boolean) {
  await ensureAdminTables();
  await prisma.$executeRawUnsafe(
    "UPDATE FeatureFlag SET enabled = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = ?",
    enabled ? 1 : 0,
    key
  );
  return getFeatureFlags();
}

export async function getActiveContacts() {
  await ensureAdminTables();
  const rows = await prisma.$queryRawUnsafe<PublicContactRow[]>(
    "SELECT id, title, value, href, isActive, createdAt FROM AppContact WHERE isActive = 1 ORDER BY createdAt DESC"
  );

  return rows.map((row) => ({
    ...row,
    isActive: Boolean(row.isActive),
  }));
}

export async function getAllContacts() {
  await ensureAdminTables();
  const rows = await prisma.$queryRawUnsafe<PublicContactRow[]>(
    "SELECT id, title, value, href, isActive, createdAt FROM AppContact ORDER BY createdAt DESC"
  );

  return rows.map((row) => ({
    ...row,
    isActive: Boolean(row.isActive),
  }));
}

export async function createContact(input: { title: string; value: string; href?: string | null }) {
  await ensureAdminTables();
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO AppContact (title, value, href, isActive)
      VALUES (?, ?, ?, 1)
    `,
    input.title,
    input.value,
    input.href ?? null
  );
  return getAllContacts();
}

export async function updateContact(id: number, input: { title: string; value: string; href?: string | null; isActive: boolean }) {
  await ensureAdminTables();
  await prisma.$executeRawUnsafe(
    `
      UPDATE AppContact
      SET title = ?, value = ?, href = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    input.title,
    input.value,
    input.href ?? null,
    input.isActive ? 1 : 0,
    id
  );
  return getAllContacts();
}

export async function deleteContact(id: number) {
  await ensureAdminTables();
  await prisma.$executeRawUnsafe("DELETE FROM AppContact WHERE id = ?", id);
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
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ClientError (message, stack, path, userAgent, userId, severity)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    input.message,
    input.stack ?? null,
    input.path ?? null,
    input.userAgent ?? null,
    input.userId ?? null,
    input.severity ?? "critical"
  );
}

export async function getClientErrors(limit = 30) {
  await ensureAdminTables();
  return prisma.$queryRawUnsafe<ClientErrorRecord[]>(
    "SELECT id, message, stack, path, userAgent, userId, severity, createdAt, resolvedAt FROM ClientError ORDER BY createdAt DESC LIMIT ?",
    limit
  );
}

export async function resolveClientError(id: number) {
  await ensureAdminTables();
  await prisma.$executeRawUnsafe("UPDATE ClientError SET resolvedAt = CURRENT_TIMESTAMP WHERE id = ?", id);
  return getClientErrors();
}
