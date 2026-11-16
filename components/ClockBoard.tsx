"use client"

import { useEffect, useState } from "react"

type Hub = { iata: string; city: string; tz: string }

function face(tz: string, now: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(now)
}

export function ClockBoard({ hubs }: { hubs: Hub[] }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <ul className="clock-board">
      {hubs.map((hub) => (
        <li key={hub.iata}>
          <span>{hub.city || hub.iata}</span>
          <strong>{now ? face(hub.tz, now) : "--:--:--"}</strong>
          <small>{hub.iata} · {hub.tz.split("/").pop()?.replace(/_/g, " ")}</small>
        </li>
      ))}
    </ul>
  )
}
