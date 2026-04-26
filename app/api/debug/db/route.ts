import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({
      databaseUrl: process.env.DATABASE_URL ?? null,
      cwd: process.cwd(),
      users: users.map((user) => ({
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      })),
      count: users.length,
    });
  } catch (error) {
    console.error("DB debug error", error);
    return NextResponse.json(
      {
        error: "DB debug failed",
        databaseUrl: process.env.DATABASE_URL ?? null,
        cwd: process.cwd(),
      },
      { status: 500 }
    );
  }
}
