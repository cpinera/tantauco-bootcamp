"use client";
// app/page.tsx
import { useEffect, useState } from "react";
import { BootcampEvent } from "@/lib/types";
import RegisterModal from "./components/RegisterModal";
import AdminPanel from "./components/AdminPanel";

const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="4" fill="#1a3a2a" />
    <path d="M8 24L16 8L24 24" stroke="#e8f0ec" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.5 19H21.5" stroke="#e8f0ec" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Home() {
  const [events, setEvents] = useState<BootcampEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<BootcampEvent | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  return (
    <>
      {/* NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.5rem 2.5rem", borderBottom: "0.5px solid var(--border)",
        background: "var(--white)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo />
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 15, color: "var(--green)", letterSpacing: "0.02em" }}>Tantauco</span>
        </div>
        <button onClick={() => setShowAdmin(!showAdmin)} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--muted)",
          background: "none", border: "0.5px solid var(--border)", borderRadius: 2,
          padding: "6px 14px", cursor: "pointer"
        }}>
          {showAdmin ? "← Volver" : "Panel Admin"}
        </button>
      </nav>

      {showAdmin ? (
        <AdminPanel events={events} onUpdate={(updated) => { setEvents(updated); }} />
      ) : (
        <>
          {/* HERO */}
          <div style={{ textAlign: "center", padding: "5rem 2rem 3rem", maxWidth: 680, margin: "0 auto" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--green-accent)", marginBottom: "1.5rem", fontWeight: 400 }}>
              Programa de formación
            </p>
            <h1 style={{ fontWeight: 300, fontSize: "clamp(2.4rem, 6vw, 3.6rem)", lineHeight: 1.1, color: "var(--green)", marginBottom: "1rem", fontStyle: "italic" }}>
              Tantauco <span style={{ fontStyle: "normal", color: "var(--black)" }}>AI</span>
              <br />Bootcamp
            </h1>
            <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, marginBottom: "3rem" }}>
              Sesiones presenciales de introducción a inteligencia artificial.<br />
              Grupos reducidos de hasta 4 personas.
            </p>
          </div>

          {/* SESSIONS */}
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 2rem 6rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1.5rem", fontWeight: 400 }}>
              Elige tu sesión
            </p>
            {loading ? (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Cargando sesiones...</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
                {events.map((ev) => {
                  const filled = ev.attendees.length;
                  const pct = Math.round((filled / ev.max) * 100);
                  const full = filled >= ev.max;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => !full && setSelectedEvent(ev)}
                      style={{
                        background: "var(--white)", border: "0.5px solid var(--border)", borderRadius: 4,
                        padding: "1.5rem", cursor: full ? "not-allowed" : "pointer",
                        opacity: full ? 0.55 : 1, transition: "all 0.2s",
                        borderLeft: full ? undefined : "3px solid transparent",
                      }}
                      onMouseEnter={e => { if (!full) (e.currentTarget as HTMLDivElement).style.borderLeft = "3px solid var(--green-accent)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderLeft = "0.5px solid var(--border)"; }}
                    >
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.25rem", fontWeight: 400, color: "var(--green)", marginBottom: 4 }}>
                        {ev.date}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1rem" }}>{ev.time} hrs</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "var(--green-accent)", borderRadius: 2, transition: "width 0.4s" }} />
                        </div>
                        <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{filled}/{ev.max} inscritos</span>
                      </div>
                      {full && <span style={{ fontSize: 11, background: "#f0ebe0", color: "var(--muted)", padding: "3px 8px", borderRadius: 2, marginTop: 8, display: "inline-block" }}>Completo</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {selectedEvent && (
        <RegisterModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={() => { setSelectedEvent(null); fetchEvents(); }}
        />
      )}
    </>
  );
}
