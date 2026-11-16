import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { typeRecord, typesForMaker } from "@/lib/atlas"

type Params = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const row = typeRecord((await params).code)
  return { title: row ? `${row.code} ${row.name}` : "Airframe" }
}

export default async function TypePage({ params }: Params) {
  const row = typeRecord((await params).code)
  if (!row) notFound()
  const siblings = typesForMaker(row.maker).filter((item) => item.code !== row.code).slice(0, 12)
  return (
    <div className="sheet">
      <article className="record">
        <div>
          <h1>{row.code}</h1>
          <p>{row.name}</p>
          <p>{row.maker}</p>
          <Link className="action" href="/book/types">All airframes</Link>
        </div>
        <div className="paper">
          <h2>Same maker</h2>
          <ul className="directory">
            {siblings.map((item) => (
              <li key={item.code}>
                <Link href={`/book/types/${item.code}`}>
                  <b>{item.code}</b>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  )
}
