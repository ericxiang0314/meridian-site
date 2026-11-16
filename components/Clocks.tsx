"use client"

import { useEffect, useState } from "react"

type Hub = { iata: string; city: string; tz: string }

function face(tz: string, now: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now)
}

export function Clocks({ hubs }: { hubs: Hub[] }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <ul className="clocks" data-ui="clocks">
      {hubs.map((hub) => (
        <li key={hub.iata}>
          <span className="clock-city">{hub.city || hub.iata}</span>
          <span className="clock-time">{now ? face(hub.tz, now) : "––:––"}</span>
          <span className="clock-code">{hub.iata}</span>
        </li>
      ))}
    </ul>
  )
}
