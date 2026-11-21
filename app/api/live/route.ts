import { airportByIata } from "@/lib/db"
import { resolveLiveQuery } from "@/lib/live-query"

export const dynamic = "force-dynamic"

const headers = { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" }

type Aircraft = {
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

function feet(value: number | string | undefined): number | null {
  return typeof value === "number" ? Math.round(value) : null
}

function phase(alt: number | null, rate: number | null): string {
  if (alt == null) return "Altitude was not sent."
  if (rate == null || Math.abs(rate) < 300) return "Level, as far as the climb rate shows. That is a reading, not a schedule."
  if (rate > 0) return `Climbing at about ${Math.round(rate)} ft/min. That is a reading, not a schedule.`
  return `Descending at about ${Math.abs(Math.round(rate))} ft/min. That is a reading, not a schedule.`
}

function row(aircraft: Aircraft) {
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

async function readFeed(path: string): Promise<Aircraft[]> {
  const response = await fetch(`https://api.adsb.lol${path}`, {
    headers: { Accept: "application/json", "User-Agent": "MeridianSite/0.2" },
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`The feed answered ${response.status}.`)
  const body = (await response.json()) as { ac?: Aircraft[] }
  return body.ac ?? []
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const airportCode = (url.searchParams.get("airport") ?? "").trim()
  const query = url.searchParams.get("q") ?? ""
  try {
    if (airportCode) {
      const airport = airportByIata(airportCode)
      if (!airport) return Response.json({ found: false, error: "That airport is not in the book." }, { status: 404, headers })
      const aircraft = await readFeed(`/v2/lat/${airport.lat}/lon/${airport.lon}/dist/40`)
      const located = aircraft.filter((item) => item.lat != null && item.lon != null)
      const airborne = located.filter((item) => typeof item.alt_baro === "number" && item.alt_baro > 0)
      const list = (airborne.length > 0 ? airborne : located).slice(0, 12).map(row)
      return Response.json({
        found: list.length > 0,
        mode: "near",
        airport: airport.iata,
        city: airport.city || airport.name,
        source: "adsb.lol",
        aircraft: list,
        note: "Aircraft a public receiver reported within about 40 nautical miles. None means not received, not that the sky is empty. This is not a schedule.",
      }, { headers })
    }
    const resolved = resolveLiveQuery(query)
    if (!resolved.ok) return Response.json({ found: false, error: resolved.error }, { status: 400, headers })
    const aircraft = await readFeed(resolved.path)
    const first = aircraft.find((item) => item.lat != null && item.lon != null) ?? aircraft[0]
    if (!first) {
      return Response.json({
        found: false,
        label: resolved.label,
        mappedFrom: resolved.mappedFrom ?? null,
        source: "adsb.lol",
        error: `No position received for ${resolved.label}. It may be on the ground, or no receiver has it. This is not a schedule, and it does not mean the flight does not exist.`,
      }, { headers })
    }
    return Response.json({
      found: true,
      mode: "flight",
      label: resolved.label,
      mappedFrom: resolved.mappedFrom ?? null,
      source: "adsb.lol",
      aircraft: row(first),
      note: "A position from the public ADS-B feed. Gates, delays, and scheduled times are not in this feed.",
    }, { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : "The feed did not answer."
    return Response.json({ found: false, error: message }, { status: 502, headers })
  }
}
