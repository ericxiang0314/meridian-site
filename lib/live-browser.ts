import { airportByIata } from "@/lib/db"
import { craftFromFeed, preferAirborne, type FeedAircraft, type LiveCraft } from "@/lib/live-feed"
import { resolveLiveQuery } from "@/lib/live-query"

export type LiveAnswer = {
  found: boolean
  mode?: "flight" | "near"
  label?: string
  mappedFrom?: string | null
  airport?: string
  city?: string
  source?: string
  aircraft?: LiveCraft | LiveCraft[]
  note?: string
  error?: string
}

const nearNote = "Aircraft a public receiver reported within about 40 nautical miles. None means not received, not that the sky is empty. This is not a schedule."
const flightNote = "A position from the public ADS-B feed. Gates, delays, and scheduled times are not in this feed."

function extractJson(text: string): { ac?: FeedAircraft[] } | null {
  const start = text.indexOf("{")
  if (start < 0) return null
  const slice = text.slice(start)
  try {
    return JSON.parse(slice) as { ac?: FeedAircraft[] }
  } catch {
    const end = text.lastIndexOf("}")
    if (end <= start) return null
    try {
      return JSON.parse(text.slice(start, end + 1)) as { ac?: FeedAircraft[] }
    } catch {
      return null
    }
  }
}

async function pullFeed(path: string): Promise<FeedAircraft[]> {
  const target = `https://api.adsb.lol${path}`
  const urls = [`https://proxy.cors.dev/${target}`, `https://r.jina.ai/${target}`]
  let last = "The radar did not answer this browser."
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(18000) })
      const parsed = extractJson(await response.text())
      if (parsed?.ac) return parsed.ac
      last = "The feed answered without an aircraft list."
    } catch (error) {
      const message = error instanceof Error ? error.message : last
      last = message.includes("fetch") || message.includes("abort") ? "The radar did not answer this browser." : message
    }
  }
  throw new Error(last)
}

async function readOnThisHost(query: string): Promise<LiveAnswer | null> {
  const origins = ["", process.env.NEXT_PUBLIC_LIVE_ORIGIN ?? ""].filter((origin, index, all) => all.indexOf(origin) === index)
  for (const origin of origins) {
    try {
      const response = await fetch(`${origin}/api/live?${query}`, { cache: "no-store" })
      const type = response.headers.get("content-type") ?? ""
      if (!type.includes("json")) continue
      return (await response.json()) as LiveAnswer
    } catch {
      continue
    }
  }
  return null
}

export async function readLive(next: { mode: "flight" | "near"; query: string; airport: string }): Promise<LiveAnswer> {
  const params = next.mode === "near" ? `airport=${encodeURIComponent(next.airport)}` : `q=${encodeURIComponent(next.query)}`
  const hosted = await readOnThisHost(params)
  if (hosted) return hosted

  if (next.mode === "near") {
    const airport = airportByIata(next.airport)
    if (!airport) return { found: false, error: "That airport is not in the book." }
    const list = preferAirborne(await pullFeed(`/v2/lat/${airport.lat}/lon/${airport.lon}/dist/40`)).map(craftFromFeed)
    return {
      found: list.length > 0,
      mode: "near",
      airport: airport.iata,
      city: airport.city || airport.name,
      source: "adsb.lol",
      aircraft: list,
      note: nearNote,
    }
  }

  const resolved = resolveLiveQuery(next.query)
  if (!resolved.ok) return { found: false, error: resolved.error }
  const first = preferAirborne(await pullFeed(resolved.path))[0]
  if (!first) {
    return {
      found: false,
      label: resolved.label,
      mappedFrom: resolved.mappedFrom ?? null,
      source: "adsb.lol",
      error: `No position received for ${resolved.label}. It may be on the ground, or no receiver has it. This is not a schedule, and it does not mean the flight does not exist.`,
    }
  }
  return {
    found: true,
    mode: "flight",
    label: resolved.label,
    mappedFrom: resolved.mappedFrom ?? null,
    source: "adsb.lol",
    aircraft: craftFromFeed(first),
    note: flightNote,
  }
}
