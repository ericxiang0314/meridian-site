import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { airportsInBand, bands, type Band } from "@/lib/atlas"

type Params = { params: Promise<{ band: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return bands.map((band) => ({ band }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: `${(await params).band} airports` }
}

export default async function BandPage({ params }: Params) {
  const band = (await params).band as Band
  if (!bands.includes(band)) notFound()
  const rows = airportsInBand(band)
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>{band}</h1>
        <p>{rows.length.toLocaleString("en-US")} airports, nearest Hong Kong first.</p>
      </header>
      <ul className="directory">
        {rows.map((row) => (
          <li key={row.iata}>
            <Link href={`/book/airports/${row.iata}`}>
              <b>{row.iata}</b>
              <span>{row.city || row.name}</span>
              <small>{row.hemisphere}{row.side} · {row.fromHkgNm.toLocaleString("en-US")} nm · {row.tz}</small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
