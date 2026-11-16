"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

export type BrowserAirport = {
  iata: string
  name: string
  city: string
  tz: string
  band: "equatorial" | "subtropical" | "temperate" | "polar"
  hemisphere: "N" | "S"
  side: "E" | "W"
  fromHkgNm: number
}

const bands = ["all", "equatorial", "subtropical", "temperate", "polar"] as const
const hemispheres = ["all", "N", "S"] as const
const sides = ["all", "E", "W"] as const

export function AirportBrowser({ letter, airports }: { letter: string; airports: BrowserAirport[] }) {
  const [band, setBand] = useState<(typeof bands)[number]>("all")
  const [hemisphere, setHemisphere] = useState<(typeof hemispheres)[number]>("all")
  const [side, setSide] = useState<(typeof sides)[number]>("all")
  const [near, setNear] = useState(false)
  const [query, setQuery] = useState("")

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return airports
      .filter((row) => (band === "all" ? true : row.band === band))
      .filter((row) => (hemisphere === "all" ? true : row.hemisphere === hemisphere))
      .filter((row) => (side === "all" ? true : row.side === side))
      .filter((row) => (near ? row.fromHkgNm <= 1500 : true))
      .filter((row) => (q ? `${row.iata} ${row.city} ${row.name}`.toLowerCase().includes(q) : true))
      .sort((a, b) => a.fromHkgNm - b.fromHkgNm)
  }, [airports, band, hemisphere, side, near, query])

  return (
    <div className="browser">
      <div className="filters" role="group" aria-label="Narrow this letter">
        {bands.map((item) => (
          <button key={item} type="button" aria-pressed={band === item} onClick={() => setBand(item)}>
            {item}
          </button>
        ))}
        {hemispheres.filter((item) => item !== "all").map((item) => (
          <button key={item} type="button" aria-pressed={hemisphere === item} onClick={() => setHemisphere(hemisphere === item ? "all" : item)}>
            {item === "N" ? "North" : "South"}
          </button>
        ))}
        {sides.filter((item) => item !== "all").map((item) => (
          <button key={item} type="button" aria-pressed={side === item} onClick={() => setSide(side === item ? "all" : item)}>
            {item === "E" ? "East" : "West"}
          </button>
        ))}
        <button type="button" aria-pressed={near} onClick={() => setNear((value) => !value)}>
          Within 1,500 nm of Hong Kong
        </button>
      </div>
      <form className="find inline" onSubmit={(event) => event.preventDefault()}>
        <input value={query} placeholder={`Filter ${letter}`} aria-label={`Filter airports under ${letter}`} onChange={(event) => setQuery(event.target.value)} />
      </form>
      <p className="tally">{shown.length.toLocaleString("en-US")} of {airports.length.toLocaleString("en-US")}</p>
      {shown.length === 0 ? <p>Nothing in this letter matches.</p> : (
        <ul className="directory">
          {shown.map((row) => (
            <li key={row.iata}>
              <Link href={`/book/airports/${row.iata}`}>
                <b>{row.iata}</b>
                <span>{row.city || row.name}</span>
                <small>{row.band} · {row.hemisphere}{row.side} · {row.fromHkgNm.toLocaleString("en-US")} nm</small>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
