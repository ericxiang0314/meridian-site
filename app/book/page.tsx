import type { Metadata } from "next"
import Link from "next/link"
import { BookSearch } from "@/components/BookSearch"
import { searchAirlines, searchAirports, searchTypes } from "@/lib/db"

export const metadata: Metadata = { title: "Book" }

export default async function BookPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim()
  return (
    <>
    <section className="page-intro">
      <img src="/atlas/narita-apron.jpg" alt="United aircraft parked on the Narita apron at night" width={2800} height={1866} />
      <div>
        <h1>Book</h1>
        <p>Airports, airlines, and the airframes that carry them.</p>
      </div>
    </section>
    <div className="sheet">
    <header className="sheet-intro">
      <p>
        <Link href="/book/airports">Airports</Link>
        {" · "}
        <Link href="/book/airlines">Airlines</Link>
        {" · "}
        <Link href="/book/types">Airframes</Link>
      </p>
    </header>
    <BookSearch
      initialQuery={q}
      initial={{ airports: searchAirports(q), airlines: searchAirlines(q), types: searchTypes(q) }}
    />
    </div>
    </>
  )
}
