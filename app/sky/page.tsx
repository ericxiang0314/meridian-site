import type { Metadata } from "next"
import { Suspense } from "react"
import { LiveDesk } from "@/components/LiveDesk"

export const metadata: Metadata = {
  title: "Track",
  description: "Read a live position from the public ADS-B feed. This is not the example chart, and it is not a schedule.",
}

export default function SkyPage() {
  return (
    <div className="sheet">
      <header className="sheet-intro">
        <h1>Track</h1>
        <p>This is the live desk. It reads a position from adsb.lol, the same kind of public feed the Mac app uses. It is not the example chart, and it does not know gates or delays.</p>
      </header>
      <Suspense fallback={null}>
        <LiveDesk />
      </Suspense>
    </div>
  )
}
