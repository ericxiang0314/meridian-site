import type { Metadata } from "next"
import Link from "next/link"
import { LetterRail } from "@/components/LetterRail"
import { airportRecord, atlasCounts, bandCounts, letterCounts } from "@/lib/atlas"

export const metadata: Metadata = { title: "Airports" }

export default function AirportsIndex() {
  const counts = letterCounts("airports")
  const bands = bandCounts()
  const world = ["JFK", "LHR", "CDG", "DXB", "SIN", "NRT", "LAX", "SYD", "GRU", "AMS", "JNB", "FRA"].flatMap((code) => {
    const row = airportRecord(code)
    return row ? [row] : []
  })
  const total = atlasCounts().airports
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>Airports</h1>
        <p>{total.toLocaleString("en-US")} places the desk can name, on every continent the book covers.</p>
      </header>
      <LetterRail base="/book/airports/letter" counts={counts} />
      <section className="band-row">
        {(Object.entries(bands) as Array<[string, number]>).map(([band, count]) => (
          <Link key={band} href={`/book/airports/band/${band}`}>
            <strong>{count.toLocaleString("en-US")}</strong>
            <span>{band}</span>
          </Link>
        ))}
      </section>
      <h2>Around the world</h2>
      <ul className="directory">
        {world.map((row) => (
          <li key={row.iata}>
            <Link href={`/book/airports/${row.iata}`}>
              <b>{row.iata}</b>
              <span>{row.city || row.name}</span>
              <small>{row.band} · {row.hemisphere}{row.side}</small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
