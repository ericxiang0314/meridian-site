import type { Metadata } from "next"
import { ClockBoard } from "@/components/ClockBoard"
import { RouteStudio } from "@/components/RouteStudio"
import type { Scene } from "@/components/Stage"
import { airportRecord, distanceNm } from "@/lib/atlas"
import { initialBearing } from "@/lib/geo"
import { hubs } from "@/lib/db"
import { routeScenes } from "@/lib/routes"

export const metadata: Metadata = { title: "Chart" }

function pairScene(fromCode: string, toCode: string): Scene | null {
  const from = airportRecord(fromCode)
  const to = airportRecord(toCode)
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
    nm: distanceNm(from, to),
    bearing: initialBearing(from, to),
  }
}

export default async function ChartPage({ searchParams }: { searchParams: Promise<{ route?: string; from?: string; to?: string }> }) {
  const query = await searchParams
  const scenes = routeScenes()
  const found = scenes.findIndex((item) => `${item.from}-${item.to}` === (query.route ?? "").toUpperCase())
  const custom = query.from && query.to ? pairScene(query.from, query.to) : null
  const clockHubs = hubs().map((hub) => ({ iata: hub.iata, city: hub.city, tz: hub.tz }))
  return (
    <>
      <section className="page-intro">
        <img
          src="/atlas/edinburgh-airport-the-apron-at-night-geograph.jpg"
          alt="Night turnaround on the Edinburgh apron"
          width={1600}
          height={1200}
        />
        <div>
          <h1>Chart</h1>
          <p>Pick a pair, or type two codes. The line is the great circle, not a filed route.</p>
        </div>
      </section>
      <RouteStudio scenes={scenes} active={found >= 0 ? found : 0} initialCustom={custom} />
      <section className="clock-wrap">
        <h2>Hub clocks</h2>
        <ClockBoard hubs={clockHubs} />
      </section>
    </>
  )
}
