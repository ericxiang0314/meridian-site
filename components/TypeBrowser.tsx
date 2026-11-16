"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type Row = { code: string; name: string; maker: string }

export function TypeBrowser({ makers, types }: { makers: string[]; types: Row[] }) {
  const [maker, setMaker] = useState("all")
  const [query, setQuery] = useState("")
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return types.filter((row) => (maker === "all" ? true : row.maker === maker)).filter((row) => (q ? `${row.code} ${row.name}`.toLowerCase().includes(q) : true))
  }, [types, maker, query])
  return (
    <div className="browser">
      <div className="filters" role="group" aria-label="Maker">
        <button type="button" aria-pressed={maker === "all"} onClick={() => setMaker("all")}>All</button>
        {makers.map((item) => (
          <button key={item} type="button" aria-pressed={maker === item} onClick={() => setMaker(item)}>
            {item}
          </button>
        ))}
      </div>
      <form className="find inline" onSubmit={(event) => event.preventDefault()}>
        <input value={query} placeholder="B738, A320, Caravan" aria-label="Filter airframes" onChange={(event) => setQuery(event.target.value)} />
      </form>
      <p className="tally">{shown.length.toLocaleString("en-US")} {shown.length === 1 ? "airframe" : "airframes"}</p>
      <ul className="directory">
        {shown.map((row) => (
          <li key={row.code}>
            <Link href={`/book/types/${row.code}`}>
              <b>{row.code}</b>
              <span>{row.name}</span>
              <small>{row.maker}</small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
