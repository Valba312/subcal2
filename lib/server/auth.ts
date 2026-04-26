import { cookies } from "next/headers";
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "../prisma";

const SESSION_COOKIE_NAME = "subkeeper_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const derived = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString("hex");
  return `${salt}:${derived}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) {
    return false;
  }

  const derived = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString("hex");
  return timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(originalHash, "hex"));
};

const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

const sessionCookieOptions = (expiresAt: Date) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  expires: expiresAt,
});

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
};

export const attachSession = async (response: NextResponse, userId: string) => {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt));
};

export const removeCurrentSession = async () => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      tokenHash: hashSessionToken(token),
    },
  });
};

export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    createdAt: session.user.createdAt.toISOString(),
  };
};

export const requireUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return user;
};

export const authValidators = {
  normalizeEmail,
};
