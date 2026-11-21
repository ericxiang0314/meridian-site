import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { atlasTypes, familyOf, typeRecord, typesForMaker } from "@/lib/atlas"

type Params = { params: Promise<{ code: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return atlasTypes.filter((row) => /^[A-Z0-9]{2,8}$/.test(row.code)).map((row) => ({ code: row.code }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const row = typeRecord((await params).code)
  return { title: row ? `${row.code} ${row.name}` : "Airframe" }
}

export default async function TypePage({ params }: Params) {
  const row = typeRecord((await params).code)
  if (!row) notFound()
  const siblings = typesForMaker(row.maker).filter((item) => item.code !== row.code)
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>{row.code}</h1>
        <p>{row.name}</p>
        <p>{familyOf(row.maker)}</p>
        <p><Link className="action" href="/book/types">All airframes</Link></p>
      </header>
      {siblings.length > 0 ? (
        <div className="inset paper">
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
      ) : null}
    </div>
  )
}
