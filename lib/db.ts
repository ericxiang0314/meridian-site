import { haversineNm } from "@/lib/geo"
import airportsJson from "@/data/source/airports.json"
import airlinesJson from "@/data/source/airlines.json"
import typesJson from "@/data/source/aircraft-types.json"
import fieldsJson from "@/data/source/fields.json"

export type Airport = {
  iata: string
  name: string
  city: string
  tz: string
  lat: number
  lon: number
}

export type Airline = { iata: string; icao: string; name: string }
export type Airframe = { code: string; name: string }
export type Field = { iata: string; name: string; stand: string; when_text: string; note: string }

const airports = airportsJson as Airport[]
const airportMap = new Map(airports.map((row) => [row.iata, row]))

const airlines: Airline[] = Object.entries(airlinesJson as Record<string, { icao?: string; name: string }>).map(
  ([iata, row]) => ({ iata, icao: row.icao ?? "", name: row.name }),
)
const airlineMap = new Map(airlines.map((row) => [row.iata, row]))

const types: Airframe[] = Object.entries(typesJson as Record<string, string>).map(([code, name]) => ({ code, name }))

const fields: Field[] = (fieldsJson as Array<{ iata: string; name: string; stand: string; when: string; note: string }>)
  .map((row) => ({ iata: row.iata, name: row.name, stand: row.stand, when_text: row.when, note: row.note }))
  .sort((a, b) => a.name.localeCompare(b.name))
const fieldMap = new Map(fields.map((row) => [row.iata, row]))

const featuredAirports = ["JFK", "LHR", "CDG", "FRA", "AMS", "DXB", "DOH", "SIN", "NRT", "ICN", "SYD", "LAX", "SFO", "GRU", "JNB", "MAD"]
const featuredAirlines = ["CX", "CA", "MU", "CZ", "NH", "JL", "KE", "SQ", "EK", "QR", "BA", "LH", "AF", "UA", "AA", "DL"]

function includes(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase())
}

export function counts(): { airports: number; airlines: number; types: number; fields: number } {
  return { airports: airports.length, airlines: airlines.length, types: types.length, fields: fields.length }
}

export function airportByIata(code: string): Airport | null {
  return airportMap.get(code.trim().toUpperCase()) ?? null
}

export function nearestAirport(lat: number, lon: number): Airport | null {
  let best: Airport | null = null
  let bestNm = Infinity
  for (const row of airports) {
    const nm = haversineNm({ lat, lon }, row)
    if (nm < bestNm) {
      bestNm = nm
      best = row
    }
  }
  return best
}

export function airlineByIata(code: string): Airline | null {
  return airlineMap.get(code.trim().toUpperCase()) ?? null
}

export function fieldByIata(code: string): Field | null {
  return fieldMap.get(code.trim().toUpperCase()) ?? null
}

export function allFields(): Field[] {
  return fields
}

export function airlineCodes(): string[] {
  return airlines.map((row) => row.iata)
}

export function typeCodes(): string[] {
  return types.map((row) => row.code)
}

export function searchAirports(query: string, limit = 12): Airport[] {
  const q = query.trim()
  if (!q) {
    return featuredAirports.map((code) => airportMap.get(code)).filter((row): row is Airport => row != null)
  }
  const exact = q.toUpperCase()
  return airports
    .filter((row) => row.iata === exact || includes(row.city, q) || includes(row.name, q))
    .sort((a, b) => Number(b.iata === exact) - Number(a.iata === exact) || a.city.localeCompare(b.city))
    .slice(0, limit)
}

export function searchAirlines(query: string, limit = 12): Airline[] {
  const q = query.trim()
  if (!q) {
    return featuredAirlines
      .map((code) => airlineMap.get(code))
      .filter((row): row is Airline => row != null)
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  const exact = q.toUpperCase()
  return airlines
    .filter((row) => row.iata === exact || row.icao === exact || includes(row.name, q))
    .sort((a, b) => Number(b.iata === exact) - Number(a.iata === exact) || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export function searchTypes(query: string, limit = 8): Airframe[] {
  const q = query.trim()
  if (q.length < 2) return []
  const exact = q.toUpperCase()
  return types
    .filter((row) => row.code === exact || includes(row.name, q))
    .sort((a, b) => Number(b.code === exact) - Number(a.code === exact) || a.code.localeCompare(b.code))
    .slice(0, limit)
}

export function hubs(): Airport[] {
  return ["JFK", "LHR", "CDG", "DXB", "NRT", "SYD"]
    .map((code) => airportMap.get(code))
    .filter((row): row is Airport => row != null)
}
