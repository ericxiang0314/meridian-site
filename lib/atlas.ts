import { atlasAirlines, type AtlasAirline } from "@/data/generated/airlines"
import { atlasAirports, type AtlasAirport } from "@/data/generated/airports"
import { atlasTypes, type AtlasType } from "@/data/generated/types"

export type { AtlasAirport, AtlasAirline, AtlasType }
export { atlasAirports, atlasAirlines, atlasTypes }

const airportMap = new Map(atlasAirports.map((row) => [row.iata, row]))
const airlineMap = new Map(atlasAirlines.map((row) => [row.iata, row]))
const typeMap = new Map(atlasTypes.map((row) => [row.code, row]))

export const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0".split("")
export const bands = ["equatorial", "subtropical", "temperate", "polar"] as const
export type Band = (typeof bands)[number]

export function atlasCounts() {
  return {
    airports: atlasAirports.length,
    airlines: atlasAirlines.length,
    types: atlasTypes.length,
  }
}

export function airportRecord(code: string): AtlasAirport | null {
  return airportMap.get(code.trim().toUpperCase()) ?? null
}

export function airlineRecord(code: string): AtlasAirline | null {
  return airlineMap.get(code.trim().toUpperCase()) ?? null
}

export function typeRecord(code: string): AtlasType | null {
  return typeMap.get(code.trim().toUpperCase()) ?? null
}

export function airportsForLetter(letter: string): AtlasAirport[] {
  const key = letter.trim().toUpperCase()
  return atlasAirports.filter((row) => row.letter === key).sort((a, b) => a.city.localeCompare(b.city) || a.iata.localeCompare(b.iata))
}

export function airlinesForLetter(letter: string): AtlasAirline[] {
  const key = letter.trim().toUpperCase()
  return atlasAirlines.filter((row) => row.letter === key).sort((a, b) => a.name.localeCompare(b.name))
}

export function letterCounts(kind: "airports" | "airlines"): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const letter of letters) counts[letter] = 0
  const rows = kind === "airports" ? atlasAirports : atlasAirlines
  for (const row of rows) counts[row.letter] = (counts[row.letter] ?? 0) + 1
  return counts
}

export function bandCounts(): Record<Band, number> {
  const counts = { equatorial: 0, subtropical: 0, temperate: 0, polar: 0 }
  for (const row of atlasAirports) counts[row.band] += 1
  return counts
}

export function airportsInBand(band: Band): AtlasAirport[] {
  return atlasAirports.filter((row) => row.band === band).sort((a, b) => a.fromHkgNm - b.fromHkgNm)
}

export function nearestToHongKong(limit: number): AtlasAirport[] {
  return atlasAirports
    .filter((row) => row.iata !== "HKG")
    .slice()
    .sort((a, b) => a.fromHkgNm - b.fromHkgNm)
    .slice(0, limit)
}

export function nearbyAirports(code: string, limit = 8): AtlasAirport[] {
  const origin = airportRecord(code)
  if (!origin) return []
  return atlasAirports
    .filter((row) => row.iata !== origin.iata)
    .map((row) => ({ row, nm: distanceNm(origin, row) }))
    .sort((a, b) => a.nm - b.nm)
    .slice(0, limit)
    .map((item) => item.row)
}

export function distanceNm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 3440.065
  const p1 = (a.lat * Math.PI) / 180
  const p2 = (b.lat * Math.PI) / 180
  const dp = ((b.lat - a.lat) * Math.PI) / 180
  const dl = ((b.lon - a.lon) * Math.PI) / 180
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))))
}

export function makers(): string[] {
  return [...new Set(atlasTypes.map((row) => row.maker))].sort((a, b) => a.localeCompare(b))
}

export function typesForMaker(maker: string): AtlasType[] {
  return atlasTypes.filter((row) => row.maker === maker).sort((a, b) => a.code.localeCompare(b.code))
}

export function makerCounts(): Array<{ maker: string; count: number }> {
  const map = new Map<string, number>()
  for (const row of atlasTypes) map.set(row.maker, (map.get(row.maker) ?? 0) + 1)
  return [...map.entries()].map(([maker, count]) => ({ maker, count })).sort((a, b) => b.count - a.count || a.maker.localeCompare(b.maker))
}
