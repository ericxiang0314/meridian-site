"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type Field = { iata: string; name: string; stand: string }

export function FieldFilter({ fields }: { fields: Field[] }) {
  const [query, setQuery] = useState("")
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return fields
    return fields.filter((field) =>
      [field.iata, field.name, field.stand].some((value) => value.toLowerCase().includes(q)),
    )
  }, [fields, query])
  return (
    <section className="results">
      <h2>The fourteen</h2>
      <p>Public places only. If a note does not name a place, do not invent one at the fence.</p>
      <form className="find inline" onSubmit={(event) => event.preventDefault()}>
        <input value={query} placeholder="Hong Kong, deck, hill" aria-label="Filter fields" onChange={(event) => setQuery(event.target.value)} />
      </form>
      {shown.length === 0 ? <p>No field matches that.</p> : shown.map((field) => (
        <Link className="hit" href={`/fields/${field.iata}`} key={field.iata}>
          <b>{field.iata}</b>
          <span>{field.name} / {field.stand}</span>
        </Link>
      ))}
    </section>
  )
}
