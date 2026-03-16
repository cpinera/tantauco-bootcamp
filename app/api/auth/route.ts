// app/api/auth/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const ok =
    email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase() &&
    password === process.env.ADMIN_PASSWORD;
  return NextResponse.json({ ok });
}
