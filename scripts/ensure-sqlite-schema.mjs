import fs from "node:fs";
import path from "node:path";
import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";

import Database from "better-sqlite3";

const envFilePath = path.resolve(process.cwd(), ".env");

function readDatabaseUrlFromEnvFile() {
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
}

function resolveSqlitePath() {
  const rawUrl = process.env.DATABASE_URL ?? readDatabaseUrlFromEnvFile();

  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  if (rawUrl === ":memory:") {
    return rawUrl;
  }

  if (!rawUrl.startsWith("file:")) {
    throw new Error("Only SQLite file: DATABASE_URL values are supported by this startup script");
  }

  const filePath = rawUrl.slice("file:".length);
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(path.dirname(envFilePath), filePath);
}

const databasePath = resolveSqlitePath();

if (databasePath !== ":memory:") {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Session (
    id TEXT PRIMARY KEY NOT NULL,
    tokenHash TEXT NOT NULL UNIQUE,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userId TEXT NOT NULL,
    CONSTRAINT Session_userId_fkey FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE INDEX IF NOT EXISTS Session_userId_idx ON Session(userId);

  CREATE TABLE IF NOT EXISTS Subscription (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    cost REAL NOT NULL,
    currency TEXT NOT NULL,
    months INTEGER NOT NULL,
    frequencyLabel TEXT NOT NULL,
    nextPaymentDate DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL,
    userId TEXT NOT NULL,
    CONSTRAINT Subscription_userId_fkey FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE INDEX IF NOT EXISTS Subscription_userId_idx ON Subscription(userId);

  CREATE TABLE IF NOT EXISTS FeatureFlag (
    key TEXT PRIMARY KEY NOT NULL,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS AppContact (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    href TEXT,
    isActive BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ClientError (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    path TEXT,
    userAgent TEXT,
    userId TEXT,
    severity TEXT NOT NULL DEFAULT 'critical',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolvedAt DATETIME
  );
`);

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

if (adminEmail && adminPassword) {
  if (adminPassword.length < 6) {
    throw new Error("ADMIN_PASSWORD must contain at least 6 characters");
  }

  const existingAdmin = db.prepare("SELECT id FROM User WHERE email = ?").get(adminEmail);

  if (!existingAdmin) {
    const salt = randomBytes(16).toString("hex");
    const hash = pbkdf2Sync(adminPassword, salt, 100000, 64, "sha512").toString("hex");
    const now = new Date().toISOString();

    db.prepare(
      `
        INSERT INTO User (id, name, email, passwordHash, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    ).run(randomUUID(), "Admin", adminEmail, `${salt}:${hash}`, now, now);

    console.log(`Admin account is ready for ${adminEmail}`);
  }
}

db.close();
console.log(`SQLite schema is ready at ${databasePath}`);
