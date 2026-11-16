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
    <div className="sheet">
      <article className="record">
        <div>
          <h1>{field.iata}</h1>
          <p>{field.name}</p>
          <p>{airport ? airport.name : "The airport name is not in the book."}</p>
          <p>A desk note about a public place. It is not a live board, and it does not record the day it was last checked.</p>
        </div>
        <div className="paper">
          <h2>Where to stand</h2>
          <p>{field.stand}</p>
          <h2>When it works</h2>
          <p>{field.when_text}</p>
          <h2>The limit</h2>
          <p>{field.note}</p>
          {airport ? <Link className="action" href={`/book/airports/${airport.iata}`}>The airport in the book</Link> : null}
        </div>
      </article>
    </div>
  )
}
