import type { Metadata } from "next"
import { Credit } from "@/components/Credit"
import { FieldFilter } from "@/components/FieldFilter"
import { allFields } from "@/lib/db"
import { publicPath } from "@/lib/public-path"

export const metadata: Metadata = { title: "Fields" }

export default function FieldsPage() {
  const fields = allFields().map((field) => ({ iata: field.iata, name: field.name, stand: field.stand, when: field.when_text, note: field.note }))
  return (
    <>
      <section className="page-intro">
        <img src={publicPath("/atlas/haneda-lineup.jpg")} alt="An airliner holding on the runway lights at Haneda at night" width={2800} height={1849} />
        <div>
          <h1>Fields</h1>
          <p>Public places only. Haneda keeps a deck a visitor can use. If a note does not name a place, there is not one.</p>
          <Credit name="haneda" />
        </div>
      </section>
      <div className="sheet sheet-follow">
        <FieldFilter fields={fields} />
      </div>
    </>
  )
}
