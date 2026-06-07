import fs from "node:fs";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import * as Prisma from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: any;
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

const resolveDatabaseUrl = () => {
  const rawUrl = process.env.DATABASE_URL ?? readDatabaseUrlFromEnvFile();

  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return rawUrl;
};

const PrismaClientClass = (Prisma as any).PrismaClient || (Prisma as any).default?.PrismaClient || (Prisma as any).default;

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: resolveDatabaseUrl(),
  });

  return new PrismaClientClass({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma ??= null;
}

const getPrismaClient = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
};

export const prisma = new Proxy({} as any, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
  set(_target, property, value) {
    const client = getPrismaClient();
    return Reflect.set(client, property, value);
  },
  has(_target, property) {
    return property in getPrismaClient();
  },
  ownKeys() {
    return Reflect.ownKeys(getPrismaClient());
  },
  getOwnPropertyDescriptor(_target, property) {
    return Object.getOwnPropertyDescriptor(getPrismaClient(), property);
  },
});
