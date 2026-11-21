import { airportByIata } from "./db"
import { haversineNm, initialBearing } from "./geo"
import type { Scene } from "@/components/Stage"

const pairs = [
  ["JFK", "LHR"],
  ["LAX", "NRT"],
  ["CDG", "JFK"],
  ["DXB", "LHR"],
  ["SYD", "SIN"],
  ["GRU", "LIS"],
  ["AMS", "JFK"],
  ["SFO", "NRT"],
] as const

export function routeScenes(): Scene[] {
  return pairs.flatMap(([fromCode, toCode]) => {
    const from = airportByIata(fromCode)
    const to = airportByIata(toCode)
    if (!from || !to) return []
    return [{
      from: from.iata,
      to: to.iata,
      fromCity: from.city || from.name,
      toCity: to.city || to.name,
      fromLat: from.lat,
      fromLon: from.lon,
      toLat: to.lat,
      toLon: to.lon,
      nm: haversineNm(from, to),
      bearing: initialBearing(from, to),
    }]
  })
}
