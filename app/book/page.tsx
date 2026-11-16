import type { Metadata } from "next"
import { BookSearch } from "@/components/BookSearch"
import { searchAirlines, searchAirports, searchTypes } from "@/lib/db"

export const metadata: Metadata = { title: "Book" }

export default async function BookPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim()
  return (
    <BookSearch
      initialQuery={q}
      initial={{ airports: searchAirports(q), airlines: searchAirlines(q), types: searchTypes(q) }}
    />
  )
}
