import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { BookSearch } from "@/components/BookSearch"
import { Credit } from "@/components/Credit"
import { atlasCounts } from "@/lib/atlas"
import { searchAirlines, searchAirports, searchTypes } from "@/lib/db"
import { publicPath } from "@/lib/public-path"

export const metadata: Metadata = { title: "Book" }

export default function BookPage() {
  const counts = atlasCounts()
  const shelves = [
    { href: "/book/airports", count: counts.airports, label: "Airports", line: "By letter, by latitude, and by hemisphere." },
    { href: "/book/airlines", count: counts.airlines, label: "Airlines", line: "The designator, and the callsign the desk hears." },
    { href: "/book/types", count: counts.types, label: "Airframes", line: "Type codes, grouped by the maker on the nose." },
  ]
  return (
    <>
    <section className="page-intro">
      <img src={publicPath("/atlas/narita-apron.jpg")} alt="United aircraft parked on the Narita apron at night" width={2800} height={1866} />
      <div>
        <h1>Book</h1>
        <p>Airports, airlines, and the airframes that carry them.</p>
        <Credit name="narita" />
      </div>
    </section>
    <div className="sheet sheet-follow">
    <div className="index-row">
      {shelves.map((shelf) => (
        <Link key={shelf.href} href={shelf.href}>
          <strong>{shelf.count.toLocaleString("en-US")}</strong>
          <b>{shelf.label}</b>
          <span>{shelf.line}</span>
        </Link>
      ))}
    </div>
    <Suspense fallback={null}>
    <BookSearch
      initialQuery=""
      initial={{ airports: searchAirports(""), airlines: searchAirlines(""), types: searchTypes("") }}
    />
    </Suspense>
    </div>
    </>
  )
}
