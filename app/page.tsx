import Link from "next/link"

const doors = [
  {
    href: "/chart",
    title: "Chart",
    line: "Draw a great-circle between two airports.",
    src: "/atlas/edinburgh-airport-the-apron-at-night-geograph.jpg",
    alt: "An easyJet aircraft on the Edinburgh apron at night, stairs at the forward door",
    wide: true,
  },
  {
    href: "/fields",
    title: "Fields",
    line: "Fourteen public places, and nowhere else.",
    src: "/atlas/night-apron-img-4779-15475261209.jpg",
    alt: "Sumburgh Airport at dusk, seen from the beach with the sea in front",
  },
  {
    href: "/desk",
    title: "Desk",
    line: "The Mac app, version 0.2.",
    src: "/atlas/sturup-airport-by-night.jpg",
    alt: "An SAS aircraft at Malmö Airport under the floodlights",
  },
  {
    href: "/book",
    title: "Book",
    line: "Airports, airlines, and airframes.",
    src: "/atlas/airplanes-of-united-airlines-in-tarmac-at.jpg",
    alt: "United aircraft on the Narita apron at night",
  },
]

export default function Home() {
  return (
    <>
      <section className="cover">
        <img
          src="/atlas/airplanes-of-united-airlines-in-tarmac-at.jpg"
          alt="Two United aircraft parked on the Narita apron at night"
          width={1920}
          height={1280}
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
