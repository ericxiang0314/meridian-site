import type { Metadata } from "next"
import { TypeBrowser } from "@/components/TypeBrowser"
import { atlasTypes, makers } from "@/lib/atlas"

export const metadata: Metadata = { title: "Airframes" }

export default function TypesPage() {
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>Airframes</h1>
        <p>{atlasTypes.length.toLocaleString("en-US")} type codes. Choose a maker, or type a code.</p>
      </header>
      <TypeBrowser makers={makers()} types={atlasTypes} />
    </div>
  )
}
