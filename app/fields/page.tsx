import type { Metadata } from "next"
import { FieldFilter } from "@/components/FieldFilter"
import { allFields } from "@/lib/db"

export const metadata: Metadata = { title: "Fields" }

export default function FieldsPage() {
  const fields = allFields().map((field) => ({ iata: field.iata, name: field.name, stand: field.stand }))
  return <FieldFilter fields={fields} />
}
