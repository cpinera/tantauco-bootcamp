// lib/types.ts
export interface Attendee {
  name: string;
  email: string;
  registeredAt: string;
}

export interface BootcampEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  max: number;
  attendees: Attendee[];
}

export const DEFAULT_EVENTS: BootcampEvent[] = [
  { id: "1", name: "Sesión 1", date: "Martes 31 de marzo 2026", time: "18:00 – 19:00", max: 4, attendees: [] },
  { id: "2", name: "Sesión 2", date: "Jueves 2 de abril 2026", time: "18:00 – 19:00", max: 4, attendees: [] },
  { id: "3", name: "Sesión 3", date: "Martes 7 de abril 2026", time: "18:00 – 19:00", max: 4, attendees: [] },
  { id: "4", name: "Sesión 4", date: "Jueves 9 de abril 2026", time: "18:00 – 19:00", max: 4, attendees: [] },
];

export const EVENT_DETAILS = {
  title: "Tantauco AI Bootcamp",
  address: "Av. Santa María 5870, Oficina 46, Vitacura",
  ccEmails: ["Cristobal@tantauco.vc"],
};
