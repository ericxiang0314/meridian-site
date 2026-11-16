import type { Scene } from "@/components/Stage"
import { airportByIata } from "@/lib/db"
import { haversineNm, initialBearing } from "@/lib/geo"

export function pairScene(fromCode: string, toCode: string): Scene | null {
  const from = airportByIata(fromCode)
  const to = airportByIata(toCode)
  if (!from || !to) return null
  return {
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
  }
}
