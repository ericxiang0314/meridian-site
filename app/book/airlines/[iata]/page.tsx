import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHead } from "@/components/PageHead"
import { airlineByIata } from "@/lib/db"

type Params = { params: Promise<{ iata: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const airline = airlineByIata((await params).iata)
  return { title: airline ? airline.name : "Airline" }
}

export default async function AirlinePage({ params }: Params) {
  const airline = airlineByIata((await params).iata)
  if (!airline) notFound()
  return (
    <>
      <PageHead title="Meridian" />
      <article className="record">
        <div>
          <h1>{airline.iata}</h1>
          <p>{airline.name}</p>
          <p>{airline.icao ? `Callsign prefix ${airline.icao}` : "No callsign prefix on file."}</p>
        </div>
        <div className="paper">
          <h2>The same name as the desk</h2>
          <p>When the Mac app reads a callsign, it uses this designator. A three-letter callsign stays with this airline instead of being cut down to someone else&apos;s mark.</p>
          <Link href="/book">Back to the book</Link>
        </div>
      </article>
    </>
  )
}
