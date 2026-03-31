// lib/email.ts
import { Resend } from "resend";
import { BootcampEvent, EVENT_DETAILS } from "./types";

const MESES: Record<string, string> = {
  enero: "01", febrero: "02", marzo: "03", abril: "04",
  mayo: "05", junio: "06", julio: "07", agosto: "08",
  septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
};

function parseDateToISO(dateStr: string): string {
  const normalized = dateStr.toLowerCase().trim();
  const match = normalized.match(/(\d{1,2})\s+de\s+([a-záéíóúü]+)(?:\s+(\d{4}))?/);
  if (!match) return "20260401";
  const day = match[1].padStart(2, "0");
  const month = MESES[match[2]] || "04";
  const year = match[3] || "2026";
  return `${year}${month}${day}`;
}

function parseTime(timeStr: string): string {
  return timeStr.trim().replace(":", "") + "00";
}

function buildICS(event: BootcampEvent, attendeeName: string, attendeeEmail: string): string {
  const dateStr = parseDateToISO(event.date);
  const parts = event.time.split(/[–-]/);
  const startTime = parseTime(parts[0]);
  const endTime = parseTime(parts[1] || "19:00");
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `tantauco-${event.id}-${Date.now()}@tantauco.vc`;

  const allEmails = [attendeeEmail, ...EVENT_DETAILS.ccEmails];
  const attendeeLines = allEmails
    .map((e) => `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${e}:MAILTO:${e}`)
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tantauco//AI Bootcamp//ES",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dateStr}T${startTime}`,
    `DTEND:${dateStr}T${endTime}`,
    `SUMMARY:Tantauco AI Bootcamp – ${event.name}`,
    `DESCRIPTION:${event.name} – ${event.date}\\, ${event.time} hrs\\nDirección: ${EVENT_DETAILS.address}`,
    `LOCATION:${EVENT_DETAILS.address}`,
    `ORGANIZER;CN=Tantauco:MAILTO:${EVENT_DETAILS.ccEmails[0]}`,
    attendeeLines,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function sendInviteEmail(
  event: BootcampEvent,
  attendeeName: string,
  attendeeEmail: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const ics = buildICS(event, attendeeName, attendeeEmail);

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f2efe8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#f8f6f1;border-radius:6px;border:1px solid rgba(26,58,42,0.12);">
      <tr><td style="background:#1a3a2a;padding:24px 32px;border-radius:6px 6px 0 0;">
        <span style="color:#e8f0ec;font-size:16px;font-weight:400;letter-spacing:0.02em;">Tantauco</span>
      </td></tr>
      <tr><td style="padding:32px;">
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#4a8c68;margin:0 0 12px;">Invitación confirmada</p>
        <h1 style="font-size:24px;font-weight:400;color:#1a3a2a;margin:0 0 16px;">Tantauco AI Bootcamp</h1>
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 24px;">
          Hola <strong>${attendeeName}</strong>,<br>
          Tu inscripción está confirmada. Te esperamos en:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f0ec;border-radius:4px;margin-bottom:24px;">
          <tr><td style="padding:18px 22px;">
            <p style="margin:0 0 4px;font-size:16px;color:#1a3a2a;font-weight:500;">${event.name} — ${event.date}</p>
            <p style="margin:0 0 10px;font-size:13px;color:#5a7a6a;">${event.time} hrs</p>
            <p style="margin:0;font-size:13px;color:#1a3a2a;">📍 ${EVENT_DETAILS.address}</p>
          </td></tr>
        </table>
        <p style="font-size:13px;color:#777;line-height:1.8;margin:0 0 20px;">
          Adjuntamos una invitación de calendario para que la agregues a tu agenda.<br>
          Cualquier consulta, responde este email.
        </p>
        <p style="font-size:13px;color:#555;margin:0;">
          Nos vemos pronto,<br>
          <strong style="color:#1a3a2a;">Equipo Tantauco</strong>
        </p>
      </td></tr>
      <tr><td style="border-top:1px solid rgba(26,58,42,0.1);padding:14px 32px;">
        <p style="margin:0;font-size:11px;color:#aaa;">© ${new Date().getFullYear()} Tantauco · tantauco.vc</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  await resend.emails.send({
    from: "Tantauco AI Bootcamp <bootcamp@tantauco.vc>",
    to: attendeeEmail,
    cc: EVENT_DETAILS.ccEmails,
    subject: `Invitación: Tantauco AI Bootcamp – ${event.name}, ${event.date}`,
    html,
    attachments: [
      {
        filename: "invite.ics",
        content: Buffer.from(ics).toString("base64"),
      },
    ],
  });
}
