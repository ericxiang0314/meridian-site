import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ClockBoard } from "@/components/ClockBoard"
import { airportRecord, atlasAirports, distanceNm, nearbyAirports } from "@/lib/atlas"
import { fieldByIata } from "@/lib/db"

type Params = { params: Promise<{ iata: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return atlasAirports.map((row) => ({ iata: row.iata }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const airport = airportRecord((await params).iata)
  return { title: airport ? `${airport.iata} ${airport.city || airport.name}` : "Airport" }
}

export default async function AirportPage({ params }: Params) {
  const airport = airportRecord((await params).iata)
  if (!airport) notFound()
  const field = fieldByIata(airport.iata)
  const near = nearbyAirports(airport.iata, 6).map((row) => ({ ...row, apart: distanceNm(airport, row) }))
  return (
    <div className="sheet">
      <article className="record">
        <div>
          <h1>{airport.iata}</h1>
          <p>{airport.name}</p>
          <p>{airport.city || airport.tz.split("/").pop()?.replace(/_/g, " ") || "City not recorded"}</p>
          <p>{airport.lat.toFixed(2)}° {airport.hemisphere} / {Math.abs(airport.lon).toFixed(2)}° {airport.side}</p>
          <p>{airport.band} · {airport.hemisphere === "N" ? "northern" : "southern"} hemisphere</p>
          <p>A name in the book, not a live board.</p>
          <ClockBoard hubs={[{ iata: airport.iata, city: airport.city || airport.iata, tz: airport.tz }]} />
          {field ? <Link className="action" href={`/fields/${airport.iata}`}>The public place</Link> : null}
        </div>
        <div className="paper">
          <h2>{field ? "A public place" : "In the book"}</h2>
          <p>{field ? field.note : "The desk can name this airport. It does not have a spotting note."}</p>
          <p>
            <Link href={`/sky?mode=watch&airport=${airport.iata}`}>Watch overhead</Link>
            {" · "}
            {airport.iata !== "LHR" ? <Link href={`/sky?mode=chart&from=${airport.iata}&to=LHR`}>Chart to London</Link> : null}
            {airport.iata !== "LHR" && airport.iata !== "JFK" ? " · " : null}
            {airport.iata !== "JFK" ? <Link href={`/sky?mode=chart&from=${airport.iata}&to=JFK`}>Chart to New York</Link> : null}
          </p>
          <h2>Nearby</h2>
          <ul className="directory">
            {near.map((row) => (
              <li key={row.iata}>
                <Link href={`/book/airports/${row.iata}`}>
                  <b>{row.iata}</b>
                  <span>{row.city || row.name}</span>
                  <small>{row.apart.toLocaleString("en-US")} nm</small>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  )
}
