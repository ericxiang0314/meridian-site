import { airportByIata } from "@/lib/db"
import { craftFromFeed, preferAirborne, type FeedAircraft, type LiveCraft } from "@/lib/live-feed"
import { resolveLiveQuery } from "@/lib/live-query"

export type LiveAnswer = {
  found: boolean
  mode?: "flight" | "near"
  label?: string
  mappedFrom?: string | null
  missed?: string
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

function feedUrls(path: string): string[] {
  const target = `https://api.adsb.lol${path}`
  return [target, `https://proxy.cors.dev/${target}`, `https://r.jina.ai/${target}`]
}

async function pullFeed(path: string): Promise<FeedAircraft[]> {
  const urls = feedUrls(path)
  const waitMs = 14000
  return new Promise((resolve, reject) => {
    let pending = urls.length
    let empty: FeedAircraft[] | null = null
    let finished = false
    const done = (result: FeedAircraft[] | null) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      if (result) resolve(result)
      else reject(new Error("The radar did not answer this browser."))
    }
    const timer = setTimeout(() => done(empty), waitMs)
    for (const url of urls) {
      fetch(url, { cache: "no-store", signal: AbortSignal.timeout(waitMs) })
        .then(async (response) => {
          if (!response.ok) return null
          return extractJson(await response.text())?.ac ?? null
        })
        .catch(() => null)
        .then((aircraft) => {
          if (finished) return
          if (aircraft && aircraft.length > 0) {
            done(aircraft)
            return
          }
          if (aircraft && empty == null) empty = aircraft
          pending -= 1
          if (pending === 0) done(empty)
        })
    }
  })
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

async function nearAnswer(code: string): Promise<LiveAnswer> {
  const airport = airportByIata(code)
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

async function withArea(label: string, airport: string, reason: string): Promise<LiveAnswer | null> {
  try {
    const area = await nearAnswer(airport || "LHR")
    if (!Array.isArray(area.aircraft) || area.aircraft.length === 0) return null
    return {
      ...area,
      found: true,
      missed: label,
      note: `${reason} These aircraft are over ${area.city}. Gates and delays are not in this feed.`,
    }
  } catch {
    return null
  }
}

export async function readLive(next: { mode: "flight" | "near"; query: string; airport: string }): Promise<LiveAnswer> {
  const params = next.mode === "near" ? `airport=${encodeURIComponent(next.airport)}` : `q=${encodeURIComponent(next.query)}`
  const hosted = await readOnThisHost(params)
  if (hosted) return hosted

  if (next.mode === "near") return nearAnswer(next.airport)

  const resolved = resolveLiveQuery(next.query)
  if (!resolved.ok) return { found: false, error: resolved.error }
  try {
    const first = preferAirborne(await pullFeed(resolved.path))[0]
    if (!first) {
      const area = await withArea(
        resolved.label,
        next.airport || "LHR",
        `No position received for ${resolved.label}. It may be on the ground, or no receiver has it.`,
      )
      if (area) return { ...area, label: resolved.label, mappedFrom: resolved.mappedFrom ?? null }
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
  } catch {
    const area = await withArea(resolved.label, next.airport || "LHR", `The feed did not answer for ${resolved.label}.`)
    if (area) return { ...area, label: resolved.label, mappedFrom: resolved.mappedFrom ?? null }
    throw new Error("The radar did not answer this browser.")
  }
}
