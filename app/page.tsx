import Link from "next/link"
import { RouteStudio } from "@/components/RouteStudio"
import type { Scene } from "@/components/Stage"
import { airportByIata } from "@/lib/db"
import { haversineNm, initialBearing } from "@/lib/geo"

const pairs = [
  ["HKG", "LHR"],
  ["PVG", "LAX"],
  ["NRT", "SFO"],
  ["SIN", "CDG"],
  ["PEK", "FRA"],
  ["ICN", "JFK"],
  ["CAN", "SYD"],
  ["DXB", "LHR"],
] as const

function scene(fromCode: string, toCode: string): Scene | null {
  const from = airportByIata(fromCode)
  const to = airportByIata(toCode)
  if (!from || !to) return null
  return {
    from: from.iata,
    to: to.iata,
    fromCity: from.city || from.name,
    toCity: to.city || to.name,
    fromLat: from.lat,
    fromLon: from.lon,
    toLat: to.lat,
    toLon: to.lon,
    nm: haversineNm(from, to),
    bearing: initialBearing(from, to),
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ route?: string }> }) {
  const route = (await searchParams).route ?? ""
  const scenes = pairs.map(([a, b]) => scene(a, b)).filter((row): row is Scene => row != null)
  const found = scenes.findIndex((item) => `${item.from}-${item.to}` === route.toUpperCase())
  const active = found >= 0 ? found : 0
  return (
    <>
      <section className="hero">
        <h1>
          The night desk.
          <br />
          <span className="mute">Meet your </span>
          <span className="sky">sky.</span>
        </h1>
        <div className="cta-row">
          <Link className="btn solid" href="/book">Open the book</Link>
          <Link className="btn" href="/fields">The fields</Link>
          <a className="btn" href="https://github.com/ericxiang0314/meridian-site">Star us on GitHub</a>
        </div>
        <p className="reqs">Mac app · Version 0.2 · Personal</p>
      </section>
      <RouteStudio scenes={scenes} active={active} />
      <section className="know">
        <h2>Good to know.</h2>
        <p>A few things before you open a flight.</p>
        <details>
          <summary>What is Meridian?</summary>
          <p>A night desk for the Mac. It keeps a chart, a flight strip, and a book of airports, airlines, and airframes. This site is that book, and a desk you can try in the browser.</p>
        </details>
        <details>
          <summary>Is the line on the chart a real route?</summary>
          <p>No. It is the great-circle distance between two airports in the book, and the initial bearing. It is not a clearance, a timetable, or the path a crew files.</p>
        </details>
        <details>
          <summary>What is in the book?</summary>
          <p>Airport codes, airline designators, and airframe names, the same ones the Mac desk uses when it reads a callsign. Search by code, city, or name.</p>
        </details>
        <details>
          <summary>Where can I stand and watch?</summary>
          <p>Fourteen fields have a note, and each note names a public place. If a place is not named, it is not a spot. The fence is not a place to stand.</p>
        </details>
        <details>
          <summary>How do I get the Mac app?</summary>
          <p>It is the Meridian desk on this Mac, version 0.2. The source of this site is on GitHub. The app itself is not a store download.</p>
        </details>
      </section>
    </>
  )
}
