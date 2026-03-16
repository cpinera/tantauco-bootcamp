"use client";
// app/components/RegisterModal.tsx
import { useState } from "react";
import { BootcampEvent } from "@/lib/types";

interface Props {
  event: BootcampEvent;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterModal({ event, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!name.trim() || !email.trim()) { setStatus("error"); setMessage("Por favor completa tu nombre y email."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setStatus("error"); setMessage("Email no válido."); return; }
    setStatus("loading");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id, name: name.trim(), email: email.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage(`¡Listo, ${name.trim()}! Revisa tu email — te enviamos la invitación del evento.`);
      setTimeout(onSuccess, 2200);
    } else {
      setStatus("error");
      setMessage(data.error || "Ocurrió un error. Inténtalo de nuevo.");
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(13,13,13,0.5)",
        zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
      }}
    >
      <div style={{
        background: "var(--white)", borderRadius: 4, padding: "2rem", width: "100%",
        maxWidth: 440, border: "0.5px solid var(--border)", animation: "slideUp 0.25s ease"
      }}>
        <button onClick={onClose} style={{ float: "right", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)", lineHeight: 1, marginTop: -4 }}>×</button>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.4rem", fontWeight: 400, color: "var(--green)", marginBottom: 4 }}>
          {event.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
          {event.date} · {event.time} hrs
        </div>

        <label style={{ display: "block", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6, fontWeight: 400 }}>Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo" style={{ marginBottom: "1rem" }} />

        <label style={{ display: "block", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6, fontWeight: 400 }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={{ marginBottom: "0.5rem" }}
          onKeyDown={e => e.key === "Enter" && submit()} />

        <button
          className="btn-primary"
          onClick={submit}
          disabled={status === "loading" || status === "success"}
          style={{ marginTop: "0.75rem" }}
        >
          {status === "loading" ? "Enviando invitación..." : status === "success" ? "¡Inscripción confirmada!" : "Confirmar inscripción"}
        </button>

        {message && (
          <div style={{
            fontSize: 13, marginTop: "1rem", padding: "10px 12px", borderRadius: 3,
            background: status === "success" ? "var(--green-light)" : "#fdecea",
            color: status === "success" ? "var(--green)" : "#8b2218"
          }}>
            {message}
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
