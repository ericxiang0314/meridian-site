import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { airportByIata, allFields, fieldByIata } from "@/lib/db"

type Params = { params: Promise<{ iata: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return allFields().map((field) => ({ iata: field.iata }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const field = fieldByIata((await params).iata)
  return { title: field ? field.name : "Field" }
}

export default async function FieldPage({ params }: Params) {
  const field = fieldByIata((await params).iata)
  if (!field) notFound()
  const airport = airportByIata(field.iata)
  return (
    <>
      <article className="record">
        <div>
          <h1>{field.iata}</h1>
          <p>{field.name}</p>
          <p>{airport ? airport.name : ""}</p>
        </div>
        <div className="paper">
          <h2>{field.stand}</h2>
          <p>{field.when_text}</p>
          <p>{field.note}</p>
          {airport ? <Link href={`/book/airports/${airport.iata}`}>The airport in the book</Link> : null}
        </div>
      </article>
    </>
  )
}
