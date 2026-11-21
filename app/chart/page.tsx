import type { Metadata } from "next"
import { Suspense } from "react"
import { ClockBoard } from "@/components/ClockBoard"
import { Credit } from "@/components/Credit"
import Link from "next/link"
import { RouteStudio } from "@/components/RouteStudio"
import { hubs } from "@/lib/db"
import { publicPath } from "@/lib/public-path"
import { routeScenes } from "@/lib/routes"

export const metadata: Metadata = { title: "Chart" }

export default function ChartPage() {
  const scenes = routeScenes()
  const clockHubs = hubs().map((hub) => ({ iata: hub.iata, city: hub.city, tz: hub.tz }))
  return (
    <>
      <section className="page-intro">
        <img
          src={publicPath("/atlas/boston-approach.jpg")}
          alt="A Delta A220 on approach to Boston in fog, landing lights reflected on the water"
          width={2800}
          height={1866}
          style={{ objectPosition: "center 42%" }}
        />
        <div>
          <h1>Chart</h1>
          <p>An example great circle, not a live flight and not a filed route. New York to London starts at the same point as the example on the front page. For an aircraft that is actually in the air, use Track.</p>
          <Credit name="boston" />
          <p><Link href="/sky">Open live tracking</Link></p>
        </div>
      </section>
      <Suspense fallback={null}>
        <RouteStudio scenes={scenes} active={0} />
      </Suspense>
      <section className="clock-wrap">
        <h2>Hub clocks</h2>
        <ClockBoard hubs={clockHubs} />
      </section>
    </>
  )
}
