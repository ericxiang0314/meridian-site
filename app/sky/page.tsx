import type { Metadata } from "next"
import { Suspense } from "react"
import { DeskWorkspace } from "@/components/DeskWorkspace"
import { routeScenes } from "@/lib/routes"

export const metadata: Metadata = {
  title: "Track",
  description: "One desk for a live position, a great-circle chart, and the book. The feed is not a schedule.",
}

export default function SkyPage() {
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>The desk</h1>
        <p>Watch, chart, and the book share one subject. Keys 1, 2, and 3 move between them. A live position is not the example chart, and neither one is a schedule.</p>
      </header>
      <Suspense fallback={null}>
        <DeskWorkspace scenes={routeScenes()} />
      </Suspense>
    </div>
  )
}
