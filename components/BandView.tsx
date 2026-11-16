import Link from "next/link"
import { airportsInBand, type Band } from "@/lib/atlas"

export const bandPageSize = 40

export function BandView({ band, page }: { band: Band; page: number }) {
  const rows = airportsInBand(band)
  const pages = Math.max(1, Math.ceil(rows.length / bandPageSize))
  const current = Math.min(Math.max(page, 1), pages)
  const slice = rows.slice((current - 1) * bandPageSize, current * bandPageSize)
  const previous = current - 1
  const next = current + 1
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>{band}</h1>
        <p>{rows.length.toLocaleString("en-US")} airports, nearest Hong Kong first. Page {current} of {pages}.</p>
      </header>
      <ul className="directory">
        {slice.map((row) => (
          <li key={row.iata}>
            <Link href={`/book/airports/${row.iata}`}>
              <b>{row.iata}</b>
              <span>{row.city || row.name}</span>
              <small>{row.hemisphere}{row.side} · {row.fromHkgNm.toLocaleString("en-US")} nm · {row.tz.split("/").pop()?.replace(/_/g, " ")}</small>
            </Link>
          </li>
        ))}
      </ul>
      <p className="pager">
        {previous >= 1 ? <Link href={previous === 1 ? `/book/airports/band/${band}` : `/book/airports/band/${band}/${previous}`}>Previous</Link> : <span>Previous</span>}
        {next <= pages ? <Link href={`/book/airports/band/${band}/${next}`}>Next</Link> : <span>Next</span>}
      </p>
    </div>
  )
}
