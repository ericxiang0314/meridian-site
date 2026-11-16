import type { Metadata } from "next"
import Link from "next/link"
import { BookSearch } from "@/components/BookSearch"
import { searchAirlines, searchAirports, searchTypes } from "@/lib/db"

export const metadata: Metadata = { title: "Book" }

export default async function BookPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim()
  return (
    <div className="sheet">
    <header className="sheet-intro">
      <h1>Book</h1>
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
  )
}
