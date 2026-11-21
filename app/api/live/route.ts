import { airportByIata } from "@/lib/db"
import { craftFromFeed, preferAirborne, type FeedAircraft } from "@/lib/live-feed"
import { resolveLiveQuery } from "@/lib/live-query"

export const dynamic = "force-dynamic"

const headers = { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" }

const nearNote = "Aircraft a public receiver reported within about 40 nautical miles. None means not received, not that the sky is empty. This is not a schedule."
const flightNote = "A position from the public ADS-B feed. Gates, delays, and scheduled times are not in this feed."

async function readFeed(path: string): Promise<FeedAircraft[]> {
  const response = await fetch(`https://api.adsb.lol${path}`, {
    headers: { Accept: "application/json", "User-Agent": "MeridianSite/0.2" },
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`The feed answered ${response.status}.`)
  const body = (await response.json()) as { ac?: FeedAircraft[] }
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
      const list = preferAirborne(await readFeed(`/v2/lat/${airport.lat}/lon/${airport.lon}/dist/40`)).map(craftFromFeed)
      return Response.json({
        found: list.length > 0,
        mode: "near",
        airport: airport.iata,
        city: airport.city || airport.name,
        source: "adsb.lol",
        aircraft: list,
        note: nearNote,
      }, { headers })
    }
    const resolved = resolveLiveQuery(query)
    if (!resolved.ok) return Response.json({ found: false, error: resolved.error }, { status: 400, headers })
    const first = preferAirborne(await readFeed(resolved.path))[0]
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
      aircraft: craftFromFeed(first),
      note: flightNote,
    }, { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : "The feed did not answer."
    return Response.json({ found: false, error: message }, { status: 502, headers })
  }
}
