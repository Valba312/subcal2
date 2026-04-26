import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { isAdminUser } from "../../../../lib/server/admin";
import { attachSession, authValidators, verifyPassword } from "../../../../lib/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? authValidators.normalizeEmail(body.email) : "";
    const password = typeof body.password === "string" ? body.password : "";

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Неверный email или пароль." }, { status: 401 });
    }

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
    console.error("Login error", error);
    return NextResponse.json({ error: "Не удалось войти." }, { status: 500 });
  }
}
