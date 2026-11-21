import { airlineByIata } from "@/lib/db"

export type LiveQuery =
  | { ok: true; path: string; label: string; mappedFrom?: string }
  | { ok: false; error: string }

export function resolveLiveQuery(raw: string): LiveQuery {
  const text = raw.trim().toUpperCase().replace(/\s+/g, "")
  if (!text) return { ok: false, error: "Type a flight number, a callsign, or a registration." }
  if (/^[A-Z0-9]{1,2}-[A-Z0-9]{2,5}$/.test(text)) {
    return { ok: true, path: `/v2/reg/${encodeURIComponent(text)}`, label: text }
  }
  if (/^[0-9A-F]{6}$/.test(text)) {
    return { ok: true, path: `/v2/hex/${text}`, label: text }
  }
  const flight = text.match(/^([A-Z0-9]{2})(\d{1,4}[A-Z]?)$/)
  if (flight) {
    const airline = airlineByIata(flight[1])
    if (!airline?.icao) return { ok: false, error: `${flight[1]} is not an airline in the book. Try the callsign itself, such as BAW117.` }
    const callsign = `${airline.icao}${flight[2]}`
    return { ok: true, path: `/v2/callsign/${callsign}`, label: callsign, mappedFrom: text }
  }
  if (/^[A-Z]{3}\d{1,4}[A-Z]?$/.test(text)) {
    return { ok: true, path: `/v2/callsign/${text}`, label: text }
  }
  return { ok: false, error: "Use a flight number such as BA117, a callsign such as BAW117, or a registration such as N12345." }
}
