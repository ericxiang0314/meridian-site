import type { Metadata } from "next"
import { FieldFilter } from "@/components/FieldFilter"
import { allFields } from "@/lib/db"
import { publicPath } from "@/lib/public-path"

export const metadata: Metadata = { title: "Fields" }

export default function FieldsPage() {
  const fields = allFields().map((field) => ({ iata: field.iata, name: field.name, stand: field.stand }))
  return (
    <>
      <section className="page-intro">
        <img src={publicPath("/atlas/sumburgh-beach.jpg")} alt="Sumburgh Airport from the public beach at dusk" width={2800} height={1524} />
        <div>
          <h1>Fields</h1>
          <p>A public place, or none. The beach in front of Sumburgh is the kind of edge these notes mean.</p>
        </div>
      </section>
      <div className="sheet">
        <FieldFilter fields={fields} />
      </div>
    </>
  )
}
