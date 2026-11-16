import Link from "next/link"
import { Clocks } from "@/components/Clocks"
import { PairChart, Rose, Strip } from "@/components/Fragments"
import { StickyCard } from "@/components/StickyCard"
import { airlineByIata, airportByIata, counts, hubs, searchAirports } from "@/lib/db"
import { haversineNm, initialBearing } from "@/lib/geo"

type Query = { from?: string; to?: string }

export default async function Home({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams
  const from = airportByIata(query.from || "HKG") ?? airportByIata("HKG")!
  const to = airportByIata(query.to || "LHR") ?? airportByIata("LHR")!
  const nm = haversineNm(from, to)
  const bearing = initialBearing(from, to)
  const hours = Math.round((nm / 480) * 10) / 10
  const book = counts()
  const sample = searchAirports("").slice(0, 6)
  const cathay = airlineByIata("CX")
  const clockHubs = hubs()

  return (
    <>
      <section className="hero">
        <img
          className="hero-photo"
          src="https://picsum.photos/id/974/2000/1200"
          alt="The Milky Way over a dark horizon with a warm glow"
          width={2000}
          height={1200}
        />
        <StickyCard>
          <article className="programme">
            <h1 className="spread">
              <span>Meridian</span>
              <span>night</span>
              <span>desk</span>
            </h1>
            <p className="facts">
              <span>A Mac app</span>
              <span>Version 0.2</span>
              <span>Kept at home</span>
            </p>
            <p className="lede">A paper chart for the flights overhead, and a book of the airports you can stand beside.</p>
            <div className="card-foot">
              <p className="credit">
                Night sky by Greg Rakozy
              </p>
              <Link className="action" href="/book">Open the book</Link>
              <Link className="text-link" href="/desk">The desk</Link>
            </div>
          </article>
          <div className="stub">
            <form action="/" method="get">
              <label>
                From
                <input name="from" defaultValue={from.iata} maxLength={3} aria-label="From airport" />
              </label>
              <label>
                To
                <input name="to" defaultValue={to.iata} maxLength={3} aria-label="To airport" />
              </label>
              <button type="submit">Draw the track</button>
            </form>
            <p className="track-read">
              <span>
                {from.iata} / {to.iata}
                <small>{from.city || from.name} to {to.city || to.name}</small>
              </span>
              <span>
                {nm.toLocaleString("en-US")} nm
                <small>{bearing}° · about {hours} h at 480 kt</small>
              </span>
            </p>
          </div>
        </StickyCard>
      </section>

      <section className="sheet">
        <div className="plate">
          <div className="paper">
            <h2>The strip</h2>
            <Strip
              flight="CX830"
              airline={cathay?.name ?? "Cathay Pacific"}
              from={from.city || from.iata}
              to={to.city || to.iata}
              nm={nm}
            />
            <Clocks hubs={clockHubs.map((hub) => ({ iata: hub.iata, city: hub.city, tz: hub.tz }))} />
          </div>
          <div className="paper">
            <Rose bearing={bearing} />
            <p>The same pair, as the desk would hold it. The track is the great-circle distance, not a filed route.</p>
            <PairChart from={from} to={to} />
          </div>
        </div>
      </section>

      <section className="sheet">
        <h2>Fields</h2>
        <div className="tiles">
          {[
            ["HKG", "Tuen Mun faces 25R."],
            ["LHR", "Myrtle Avenue faces 27L."],
            ["LAX", "Imperial Hill and the terrace."],
            ["HND", "The public deck is the place."],
          ].map(([code, line]) => (
            <Link className="tile" href={`/fields/${code}`} key={code}>
              <div className="tile-copy">
                <strong>{code}</strong>
                <span>{line}</span>
              </div>
              <div className="tile-copy">
                <span>A public place only. The fence is not a spot.</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="sky-band">
          <img
            src="https://picsum.photos/id/765/1400/900"
            alt="Night sky fading to an orange glow on the horizon"
            width={1400}
            height={900}
          />
          <div>
            <h2>After dark</h2>
            <p>Fourteen fields have a note in the book. Each one names a public place, and says when that place faces the arrivals.</p>
            <Link className="action" href="/fields">Read the fields</Link>
          </div>
        </div>
      </section>

      <section className="sheet">
        <div className="book-col">
          <h2 className="book-word">Book</h2>
          <div className="bars">
            <details open>
              <summary>Airports <span>{book.airports.toLocaleString("en-US")}</span></summary>
              <div className="panel">
                {sample.map((row) => (
                  <Link className="row" href={`/book/airports/${row.iata}`} key={row.iata}>
                    <span>{row.city || row.name}</span>
                    <span>{row.iata}</span>
                  </Link>
                ))}
              </div>
            </details>
            <details>
              <summary>Airlines <span>{book.airlines.toLocaleString("en-US")}</span></summary>
              <div className="panel">
                <Link className="row" href="/book?q=Cathay">Cathay Pacific <span>CX</span></Link>
                <Link className="row" href="/book?q=Lufthansa">Lufthansa <span>LH</span></Link>
                <Link className="row" href="/book?q=Singapore">Singapore Airlines <span>SQ</span></Link>
              </div>
            </details>
            <details>
              <summary>Airframes <span>{book.types.toLocaleString("en-US")}</span></summary>
              <div className="panel">
                <Link className="row" href="/book?q=A359">Airbus A350-900 <span>A359</span></Link>
                <Link className="row" href="/book?q=B77W">Boeing 777-300ER <span>B77W</span></Link>
                <Link className="row" href="/book?q=C919">Comac C919 <span>C919</span></Link>
              </div>
            </details>
            <details>
              <summary>Fields <span>{book.fields}</span></summary>
              <div className="panel">
                <Link className="row" href="/fields">The fourteen public places</Link>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="sheet">
        <div className="letter-wrap">
          <article className="letter">
            <h2>A letter</h2>
            <p>I wanted one desk for the hour after dark, when a flight is a callsign, a height, and a line on a chart.</p>
            <p>The Mac app is that desk. This site is the book it belongs to: the airports, the airlines, and the few fields where a person can still stand in public and watch an arrival.</p>
            <p>Nothing here is a clearance, a timetable, or a place you have not already been invited to stand. <span className="mark">The fence is not a spot.</span></p>
            <p className="sign">Meridian</p>
            <div className="perforation">
              <span>ericxiang0314 / meridian-site</span>
              <Link href="/desk">How the desk is set</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="close">
        <h2>Stand where the public can stand</h2>
        <div className="close-foot">
          <p>Open the book, pick a field, and read the place before you go.</p>
          <Link className="action" href="/fields">Read the fields</Link>
        </div>
      </section>

      <footer className="footer">
        <ul className="blocks" aria-label="Meridian">
          {"MERIDIAN".split("").map((letter) => (
            <li key={letter}>{letter}</li>
          ))}
        </ul>
        <div className="footer-links">
          <nav>
            <Link href="/book">Book</Link>
            <Link href="/fields">Fields</Link>
            <Link href="/desk">Desk</Link>
            <a href="https://github.com/ericxiang0314/meridian-site">GitHub</a>
          </nav>
          <p>Night photographs by Greg Rakozy and Grant McIver, via Lorem Picsum.</p>
        </div>
        <p className="fine">Meridian 0.2. The book is a copy of public airport and airline designators, kept so the desk and the site name the same places.</p>
      </footer>
    </>
  )
}
