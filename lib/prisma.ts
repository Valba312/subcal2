import path from "node:path";
import fs from "node:fs";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const projectRoot = path.resolve(process.cwd());
const envFilePath = path.resolve(projectRoot, ".env");

const readDatabaseUrlFromEnvFile = () => {
  try {
    if (!fs.existsSync(envFilePath)) {
      return null;
    }

    const rawEnv = fs.readFileSync(envFilePath, "utf8");
    const line = rawEnv
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith("DATABASE_URL="));

    if (!line) {
      return null;
    }

    const value = line.slice("DATABASE_URL=".length).trim();
    return value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  } catch {
    return null;
  }
};

const resolveSqliteUrl = () => {
  const rawUrl = process.env.DATABASE_URL ?? readDatabaseUrlFromEnvFile();

  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  if (rawUrl === ":memory:") {
    return rawUrl;
  }

  if (rawUrl.startsWith("file:")) {
    const filePath = rawUrl.slice("file:".length);
    return path.isAbsolute(filePath)
      ? filePath
      : path.resolve(path.dirname(envFilePath), filePath);
  }

  return rawUrl;
};

const adapter = new PrismaBetterSqlite3({
  url: resolveSqliteUrl(),
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
