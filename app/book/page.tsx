import type { Metadata } from "next"
import Link from "next/link"
import { searchAirlines, searchAirports, searchTypes } from "@/lib/db"

export const metadata: Metadata = { title: "Book" }

export default async function BookPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim()
  const airports = searchAirports(q)
  const airlines = searchAirlines(q)
  const types = searchTypes(q)
  return (
    <>
      <section className="find">
        <form action="/book" method="get">
          <input name="q" defaultValue={q} placeholder="HKG, Cathay, A359" aria-label="Search the book" />
          <button type="submit">Look up</button>
        </form>
      </section>
      <section className="results">
        <div>
          <h2>Airports</h2>
          {airports.length === 0 ? <p>No airport by that name.</p> : airports.map((row) => (
            <Link className="hit" href={`/book/airports/${row.iata}`} key={row.iata}>
              <b>{row.iata}</b>
              <span>{row.city ? `${row.city} / ${row.name}` : row.name}</span>
            </Link>
          ))}
        </div>
        <div>
          <h2>Airlines</h2>
          {airlines.length === 0 ? <p>No airline by that name.</p> : airlines.map((row) => (
            <Link className="hit" href={`/book/airlines/${row.iata}`} key={row.iata}>
              <b>{row.iata}</b>
              <span>{row.name}{row.icao ? ` / ${row.icao}` : ""}</span>
            </Link>
          ))}
        </div>
        {types.length > 0 ? (
          <div>
            <h2>Airframes</h2>
            {types.map((row) => (
              <p className="hit" key={row.code}>
                <b>{row.code}</b>
                <span>{row.name}</span>
              </p>
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}
