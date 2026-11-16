import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LetterRail } from "@/components/LetterRail"
import { airlinesForLetter, letterCounts, letters } from "@/lib/atlas"

type Params = { params: Promise<{ letter: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: `Airlines ${(await params).letter.toUpperCase()}` }
}

export default async function AirlineLetterPage({ params }: Params) {
  const letter = (await params).letter.toUpperCase()
  if (!letters.includes(letter)) notFound()
  const rows = airlinesForLetter(letter)
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>Airlines {letter}</h1>
        <p>{rows.length.toLocaleString("en-US")} names.</p>
      </header>
      <LetterRail base="/book/airlines/letter" counts={letterCounts("airlines")} current={letter} />
      <ul className="directory">
        {rows.map((row) => (
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
