import type { Metadata } from "next"
import Link from "next/link"
import { LetterRail } from "@/components/LetterRail"
import { atlasCounts, letterCounts } from "@/lib/atlas"
import { searchAirlines } from "@/lib/db"

export const metadata: Metadata = { title: "Airlines" }

export default function AirlinesIndex() {
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>Airlines</h1>
        <p>{atlasCounts().airlines.toLocaleString("en-US")} designators. The letter is the first letter of the airline name. The callsign beside it is what the desk hears.</p>
      </header>
      <LetterRail base="/book/airlines/letter" counts={letterCounts("airlines")} />
      <ul className="directory">
        {searchAirlines("").map((row) => (
          <li key={row.iata}>
            <Link href={`/book/airlines/${row.iata}`}>
              <b>{row.iata}</b>
              <span>{row.name}</span>
              <small>{row.icao || "no callsign"}</small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
