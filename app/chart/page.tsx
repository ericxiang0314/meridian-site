import type { Metadata } from "next"
import { RouteStudio } from "@/components/RouteStudio"
import { routeScenes } from "@/lib/routes"

export const metadata: Metadata = { title: "Chart" }

export default async function ChartPage({ searchParams }: { searchParams: Promise<{ route?: string }> }) {
  const route = (await searchParams).route ?? ""
  const scenes = routeScenes()
  const found = scenes.findIndex((item) => `${item.from}-${item.to}` === route.toUpperCase())
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
      <RouteStudio scenes={scenes} active={found >= 0 ? found : 0} />
    </>
  )
}
