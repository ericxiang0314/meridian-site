import { DatabaseSync } from "node:sqlite"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const db = new DatabaseSync(join(dirname(fileURLToPath(import.meta.url)), "..", "data", "meridian.db"))
const hkg = db.prepare("SELECT iata, city FROM airports WHERE iata = ?").get("HKG")
const cx = db.prepare("SELECT iata, name FROM airlines WHERE iata = ?").get("CX")
const field = db.prepare("SELECT iata FROM fields WHERE iata = ?").get("LAX")
if (hkg?.city !== "Hong Kong") throw new Error("HKG missing")
if (!String(cx?.name).includes("Cathay")) throw new Error("CX missing")
if (!field) throw new Error("LAX field missing")
console.log("book ok", hkg.iata, cx.name, field.iata)
