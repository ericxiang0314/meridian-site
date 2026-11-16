import type { Metadata } from "next"
import Link from "next/link"
import { Strip } from "@/components/Fragments"

export const metadata: Metadata = { title: "The desk" }

export default function DeskPage() {
  return (
    <>
      <article className="record">
        <div className="paper">
          <h2>The desk</h2>
          <Strip flight="CX830" airline="Cathay Pacific" from="Hong Kong" to="London" nm={5994} />
          <p>The Mac app is the working desk: a chart, a sky list, a flight card, and the book of airframes stamped onto each row.</p>
        </div>
        <div>
          <h1>On this Mac</h1>
          <p>Keys 1 to 7 move among the chart, the airports, the airlines, the sky, the history, the library, and settings.</p>
          <p>A click on empty chart clears the flight. The height filter is Any, Low, or High, and the sky list follows it.</p>
          <p>Version 0.2 keeps a Natural Earth chart for the middle zoom and the aircraft book beside the live row.</p>
          <Link className="action" href="/book">Open the book</Link>
        </div>
      </article>
    </>
  )
}
