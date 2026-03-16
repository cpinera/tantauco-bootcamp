// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getEvents, saveAllEvents, deleteEvent } from "@/lib/store";
import { BootcampEvent } from "@/lib/types";

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function PUT(req: Request) {
  const { email, password } = Object.fromEntries(new URL(req.url).searchParams) as Record<string, string>;
  const body = await req.json();

  // Handle auth check
  if (body.action === "auth") {
    const ok = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
    return NextResponse.json({ ok });
  }

  // Handle save
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const events: BootcampEvent[] = body;
  await saveAllEvents(events);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await deleteEvent(id);
  return NextResponse.json({ ok: true });
}
