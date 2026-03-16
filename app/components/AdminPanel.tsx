"use client";
// app/components/AdminPanel.tsx
import { useState } from "react";
import { BootcampEvent } from "@/lib/types";

interface Props {
  events: BootcampEvent[];
  onUpdate: (events: BootcampEvent[]) => void;
}

const ADMIN_SECRET = "tantauco2025";

export default function AdminPanel({ events, onUpdate }: Props) {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [editingEvent, setEditingEvent] = useState<BootcampEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAuth = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.ok) {
      setAuthenticated(true);
    } else {
      setAuthError("Credenciales incorrectas.");
    }
  };

  if (!authenticated) {
    return (
      <div style={{ maxWidth: 380, margin: "6rem auto", padding: "0 2rem" }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "1.6rem", color: "var(--green)", marginBottom: "1.5rem" }}>Acceso admin</h2>
        <label style={S.label}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={{ marginBottom: "1rem" }} />
        <label style={S.label}>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAuth()} placeholder="••••••••" style={{ marginBottom: "0.75rem" }} />
        {authError && <p style={{ color: "#8b2218", fontSize: 13, marginBottom: 8 }}>{authError}</p>}
        <button className="btn-primary" onClick={handleAuth}>Entrar</button>
      </div>
    );
  }

  const saveToServer = async (updated: BootcampEvent[]) => {
    setSaving(true);
    await fetch("/api/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_SECRET },
      body: JSON.stringify(updated),
    });
    onUpdate(updated);
    setSaving(false);
  };

  const deleteFromServer = async (id: string) => {
    await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_SECRET },
      body: JSON.stringify({ id }),
    });
    onUpdate(events.filter(e => e.id !== id));
  };

  const toggle = (id: string) => setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const deleteEvent = async (id: string) => {
    if (!confirm("¿Eliminar este evento y sus inscripciones?")) return;
    await deleteFromServer(id);
  };

  const removeAttendee = async (evId: string, idx: number) => {
    const updated = events.map(e => e.id !== evId ? e : { ...e, attendees: e.attendees.filter((_, i) => i !== idx) });
    await saveToServer(updated);
  };

  const openEdit = (ev: BootcampEvent) => { setEditingEvent({ ...ev }); setIsNew(false); };
  const openAdd = () => {
    setEditingEvent({ id: Date.now().toString(), name: "", date: "", time: "", max: 4, attendees: [] });
    setIsNew(true);
  };

  const saveEdit = async () => {
    if (!editingEvent) return;
    if (!editingEvent.name || !editingEvent.date || !editingEvent.time) { alert("Completa todos los campos."); return; }
    const updated = isNew ? [...events, editingEvent] : events.map(e => e.id === editingEvent.id ? editingEvent : e);
    await saveToServer(updated);
    setEditingEvent(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 2rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "2rem", borderBottom: "0.5px solid var(--border)", paddingBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.6rem", fontWeight: 400, color: "var(--green)" }}>
          Administración {saving && <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>Guardando...</span>}
        </h2>
        <button onClick={openAdd} style={{ ...S.iconBtn, padding: "6px 16px" }}>+ Nuevo evento</button>
      </div>

      {events.map(ev => {
        const isOpen = openIds.includes(ev.id);
        return (
          <div key={ev.id} style={{ background: "var(--white)", border: "0.5px solid var(--border)", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
            <div onClick={() => toggle(ev.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--green)" }}>{ev.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{ev.date} · {ev.time} · {ev.attendees.length}/{ev.max} inscritos</div>
              </div>
              <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                <button style={S.iconBtn} onClick={() => openEdit(ev)}>Editar</button>
                <button style={{ ...S.iconBtn, color: "#8b2218" }} onClick={() => deleteEvent(ev.id)}>Eliminar</button>
              </div>
            </div>
            {isOpen && (
              <div style={{ borderTop: "0.5px solid var(--border)", padding: "0.75rem 1.25rem 1rem" }}>
                {ev.attendees.length === 0
                  ? <p style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>Sin inscripciones aún.</p>
                  : ev.attendees.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < ev.attendees.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 400 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{a.email}</div>
                      </div>
                      <button style={{ ...S.iconBtn, color: "#8b2218" }} onClick={() => removeAttendee(ev.id, i)}>Eliminar</button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}

      <button onClick={openAdd} style={{ width: "100%", background: "none", border: "0.5px dashed var(--border)", borderRadius: 4, padding: "1rem 1.25rem", textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--muted)", cursor: "pointer", marginTop: 4 }}>
        + Agregar nueva sesión
      </button>

      {editingEvent && (
        <div onClick={e => e.target === e.currentTarget && setEditingEvent(null)} style={{ position: "fixed", inset: 0, background: "rgba(13,13,13,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "var(--white)", borderRadius: 4, padding: "2rem", width: "100%", maxWidth: 480, border: "0.5px solid var(--border)" }}>
            <button onClick={() => setEditingEvent(null)} style={{ float: "right", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>×</button>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.2rem", fontWeight: 400, color: "var(--green)", marginBottom: "1.25rem" }}>{isNew ? "Nuevo evento" : "Editar evento"}</h3>
            <label style={S.label}>Nombre</label>
            <input type="text" value={editingEvent.name} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} placeholder="Ej: Sesión 1" style={{ marginBottom: "1rem" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
              <div>
                <label style={S.label}>Fecha</label>
                <input type="text" value={editingEvent.date} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} placeholder="Martes 31 de marzo" />
              </div>
              <div>
                <label style={S.label}>Horario</label>
                <input type="text" value={editingEvent.time} onChange={e => setEditingEvent({ ...editingEvent, time: e.target.value })} placeholder="18:00 – 19:00" />
              </div>
            </div>
            <label style={S.label}>Máximo asistentes</label>
            <input type="number" value={editingEvent.max} onChange={e => setEditingEvent({ ...editingEvent, max: parseInt(e.target.value) || 4 })} min={1} max={20} style={{ marginBottom: "1rem" }} />
            <button className="btn-primary" onClick={saveEdit}>Guardar cambios</button>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  label: { display: "block" as const, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6, fontWeight: 400 },
  iconBtn: { background: "none", border: "0.5px solid var(--border)", borderRadius: 3, padding: "5px 10px", fontSize: 12, color: "var(--muted)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
};
