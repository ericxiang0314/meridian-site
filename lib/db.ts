import { DatabaseSync } from "node:sqlite"
import { join } from "node:path"

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

let db: DatabaseSync | null = null

function database(): DatabaseSync {
  if (!db) db = new DatabaseSync(join(process.cwd(), "data", "meridian.db"), { readOnly: true })
  return db
}

function count(sql: string): number {
  const row = database().prepare(sql).get() as { n: number } | undefined
  return Number(row?.n ?? 0)
}

export function counts(): { airports: number; airlines: number; types: number; fields: number } {
  return {
    airports: count("SELECT COUNT(*) AS n FROM airports"),
    airlines: count("SELECT COUNT(*) AS n FROM airlines"),
    types: count("SELECT COUNT(*) AS n FROM types"),
    fields: count("SELECT COUNT(*) AS n FROM fields"),
  }
}

export function airportByIata(code: string): Airport | null {
  const row = database().prepare("SELECT iata, name, city, tz, lat, lon FROM airports WHERE iata = ?").get(code.toUpperCase())
  return (row as Airport | undefined) ?? null
}

export function airlineByIata(code: string): Airline | null {
  const row = database().prepare("SELECT iata, icao, name FROM airlines WHERE iata = ?").get(code.toUpperCase())
  return (row as Airline | undefined) ?? null
}

export function fieldByIata(code: string): Field | null {
  const row = database().prepare("SELECT iata, name, stand, when_text, note FROM fields WHERE iata = ?").get(code.toUpperCase())
  return (row as Field | undefined) ?? null
}

export function allFields(): Field[] {
  return database().prepare("SELECT iata, name, stand, when_text, note FROM fields ORDER BY name").all() as Field[]
}

export function searchAirports(query: string, limit = 12): Airport[] {
  const q = query.trim()
  if (!q) {
    return database()
      .prepare(
        `SELECT iata, name, city, tz, lat, lon FROM airports
         WHERE iata IN ('HKG','PVG','PEK','PKX','CAN','HND','NRT','ICN','SIN','BKK','LHR','FRA','LAX','DXB','JFK','SFO','CDG','AMS')
         ORDER BY city`,
      )
      .all() as Airport[]
  }
  const like = `%${q.replace(/[%_]/g, "")}%`
  return database()
    .prepare(
      `SELECT iata, name, city, tz, lat, lon FROM airports
       WHERE iata = ? OR city LIKE ? OR name LIKE ?
       ORDER BY CASE WHEN iata = ? THEN 0 ELSE 1 END, city
       LIMIT ?`,
    )
    .all(q.toUpperCase(), like, like, q.toUpperCase(), limit) as Airport[]
}

export function searchAirlines(query: string, limit = 12): Airline[] {
  const q = query.trim()
  if (!q) {
    return database()
      .prepare(
        `SELECT iata, icao, name FROM airlines
         WHERE iata IN ('CX','CA','MU','CZ','NH','JL','KE','SQ','EK','QR','BA','LH','AF','UA','AA','DL')
         ORDER BY name`,
      )
      .all() as Airline[]
  }
  const like = `%${q.replace(/[%_]/g, "")}%`
  return database()
    .prepare(
      `SELECT iata, icao, name FROM airlines
       WHERE iata = ? OR icao = ? OR name LIKE ?
       ORDER BY CASE WHEN iata = ? THEN 0 ELSE 1 END, name
       LIMIT ?`,
    )
    .all(q.toUpperCase(), q.toUpperCase(), like, q.toUpperCase(), limit) as Airline[]
}

export function searchTypes(query: string, limit = 8): Airframe[] {
  const q = query.trim()
  if (q.length < 2) return []
  const like = `%${q.replace(/[%_]/g, "")}%`
  return database()
    .prepare(
      `SELECT code, name FROM types
       WHERE code = ? OR name LIKE ?
       ORDER BY CASE WHEN code = ? THEN 0 ELSE 1 END, code
       LIMIT ?`,
    )
    .all(q.toUpperCase(), like, q.toUpperCase(), limit) as Airframe[]
}

export function hubs(): Airport[] {
  const codes = ["HKG", "PVG", "NRT", "LHR", "LAX", "DXB"]
  const stmt = database().prepare("SELECT iata, name, city, tz, lat, lon FROM airports WHERE iata = ?")
  return codes.map((code) => stmt.get(code) as Airport).filter(Boolean)
}
