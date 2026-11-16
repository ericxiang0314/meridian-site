import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const source = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "source")
const airports = JSON.parse(readFileSync(join(source, "airports.json"), "utf8"))
const airlines = JSON.parse(readFileSync(join(source, "airlines.json"), "utf8"))
const fields = JSON.parse(readFileSync(join(source, "fields.json"), "utf8"))
const hkg = airports.find((row) => row.iata === "HKG")
if (hkg?.city !== "Hong Kong") throw new Error("HKG missing")
if (!String(airlines.CX?.name).includes("Cathay")) throw new Error("CX missing")
if (!fields.some((row) => row.iata === "LAX")) throw new Error("LAX field missing")
console.log("book ok", hkg.iata, airlines.CX.name, "LAX", airports.length, Object.keys(airlines).length)
