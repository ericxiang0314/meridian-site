import Link from "next/link"
import { Credit } from "@/components/Credit"
import { DeskPreview } from "@/components/DeskPreview"
import { atlasCounts } from "@/lib/atlas"
import { publicPath } from "@/lib/public-path"
import { routeScenes } from "@/lib/routes"

export default function Home() {
  const scene = routeScenes()[0]
  const counts = atlasCounts()
  return (
    <>
      <section className="product-hero">
        <img
          src={publicPath("/atlas/barcelona-night.jpg")}
          alt="Barcelona airport at night, seen from the air"
          width={2800}
          height={1570}
        />
        <div className="product-copy">
          <h1>The night desk</h1>
          <p className="lede">Meridian is a flight desk for Mac, and the reference book beside it. Try the chart here. It draws a great circle. It is not live traffic. The Mac app, version 0.2, shows a position only when a feed sends one. That app is not offered as a download.</p>
          <Credit name="barcelona" />
          <div className="cta-row">
            <Link className="btn solid" href="/chart">Try the chart</Link>
            <Link className="btn" href="/desk">About the Mac app</Link>
          </div>
        </div>
        <div className="product-stage">
          <DeskPreview scene={scene} />
        </div>
      </section>

      <section className="entrance">
        <div>
          <h2>Track a flight</h2>
          <p>Watch a live position, put the nearest field on the chart, and open that field in the book. The three stay on one subject. The picture above is only the example.</p>
        </div>
        <Link className="btn solid" href="/sky">Open live tracking</Link>
      </section>

      <section className="ledger">
        <div>
          <h2>Seven keys</h2>
          <p>The Mac app is arranged the way a night shift is arranged. The number is the key on the keyboard.</p>
        </div>
        <ol>
          {[
            ["1", "Map", "The chart, the great circle, and the aircraft moving along it."],
            ["2", "Airports", "Every field the desk can name, with the clock and the neighbours."],
            ["3", "Airlines", "The designator on the flight, and the callsign on the radio."],
            ["4", "Sky", "The live list. Any height, or only the low ones, or only the high ones."],
            ["5", "History", "Flights and airframes you have already opened."],
            ["6", "Library", "What you are watching, and the type stamped on the row."],
            ["7", "Settings", "The desk, set for this Mac."],
          ].map(([key, name, line]) => (
            <li key={key}>
              <kbd>{key}</kbd>
              <span>
                <b>{name}</b>
                {line}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="band">
        <figure>
          <img src={publicPath("/atlas/haneda-lineup.jpg")} alt="An airliner holding on the runway lights at Haneda" width={2800} height={1849} loading="lazy" />
        </figure>
        <div className="band-copy">
          <h2>The chart</h2>
          <p>Draw the great circle between two airports. Drag the aircraft, change the speed, or let it fly. The line is the shortest path over the earth, not a filed route.</p>
          <Link className="btn" href="/chart">Open the chart</Link>
        </div>
      </section>

      <section className="band flip">
        <figure>
          <img src={publicPath("/atlas/narita-apron.jpg")} alt="United aircraft on the Narita apron at night" width={2800} height={1866} loading="lazy" />
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
          <img src={publicPath("/atlas/haneda-lineup.jpg")} alt="An airliner holding on the runway lights at Haneda" width={2800} height={1849} loading="lazy" />
        </figure>
        <div className="band-copy">
          <h2>The fields</h2>
          <p>Public places only. Haneda is one of them: a deck a visitor can use. If the note does not name a place, there is not one.</p>
          <Link className="btn" href="/fields">See the fields</Link>
        </div>
      </section>

      <section className="get-band">
        <img src={publicPath("/atlas/dulles-dusk.jpg")} alt="Washington Dulles at dusk" width={2800} height={1662} loading="lazy" />
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
