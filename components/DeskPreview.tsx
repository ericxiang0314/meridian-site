"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { landPath } from "@/lib/land"
import { initialBearing, project } from "@/lib/geo"
import { searchAirports } from "@/lib/db"
import { formatPosition, pointAlong, trackPoints } from "@/lib/sphere"
import type { Scene } from "./Stage"

const W = 960
const H = 480

const sky = [
  { call: "CPA830", route: "Hong Kong to London", ft: 8000, kt: 240 },
  { call: "CES511", route: "Shanghai to Los Angeles", ft: 36000, kt: 490 },
  { call: "UAL875", route: "San Francisco to Tokyo", ft: 34000, kt: 470 },
  { call: "BAW31", route: "London to Hong Kong", ft: 12000, kt: 310 },
  { call: "AFR188", route: "Paris to Singapore", ft: 39000, kt: 480 },
]

type Hit = { iata: string; city: string; name: string }

function chain(points: { lat: number; lon: number }[]): string {
  let command = "M"
  let previous: number | null = null
  return points
    .map((point) => {
      if (previous != null && Math.abs(point.lon - previous) > 180) command = "M"
      const placed = project(point.lat, point.lon, W, H)
      previous = point.lon
      const piece = `${command}${placed.x.toFixed(1)} ${placed.y.toFixed(1)}`
      command = "L"
      return piece
    })
    .join("")
}

export function DeskPreview({ scene }: { scene: Scene }) {
  const [tab, setTab] = useState<"Map" | "Sky" | "Book">("Map")
  const [along, setAlong] = useState(0.32)
  const [band, setBand] = useState<"Any" | "Low" | "High">("Any")
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<Hit[]>([])

  useEffect(() => {
    if (tab !== "Map") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    let last = performance.now()
    const step = (now: number) => {
      const delta = now - last
      last = now
      setAlong((current) => (current + delta / 18000) % 1)
      frame = window.requestAnimationFrame(step)
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [tab])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setHits([])
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      if (controller.signal.aborted) return
      setHits(searchAirports(q, 5))
    }, 140)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  const from = { lat: scene.fromLat, lon: scene.fromLon }
  const to = { lat: scene.toLat, lon: scene.toLon }
  const points = trackPoints(from, to, 80)
  const cut = Math.round(along * (points.length - 1))
  const here = pointAlong(from, to, along)
  const ahead = pointAlong(from, to, Math.min(1, along + 0.02))
  const herePoint = project(here.lat, here.lon, W, H)
  const aheadPoint = project(ahead.lat, ahead.lon, W, H)
  const angle = (Math.atan2(aheadPoint.y - herePoint.y, aheadPoint.x - herePoint.x) * 180) / Math.PI
  const shown = sky.filter((row) => (band === "Low" ? row.ft < 18000 : band === "High" ? row.ft >= 18000 : true))

  return (
    <div className="desk-preview" data-ui="desk">
      <div className="desk-bar" role="tablist" aria-label="Desk views">
        <span>Meridian</span>
        {(["Map", "Sky", "Book"] as const).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      {tab === "Map" ? (
        <div className="desk-map" role="tabpanel">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${scene.from} to ${scene.to}`}>
            <rect width={W} height={H} fill="#0c1216" />
            <path d={landPath} fill="#1b2c34" />
            <path d={chain(points.slice(cut))} fill="none" stroke="#8a6730" strokeWidth="3" />
            <path d={chain(points.slice(0, cut + 1))} fill="none" stroke="#e2a23a" strokeWidth="3.5" />
            <circle cx={project(from.lat, from.lon, W, H).x} cy={project(from.lat, from.lon, W, H).y} r="5" fill="#f4f1ea" />
            <circle cx={project(to.lat, to.lon, W, H).x} cy={project(to.lat, to.lon, W, H).y} r="5" fill="#7ec8c3" />
            <g transform={`translate(${herePoint.x} ${herePoint.y}) rotate(${angle})`}>
              <path d="M 12 0 L -8 6 L -3 0 L -8 -6 Z" fill="#f4f1ea" />
            </g>
          </svg>
          <p>
            <strong>{scene.from} to {scene.to}</strong>
            <span>{formatPosition(here)}</span>
            <span>{initialBearing(here, to)}° · {scene.nm.toLocaleString("en-US")} nm</span>
          </p>
        </div>
      ) : null}
      {tab === "Sky" ? (
        <div className="desk-sky" role="tabpanel">
          <div className="filters" role="group" aria-label="Height">
            {(["Any", "Low", "High"] as const).map((item) => (
              <button key={item} type="button" aria-pressed={band === item} onClick={() => setBand(item)}>
                {item}
              </button>
            ))}
          </div>
          <ul>
            {shown.map((row) => (
              <li key={row.call}>
                <b>{row.call}</b>
                <span>
                  {row.route}
                  <small>{row.ft.toLocaleString("en-US")} ft · {row.kt} kt</small>
                </span>
              </li>
            ))}
          </ul>
          <p>A sample of the sky list. Low is under 18,000 ft. The Mac app reads the live feed.</p>
        </div>
      ) : null}
      {tab === "Book" ? (
        <form className="desk-book" role="tabpanel" onSubmit={(event) => event.preventDefault()}>
          <input value={query} placeholder="HKG, Cathay, or B738" aria-label="Search the book" onChange={(event) => setQuery(event.target.value)} />
          {hits.length > 0 ? (
            <ul>
              {hits.map((hit) => (
                <li key={hit.iata}>
                  <Link href={`/book/airports/${hit.iata}`}>
                    <b>{hit.iata}</b>
                    <span>{hit.city || hit.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Type two letters. The book behind this box is the same one the desk uses.</p>
          )}
        </form>
      ) : null}
    </div>
  )
}
