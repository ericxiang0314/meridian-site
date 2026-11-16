import type { Metadata } from "next"
import Link from "next/link"
import { Credit } from "@/components/Credit"
import { Strip } from "@/components/Fragments"
import { publicPath } from "@/lib/public-path"

export const metadata: Metadata = { title: "The desk" }

const keys = [
  ["1", "Map", "A Natural Earth chart at the middle zoom. Click empty chart and the flight clears."],
  ["2", "Airports", "The same book as this site: name, city, and the place you can stand."],
  ["3", "Airlines", "The mark on the tail, matched from the callsign rather than the first two letters."],
  ["4", "Sky", "The airborne list. The height filter is Any, Low, or High, and the list follows it."],
  ["5", "History", "Flights and aircraft already opened on this Mac."],
  ["6", "Library", "The watch list, and the airframe book beside the live row."],
  ["7", "Settings", "How this copy of the desk behaves."],
]

export default function DeskPage() {
  return (
    <>
      <section className="page-intro">
        <img src={publicPath("/atlas/dulles-dusk.jpg")} alt="Washington Dulles at dusk, the terminal roof and the tower above the approach road" width={2800} height={1662} />
        <div>
          <h1>The desk</h1>
          <p>Version 0.2 for the Mac. The site is the atlas. The app is the shift.</p>
          <Credit name="dulles" />
        </div>
      </section>
      <div className="sheet sheet-follow">
        <div className="inset paper">
          <h2>A flight card</h2>
          <Strip flight="CX830" airline="Cathay Pacific" from="Hong Kong" to="London" nm={5994} />
          <p>An example card for Cathay Pacific 830. It is not a live flight. Height and speed appear on the Mac app only when a feed sent them.</p>
        </div>
        <div className="inset">
          <h2>What is live</h2>
          <p>The chart on this website is an example great circle. It does not read a radar feed.</p>
          <p>Version 0.2 of the Mac app shows a position only when a feed sent it. The sky in view comes from adsb.lol and adsb.fi. The wider airborne picture comes from OpenSky. Boards come from FlightStats. Weather comes from aviationweather.gov. Airports, radio, navaids, and runways are OurAirports, public domain.</p>
          <p>There is no public download and no price. The app is not being offered that way.</p>
        </div>
        <ol className="keys">
          {keys.map(([key, name, line]) => (
            <li key={key}>
              <kbd>{key}</kbd>
              <span>
                <b>{name}</b>
                {line}
              </span>
            </li>
          ))}
        </ol>
        <p className="inset">
          <Link className="action" href="/chart">Open the chart</Link>
        </p>
      </div>
    </>
  )
}
