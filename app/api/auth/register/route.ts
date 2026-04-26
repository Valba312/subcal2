import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { isAdminUser } from "../../../../lib/server/admin";
import { attachSession, authValidators, hashPassword } from "../../../../lib/server/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? authValidators.normalizeEmail(body.email) : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (name.length < 2) {
      return NextResponse.json({ error: "Имя должно содержать минимум 2 символа." }, { status: 400 });
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Введите корректный email." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Пароль должен содержать минимум 6 символов." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
      },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        isAdmin: isAdminUser(user),
      },
    });

    await attachSession(response, user.id);

    return response;
  } catch (error) {
    console.error("Register error", error);
    if (error instanceof Error && /unique|constraint|email/i.test(error.message)) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует." }, { status: 409 });
    }

    return NextResponse.json({ error: "Не удалось создать аккаунт." }, { status: 500 });
  }
}
