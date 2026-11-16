"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { searchAirlines, searchAirports, searchTypes } from "@/lib/db"

type Hit = { iata: string; city?: string; name: string; icao?: string; code?: string }
type Payload = { airports: Hit[]; airlines: Hit[]; types: Array<{ code: string; name: string }> }

function lookup(value: string): Payload {
  return {
    airports: searchAirports(value),
    airlines: searchAirlines(value),
    types: searchTypes(value),
  }
}

export function BookSearch({ initialQuery, initial }: { initialQuery: string; initial: Payload }) {
  const params = useSearchParams()
  const starting = params.get("q") ?? initialQuery
  const [query, setQuery] = useState(starting)
  const [rows, setRows] = useState<Payload>(() => (starting ? lookup(starting) : initial))

  const shown = useMemo(() => rows, [rows])

  function run(value: string) {
    setQuery(value)
    setRows(lookup(value))
  }

  return (
    <>
      <section className="find">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            run(query)
          }}
        >
          <input
            name="q"
            value={query}
            placeholder="HKG, Cathay, A359"
            aria-label="Search the book"
            onChange={(event) => run(event.target.value)}
          />
          <button type="submit">Look up</button>
        </form>
      </section>
      <section className="results">
        <div>
          <h2>Airports</h2>
          {shown.airports.length === 0 ? <p>No airport by that name.</p> : shown.airports.map((row) => (
            <Link className="hit" href={`/book/airports/${row.iata}`} key={row.iata}>
              <b>{row.iata}</b>
              <span>{row.city ? `${row.city} / ${row.name}` : row.name}</span>
            </Link>
          ))}
        </div>
        <div>
          <h2>Airlines</h2>
          {shown.airlines.length === 0 ? <p>No airline by that name.</p> : shown.airlines.map((row) => (
            <Link className="hit" href={`/book/airlines/${row.iata}`} key={row.iata}>
              <b>{row.iata}</b>
              <span>{row.name}{row.icao ? ` / ${row.icao}` : ""}</span>
            </Link>
          ))}
        </div>
        {shown.types.length > 0 ? (
          <div>
            <h2>Airframes</h2>
            {shown.types.map((row) => (
              <Link className="hit" href={`/book/types/${row.code}`} key={row.code}>
                <b>{row.code}</b>
                <span>{row.name}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}
