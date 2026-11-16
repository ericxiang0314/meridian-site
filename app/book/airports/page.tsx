import type { Metadata } from "next"
import Link from "next/link"
import { LetterRail } from "@/components/LetterRail"
import { atlasCounts, bandCounts, letterCounts, nearestToHongKong } from "@/lib/atlas"

export const metadata: Metadata = { title: "Airports" }

export default function AirportsIndex() {
  const counts = letterCounts("airports")
  const bands = bandCounts()
  const near = nearestToHongKong(12)
  const total = atlasCounts().airports
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>Airports</h1>
        <p>{total.toLocaleString("en-US")} places the desk can name. Distance is nautical miles from Hong Kong.</p>
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
      <h2>Nearest Hong Kong</h2>
      <ul className="directory">
        {near.map((row) => (
          <li key={row.iata}>
            <Link href={`/book/airports/${row.iata}`}>
              <b>{row.iata}</b>
              <span>{row.city || row.name}</span>
              <small>{row.fromHkgNm.toLocaleString("en-US")} nm · {row.band}</small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
