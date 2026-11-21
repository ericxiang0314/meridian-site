export type FeedAircraft = {
  flight?: string
  lat?: number
  lon?: number
  alt_baro?: number | string
  gs?: number
  track?: number
  baro_rate?: number
  t?: string
  r?: string
  hex?: string
  seen?: number
}

export type LiveCraft = {
  callsign: string
  registration: string
  type: string
  lat: number | null
  lon: number | null
  altFt: number | null
  onGround: boolean
  gsKt: number | null
  track: number | null
  rateFpm: number | null
  phase: string
  seenSeconds: number | null
}

function feet(value: number | string | undefined): number | null {
  return typeof value === "number" ? Math.round(value) : null
}

function phase(alt: number | null, rate: number | null): string {
  if (alt == null) return "Altitude was not sent."
  if (rate == null || Math.abs(rate) < 300) return "Level, as far as the climb rate shows. That is a reading, not a schedule."
  if (rate > 0) return `Climbing at about ${Math.round(rate)} ft/min. That is a reading, not a schedule.`
  return `Descending at about ${Math.abs(Math.round(rate))} ft/min. That is a reading, not a schedule.`
}

export function craftFromFeed(aircraft: FeedAircraft): LiveCraft {
  const alt = feet(aircraft.alt_baro)
  const rate = typeof aircraft.baro_rate === "number" ? aircraft.baro_rate : null
  return {
    callsign: (aircraft.flight ?? "").trim(),
    registration: aircraft.r ?? "",
    type: aircraft.t ?? "",
    lat: aircraft.lat ?? null,
    lon: aircraft.lon ?? null,
    altFt: alt,
    onGround: aircraft.alt_baro === "ground",
    gsKt: typeof aircraft.gs === "number" ? Math.round(aircraft.gs) : null,
    track: typeof aircraft.track === "number" ? Math.round(aircraft.track) : null,
    rateFpm: rate == null ? null : Math.round(rate),
    phase: phase(alt, rate),
    seenSeconds: typeof aircraft.seen === "number" ? Math.round(aircraft.seen) : null,
  }
}

export function preferAirborne(aircraft: FeedAircraft[]): FeedAircraft[] {
  const located = aircraft.filter((item) => item.lat != null && item.lon != null)
  const airborne = located.filter((item) => typeof item.alt_baro === "number" && item.alt_baro > 0)
  return (airborne.length > 0 ? airborne : located).slice(0, 12)
}
