// lib/store.ts
import { createClient } from "@supabase/supabase-js";
import { BootcampEvent, DEFAULT_EVENTS } from "./types";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
}

export async function getEvents(): Promise<BootcampEvent[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("id");
    if (error || !data) return DEFAULT_EVENTS;
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      date: row.date,
      time: row.time,
      max: row.max_attendees,
      attendees: row.attendees || [],
    }));
  } catch {
    return DEFAULT_EVENTS;
  }
}

export async function saveEvent(event: BootcampEvent): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("events").upsert({
    id: event.id,
    name: event.name,
    date: event.date,
    time: event.time,
    max_attendees: event.max,
    attendees: event.attendees,
  });
}

export async function saveAllEvents(events: BootcampEvent[]): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("events").upsert(
    events.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date,
      time: e.time,
      max_attendees: e.max,
      attendees: e.attendees,
    }))
  );
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("events").delete().eq("id", id);
}
