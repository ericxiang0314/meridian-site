import Link from "next/link"

const doors = [
  {
    href: "/chart",
    title: "Chart",
    line: "Draw a great-circle between two airports.",
    src: "/atlas/haneda-lineup.jpg",
    alt: "An airliner holding short of the runway at Haneda, centreline lights in the foreground",
    wide: true,
  },
  {
    href: "/fields",
    title: "Fields",
    line: "Fourteen public places, and nowhere else.",
    src: "/atlas/sumburgh-beach.jpg",
    alt: "Sumburgh Airport at dusk, seen from the beach with the sea in front",
  },
  {
    href: "/desk",
    title: "Desk",
    line: "The Mac app, version 0.2.",
    src: "/atlas/dulles-dusk.jpg",
    alt: "The main terminal at Washington Dulles at dusk, with light trails on the approach road",
  },
  {
    href: "/book",
    title: "Book",
    line: "Airports, airlines, and airframes.",
    src: "/atlas/narita-apron.jpg",
    alt: "United aircraft on the Narita apron at night",
  },
]

export default function Home() {
  return (
    <>
      <section className="cover">
        <img
          src="/atlas/barcelona-night.jpg"
          alt="Barcelona airport at night, seen from the air, runways and stands lit in amber"
          width={2800}
          height={1570}
          style={{ objectPosition: "center 62%" }}
        />
        <div className="cover-copy">
          <p className="eyebrow">Meridian</p>
          <h1>The night desk</h1>
          <p className="lede">A chart for the flights overhead, and an atlas of the airports you can name.</p>
          <div className="cta-row">
            <Link className="btn solid" href="/chart">Open the chart</Link>
            <Link className="btn" href="/book">Open the book</Link>
          </div>
        </div>
      </section>
      <section className="doors" aria-label="The atlas">
        {doors.map((door) => (
          <Link key={door.href} href={door.href} className={door.wide ? "door wide" : "door"}>
            <img src={door.src} alt={door.alt} width={1600} height={1000} />
            <span>
              <strong>{door.title}</strong>
              {door.line}
            </span>
          </Link>
        ))}
      </section>
    </>
  )
}
