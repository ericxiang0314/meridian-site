import { DatabaseSync } from "node:sqlite"
import { mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = join(root, "data", "source")
const dbPath = join(root, "data", "meridian.db")
mkdirSync(dirname(dbPath), { recursive: true })

const airports = JSON.parse(readFileSync(join(source, "airports.json"), "utf8"))
const airlines = JSON.parse(readFileSync(join(source, "airlines.json"), "utf8"))
const types = JSON.parse(readFileSync(join(source, "aircraft-types.json"), "utf8"))
const fields = JSON.parse(readFileSync(join(source, "fields.json"), "utf8"))

const db = new DatabaseSync(dbPath)
db.exec(`
  DROP TABLE IF EXISTS airports;
  DROP TABLE IF EXISTS airlines;
  DROP TABLE IF EXISTS types;
  DROP TABLE IF EXISTS fields;
  CREATE TABLE airports (
    iata TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    tz TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL
  );
  CREATE TABLE airlines (
    iata TEXT PRIMARY KEY,
    icao TEXT NOT NULL,
    name TEXT NOT NULL
  );
  CREATE TABLE types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );
  CREATE TABLE fields (
    iata TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stand TEXT NOT NULL,
    when_text TEXT NOT NULL,
    note TEXT NOT NULL
  );
  CREATE INDEX airports_city ON airports(city);
  CREATE INDEX airlines_name ON airlines(name);
`)

const airport = db.prepare("INSERT INTO airports (iata, name, city, tz, lat, lon) VALUES (?, ?, ?, ?, ?, ?)")
const airline = db.prepare("INSERT INTO airlines (iata, icao, name) VALUES (?, ?, ?)")
const type = db.prepare("INSERT INTO types (code, name) VALUES (?, ?)")
const field = db.prepare("INSERT INTO fields (iata, name, stand, when_text, note) VALUES (?, ?, ?, ?, ?)")

db.exec("BEGIN")
for (const row of airports) {
  if (!row?.iata || !row?.name) continue
  airport.run(row.iata, row.name, row.city || "", row.tz || "UTC", row.lat, row.lon)
}
for (const [iata, row] of Object.entries(airlines)) {
  airline.run(iata, row.icao || "", row.name)
}
for (const [code, name] of Object.entries(types)) {
  type.run(code, name)
}
for (const row of fields) {
  field.run(row.iata, row.name, row.stand, row.when, row.note)
}
db.exec("COMMIT")
const counts = {
  airports: db.prepare("SELECT COUNT(*) AS n FROM airports").get().n,
  airlines: db.prepare("SELECT COUNT(*) AS n FROM airlines").get().n,
  types: db.prepare("SELECT COUNT(*) AS n FROM types").get().n,
  fields: db.prepare("SELECT COUNT(*) AS n FROM fields").get().n,
}
db.close()
console.log(counts)
