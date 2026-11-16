"use client"

import Link from "next/link"
import { useState } from "react"

type Hit = { iata: string; city?: string; name: string; icao?: string; code?: string }
type Payload = { airports: Hit[]; airlines: Hit[]; types: Array<{ code: string; name: string }> }

export function BookSearch({ initialQuery, initial }: { initialQuery: string; initial: Payload }) {
  const [query, setQuery] = useState(initialQuery)
  const [rows, setRows] = useState(initial)
  const [pending, setPending] = useState(false)

  async function lookup(value: string) {
    setQuery(value)
    setPending(true)
    const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
    if (response.ok) setRows((await response.json()) as Payload)
    setPending(false)
  }

  return (
    <>
      <section className="find">
        <form
          action="/book"
          method="get"
          onSubmit={(event) => {
            event.preventDefault()
            void lookup(query)
          }}
        >
          <input
            name="q"
            value={query}
            placeholder="HKG, Cathay, A359"
            aria-label="Search the book"
            onChange={(event) => void lookup(event.target.value)}
          />
          <button type="submit">{pending ? "Looking" : "Look up"}</button>
        </form>
      </section>
      <section className="results">
        <div>
          <h2>Airports</h2>
          {rows.airports.length === 0 ? <p>No airport by that name.</p> : rows.airports.map((row) => (
            <Link className="hit" href={`/book/airports/${row.iata}`} key={row.iata}>
              <b>{row.iata}</b>
              <span>{row.city ? `${row.city} / ${row.name}` : row.name}</span>
            </Link>
          ))}
        </div>
        <div>
          <h2>Airlines</h2>
          {rows.airlines.length === 0 ? <p>No airline by that name.</p> : rows.airlines.map((row) => (
            <Link className="hit" href={`/book/airlines/${row.iata}`} key={row.iata}>
              <b>{row.iata}</b>
              <span>{row.name}{row.icao ? ` / ${row.icao}` : ""}</span>
            </Link>
          ))}
        </div>
        {rows.types.length > 0 ? (
          <div>
            <h2>Airframes</h2>
            {rows.types.map((row) => (
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
