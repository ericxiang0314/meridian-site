import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AirportBrowser } from "@/components/AirportBrowser"
import { LetterRail } from "@/components/LetterRail"
import { airportsForLetter, letterCounts, letters } from "@/lib/atlas"

type Params = { params: Promise<{ letter: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return letters.map((letter) => ({ letter }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const letter = (await params).letter.toUpperCase()
  return { title: `Airports ${letter}` }
}

export default async function AirportLetterPage({ params }: Params) {
  const letter = (await params).letter.toUpperCase()
  if (!letters.includes(letter)) notFound()
  const airports = airportsForLetter(letter)
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>Airports {letter}</h1>
        <p>{airports.length.toLocaleString("en-US")} names. Narrow them by latitude band or hemisphere.</p>
      </header>
      <LetterRail base="/book/airports/letter" counts={letterCounts("airports")} current={letter} />
      <AirportBrowser letter={letter} airports={airports} />
    </div>
  )
}
