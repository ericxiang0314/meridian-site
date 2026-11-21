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
        <h1>Track</h1>
        <p>Aircraft a receiver has right now. London loads on its own. This is not a schedule, and it does not know gates or delays.</p>
      </header>
      <Suspense fallback={null}>
        <DeskWorkspace scenes={routeScenes()} />
      </Suspense>
    </div>
  )
}
