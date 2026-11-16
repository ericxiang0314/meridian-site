import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHead } from "@/components/PageHead"
import { airportByIata, fieldByIata } from "@/lib/db"

type Params = { params: Promise<{ iata: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const airport = airportByIata((await params).iata)
  return { title: airport ? `${airport.iata} ${airport.city || airport.name}` : "Airport" }
}

export default async function AirportPage({ params }: Params) {
  const airport = airportByIata((await params).iata)
  if (!airport) notFound()
  const field = fieldByIata(airport.iata)
  return (
    <>
      <PageHead title="Meridian" />
      <article className="record">
        <div>
          <h1>{airport.iata}</h1>
          <p>{airport.name}</p>
          <p>{airport.city || "City not recorded"} / {airport.tz}</p>
          <p>{airport.lat.toFixed(2)} / {airport.lon.toFixed(2)}</p>
          {field ? <Link className="action" href={`/fields/${airport.iata}`}>The public place</Link> : null}
        </div>
        <div className="paper">
          <h2>{airport.city || airport.name}</h2>
          <p>{field ? field.note : "This airport is in the book as a place the desk can name. It does not have a spotting note."}</p>
          <p>Draw a track from the front of the site by pairing this code with another.</p>
          <Link href={`/?from=${airport.iata}&to=LHR`}>Pair with London</Link>
        </div>
      </article>
    </>
  )
}
