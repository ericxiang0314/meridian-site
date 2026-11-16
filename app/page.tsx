import Link from "next/link"
import { DeskPreview } from "@/components/DeskPreview"
import { atlasCounts } from "@/lib/atlas"
import { routeScenes } from "@/lib/routes"

export default function Home() {
  const scene = routeScenes().find((item) => item.from === "HKG" && item.to === "LHR") ?? routeScenes()[0]
  const counts = atlasCounts()
  return (
    <>
      <section className="product-hero">
        <img
          src="/atlas/barcelona-night.jpg"
          alt="Barcelona airport at night, seen from the air"
          width={2800}
          height={1570}
        />
        <div className="product-copy">
          <h1>The night desk</h1>
          <p className="lede">A Mac app for the flight you are watching: where it is, which airport it left, and the book that names the rest.</p>
          <div className="cta-row">
            <Link className="btn solid" href="/chart">Open the chart</Link>
            <Link className="btn" href="/desk">See the Mac app</Link>
          </div>
        </div>
        <div className="product-stage">
          <DeskPreview scene={scene} />
        </div>
      </section>

      <section className="band">
        <figure>
          <img src="/atlas/haneda-lineup.jpg" alt="An airliner holding on the runway lights at Haneda" width={2800} height={1849} />
        </figure>
        <div className="band-copy">
          <h2>The chart</h2>
          <p>Draw the great circle between two airports. Drag the aircraft, change the speed, or let it fly. The line is the shortest path over the earth, not a filed route.</p>
          <Link className="btn" href="/chart">Open the chart</Link>
        </div>
      </section>

      <section className="band flip">
        <figure>
          <img src="/atlas/narita-apron.jpg" alt="United aircraft on the Narita apron at night" width={2800} height={1866} />
        </figure>
        <div className="band-copy">
          <h2>The book</h2>
          <p>
            {counts.airports.toLocaleString("en-US")} airports, {counts.airlines.toLocaleString("en-US")} airlines, and {counts.types.toLocaleString("en-US")} airframes. Search a code, or walk the names by letter.
          </p>
          <Link className="btn" href="/book">Open the book</Link>
        </div>
      </section>

      <section className="band">
        <figure>
          <img src="/atlas/sumburgh-beach.jpg" alt="Sumburgh Airport from the public beach at dusk" width={2800} height={1524} />
        </figure>
        <div className="band-copy">
          <h2>The fields</h2>
          <p>Fourteen public places, and nowhere else. A beach, a fence, a stand you can actually stand on. If the note is not here, the desk does not invent one.</p>
          <Link className="btn" href="/fields">See the fields</Link>
        </div>
      </section>

      <section className="get-band">
        <img src="/atlas/dulles-dusk.jpg" alt="Washington Dulles at dusk" width={2800} height={1662} />
        <div>
          <h2>Version 0.2, on the Mac</h2>
          <p>Keys 1 to 7 move among the map, the airports, the airlines, the sky, the history, the library, and settings.</p>
          <p>The sky list follows a height filter: Any, Low, or High. A click on empty chart clears the flight. The aircraft book sits beside the live row.</p>
          <Link className="btn solid" href="/desk">How the desk works</Link>
        </div>
      </section>
    </>
  )
}
