"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type Field = { iata: string; name: string; stand: string; when: string; note: string }

export function FieldFilter({ fields }: { fields: Field[] }) {
  const [query, setQuery] = useState("")
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return fields
    return fields.filter((field) =>
      [field.iata, field.name, field.stand, field.when, field.note].some((value) => value.toLowerCase().includes(q)),
    )
  }, [fields, query])
  return (
    <section className="results fields-list">
      <header>
        <h2>Public places</h2>
        <p>Public places only. If a note does not name a place, do not invent one at the fence.</p>
        <form className="find inline" onSubmit={(event) => event.preventDefault()}>
          <input value={query} placeholder="London, deck, park" aria-label="Filter fields" onChange={(event) => setQuery(event.target.value)} />
        </form>
      </header>
      {shown.length === 0 ? <p>No field matches that.</p> : shown.map((field) => (
        <Link className="hit field-hit" href={`/fields/${field.iata}`} key={field.iata}>
          <b>{field.iata}</b>
          <span>
            {field.name}
            <small>{field.stand} {field.when}</small>
            <em>{field.note}</em>
          </span>
        </Link>
      ))}
    </section>
  )
}
