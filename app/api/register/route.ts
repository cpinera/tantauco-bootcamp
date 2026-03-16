// app/api/register/route.ts
import { NextResponse } from "next/server";
import { getEvents, saveEvent } from "@/lib/store";
import { sendInviteEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { eventId, name, email } = await req.json();

  if (!eventId || !name || !email) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  const events = await getEvents();
  const event = events.find((e) => e.id === eventId);

  if (!event) return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  if (event.attendees.length >= event.max) return NextResponse.json({ error: "Esta sesión ya está completa." }, { status: 409 });
  if (event.attendees.find((a) => a.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: "Este email ya está inscrito en esta sesión." }, { status: 409 });
  }

  event.attendees.push({ name, email, registeredAt: new Date().toISOString() });
  await saveEvent(event);

  try {
    await sendInviteEmail(event, name, email);
  } catch (err) {
    console.error("Email error:", err);
  }

  return NextResponse.json({ ok: true });
}
