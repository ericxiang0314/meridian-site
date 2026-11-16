import type { Metadata } from "next"
import Link from "next/link"
import { PageHead } from "@/components/PageHead"
import { allFields } from "@/lib/db"

export const metadata: Metadata = { title: "Fields" }

export default function FieldsPage() {
  const fields = allFields()
  return (
    <>
      <PageHead title="Meridian" />
      <section className="results">
        <h2>Fields</h2>
        <p>Public places only. If a note does not name a place, do not invent one at the fence.</p>
        {fields.map((field) => (
          <Link className="hit" href={`/fields/${field.iata}`} key={field.iata}>
            <b>{field.iata}</b>
            <span>{field.name} / {field.stand}</span>
          </Link>
        ))}
      </section>
    </>
  )
}
