import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    databaseUrl: process.env.DATABASE_URL ?? null,
    cwd: process.cwd(),
    status: "debug endpoint disabled for database access",
  });
}
