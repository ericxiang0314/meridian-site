import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = join(root, "data", "source")
const out = join(root, "data", "generated")
mkdirSync(out, { recursive: true })

const airports = JSON.parse(readFileSync(join(source, "airports.json"), "utf8"))
const airlines = JSON.parse(readFileSync(join(source, "airlines.json"), "utf8"))
const types = JSON.parse(readFileSync(join(source, "aircraft-types.json"), "utf8"))

const hkg = airports.find((row) => row.iata === "HKG") ?? { lat: 22.308, lon: 113.918 }

function nm(a, b) {
  const R = 3440.065
  const p1 = (a.lat * Math.PI) / 180
  const p2 = (b.lat * Math.PI) / 180
  const dp = ((b.lat - a.lat) * Math.PI) / 180
  const dl = ((b.lon - a.lon) * Math.PI) / 180
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))))
}

function band(lat) {
  const span = Math.abs(lat)
  if (span < 15) return "equatorial"
  if (span < 35) return "subtropical"
  if (span < 55) return "temperate"
  return "polar"
}

function letterOf(value) {
  const letter = (value || "").trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(letter) ? letter : "0"
}

function makerOf(name) {
  const known = ["Airbus", "Boeing", "Embraer", "Bombardier", "Cessna", "Gulfstream", "Lockheed", "McDonnell", "De Havilland", "British Aerospace", "Antonov", "Tupolev", "Ilyushin", "Fokker", "ATR", "Pilatus", "Dassault", "Saab", "Shorts", "Learjet", "Hawker"]
  for (const maker of known) {
    if (name.startsWith(maker)) return maker
  }
  return name.split(/[/(]/)[0].trim().split(" ").slice(0, 2).join(" ") || "Other"
}

const airportLines = airports
  .filter((row) => row?.iata && row?.name)
  .map((row) => {
    const record = {
      iata: row.iata,
      name: row.name,
      city: row.city || "",
      tz: row.tz || "UTC",
      lat: row.lat,
      lon: row.lon,
      band: band(row.lat),
      hemisphere: row.lat >= 0 ? "N" : "S",
      side: row.lon >= 0 ? "E" : "W",
      letter: letterOf(row.city || row.name),
      fromHkgNm: nm(hkg, row),
    }
    return `  ${JSON.stringify(record)}`
  })

const airlineLines = Object.entries(airlines).map(([iata, row]) => {
  const record = {
    iata,
    icao: row.icao || "",
    name: row.name,
    letter: letterOf(row.name),
  }
  return `  ${JSON.stringify(record)}`
})

const typeLines = Object.entries(types).map(([code, name]) => {
  const record = { code, name, maker: makerOf(name), letter: letterOf(code) }
  return `  ${JSON.stringify(record)}`
})

writeFileSync(
  join(out, "airports.ts"),
  `export type AtlasAirport = {
  iata: string
  name: string
  city: string
  tz: string
  lat: number
  lon: number
  band: "equatorial" | "subtropical" | "temperate" | "polar"
  hemisphere: "N" | "S"
  side: "E" | "W"
  letter: string
  fromHkgNm: number
}

export const atlasAirports: AtlasAirport[] = [
${airportLines.join(",\n")}
]
`,
)

writeFileSync(
  join(out, "airlines.ts"),
  `export type AtlasAirline = {
  iata: string
  icao: string
  name: string
  letter: string
}

export const atlasAirlines: AtlasAirline[] = [
${airlineLines.join(",\n")}
]
`,
)

writeFileSync(
  join(out, "types.ts"),
  `export type AtlasType = {
  code: string
  name: string
  maker: string
  letter: string
}

export const atlasTypes: AtlasType[] = [
${typeLines.join(",\n")}
]
`,
)

console.log({ airports: airportLines.length, airlines: airlineLines.length, types: typeLines.length })
