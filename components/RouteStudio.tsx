"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { landPath } from "@/lib/land"
import { initialBearing, project } from "@/lib/geo"
import { pairScene } from "@/lib/pair"
import { formatDuration, formatPosition, pointAlong, trackPoints } from "@/lib/sphere"
import { CodeField } from "./CodeField"
import type { Scene } from "./Stage"

const W = 960
const H = 480

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

export function RouteStudio({ scenes, active, initialCustom = null }: { scenes: Scene[]; active: number; initialCustom?: Scene | null }) {
  const router = useRouter()
  const params = useSearchParams()
  const routeName = (params.get("route") ?? "").toUpperCase()
  const found = scenes.findIndex((item) => `${item.from}-${item.to}` === routeName)
  const queried = pairScene(params.get("from") ?? "", params.get("to") ?? "")
  const start = found >= 0 ? found : active
  const [index, setIndex] = useState(start)
  const [custom, setCustom] = useState<Scene | null>(initialCustom ?? queried)
  const [fromCode, setFromCode] = useState(initialCustom?.from ?? queried?.from ?? scenes[start]?.from ?? "")
  const [toCode, setToCode] = useState(initialCustom?.to ?? queried?.to ?? scenes[start]?.to ?? "")
  const [speed, setSpeed] = useState(480)
  const [along, setAlong] = useState(0.28)
  const [note, setNote] = useState("")
  const [playing, setPlaying] = useState(false)
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const indexRef = useRef(index)
  indexRef.current = index

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault()
        const next = event.key === "ArrowRight" ? indexRef.current + 1 : indexRef.current - 1
        const wrapped = (next + scenes.length) % scenes.length
        setPlaying(false)
        setCustom(null)
        setIndex(wrapped)
        setFromCode(scenes[wrapped].from)
        setToCode(scenes[wrapped].to)
        setAlong(0.28)
      }
      if (event.key === " " && tag !== "BUTTON") {
        event.preventDefault()
        setPlaying((value) => !value)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [scenes])

  const scene = custom ?? scenes[index] ?? scenes[0]
  const hours = scene && speed > 0 ? scene.nm / speed : 0

  useEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    let last = performance.now()
    const duration = Math.min(28000, Math.max(7000, hours * 1600))
    const step = (now: number) => {
      const delta = now - last
      last = now
      setAlong((current) => {
        const next = current + delta / duration
        if (next >= 1) {
          setPlaying(false)
          return 1
        }
        return next
      })
      frame = window.requestAnimationFrame(step)
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [playing, hours])

  const geometry = useMemo(() => {
    if (!scene) return null
    const from = { lat: scene.fromLat, lon: scene.fromLon }
    const to = { lat: scene.toLat, lon: scene.toLon }
    const points = trackPoints(from, to)
    const cut = Math.round(along * (points.length - 1))
    const here = pointAlong(from, to, along)
    const ahead = pointAlong(from, to, Math.min(1, along + 0.012))
    const herePoint = project(here.lat, here.lon, W, H)
    const aheadPoint = project(ahead.lat, ahead.lon, W, H)
    const jump = Math.abs(here.lon - ahead.lon) > 180
    const angle = jump ? 0 : (Math.atan2(aheadPoint.y - herePoint.y, aheadPoint.x - herePoint.x) * 180) / Math.PI
    return {
      from: project(from.lat, from.lon, W, H),
      to: project(to.lat, to.lon, W, H),
      flown: chain(points.slice(0, cut + 1)),
      rest: chain(points.slice(cut)),
      here,
      herePoint,
      angle,
      heading: initialBearing(here, ahead),
    }
  }, [scene, along])

  function share(from: string, to: string) {
    router.replace(`/chart?from=${from}&to=${to}`, { scroll: false })
  }

  function drawPair(from: string, to: string) {
    const left = from.trim().toUpperCase()
    const right = to.trim().toUpperCase()
    if (left.length < 3 || right.length < 3) return
    const known = scenes.find((item) => item.from === left && item.to === right)
    if (known) {
      setCustom(null)
      setIndex(scenes.indexOf(known))
      setNote("")
      setAlong(0.28)
      setPlaying(false)
      share(known.from, known.to)
      return
    }
    const next = pairScene(left, right)
    if (!next) {
      setNote("Those codes are not in the book.")
      return
    }
    setNote("")
    setPlaying(false)
    setAlong(0.28)
    setCustom(next)
    share(next.from, next.to)
  }

  function placeAt(clientX: number, clientY: number) {
    const svg = svgRef.current
    if (!svg || !scene) return
    const rect = svg.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * W
    const y = ((clientY - rect.top) / rect.height) * H
    const points = trackPoints({ lat: scene.fromLat, lon: scene.fromLon }, { lat: scene.toLat, lon: scene.toLon }, 80)
    let best = 0
    let bestDistance = Infinity
    points.forEach((point, index) => {
      const placed = project(point.lat, point.lon, W, H)
      const distance = (placed.x - x) ** 2 + (placed.y - y) ** 2
      if (distance < bestDistance) {
        bestDistance = distance
        best = index
      }
    })
    setAlong(best / (points.length - 1))
  }

  function surprise() {
    if (scenes.length < 2) return
    let next = index
    while (next === index) next = Math.floor(Math.random() * scenes.length)
    setCustom(null)
    setPlaying(false)
    setIndex(next)
    setFromCode(scenes[next].from)
    setToCode(scenes[next].to)
    setAlong(0.28)
    share(scenes[next].from, scenes[next].to)
  }

  if (!scene || !geometry) return null
  const flownNm = Math.round(scene.nm * along)
  const leftNm = scene.nm - flownNm

  return (
    <section className="stage">
      <div className="chart-frame" data-ui="chart">
        <svg
          ref={svgRef}
          className="scene-chart"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${scene.fromCity} to ${scene.toCity}, ${Math.round(along * 100)} percent of the way`}
          onPointerDown={(event) => {
            setPlaying(false)
            setDragging(true)
            event.currentTarget.setPointerCapture(event.pointerId)
            placeAt(event.clientX, event.clientY)
          }}
          onPointerMove={(event) => {
            if (dragging) placeAt(event.clientX, event.clientY)
          }}
          onPointerUp={() => setDragging(false)}
        >
          <rect width={W} height={H} fill="#0c1216" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((lon) => {
            const x = project(0, lon > 180 ? lon - 360 : lon, W, H).x
            return <line key={`lon${lon}`} x1={x} x2={x} y1="0" y2={H} stroke="#1a262c" strokeWidth="1" />
          })}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const y = project(lat, 0, W, H).y
            return <line key={`lat${lat}`} x1="0" x2={W} y1={y} y2={y} stroke="#1a262c" strokeWidth="1" />
          })}
          <path d={landPath} fill="#1b2c34" />
          <path d={geometry.rest} fill="none" stroke="#8a6730" strokeWidth="2.5" />
            <path d={geometry.flown} fill="none" stroke="#f2b33d" strokeWidth="3" />
          <circle cx={geometry.from.x} cy={geometry.from.y} r="5" fill="#f4f1ea" />
          <circle cx={geometry.to.x} cy={geometry.to.y} r="5" fill="#6bd1b8" />
          <text x={geometry.from.x + 8} y={geometry.from.y - 8} fill="#f4f1ea" fontSize="14">{scene.from}</text>
          <text x={geometry.to.x + 8} y={geometry.to.y - 8} fill="#6bd1b8" fontSize="14">{scene.to}</text>
          <g transform={`translate(${geometry.herePoint.x} ${geometry.herePoint.y}) rotate(${geometry.angle})`}>
            <path d="M 10 0 L -7 5 L -3 0 L -7 -5 Z" fill="#f4f1ea" />
          </g>
        </svg>
        <div className="chart-read">
          <strong>{formatPosition(geometry.here)}</strong>
          <span>{geometry.heading}° now</span>
          <span>{flownNm.toLocaleString("en-US")} nm flown</span>
          <span>{leftNm.toLocaleString("en-US")} nm left</span>
        </div>
      </div>
      <aside className="scene-side">
        <div className="film" role="listbox" aria-label="Routes">
          {scenes.map((item, i) => (
            <button
              key={`${item.from}${item.to}`}
              type="button"
              role="option"
              aria-selected={!custom && i === index}
              onClick={() => {
                setCustom(null)
                setPlaying(false)
                setIndex(i)
                setFromCode(item.from)
                setToCode(item.to)
                setAlong(0.28)
                setNote("")
                share(item.from, item.to)
              }}
            >
              <b>{item.from}–{item.to}</b>
              <small>{item.nm.toLocaleString("en-US")} nm</small>
            </button>
          ))}
        </div>
        <h2>
          <span>{scene.fromCity}</span>
          <span>{scene.toCity}</span>
        </h2>
        <p className="scene-by">
          {scene.nm.toLocaleString("en-US")} nm · {scene.bearing}° off {scene.from} · {formatDuration(hours)} at {speed} kt
        </p>
        <p className="scene-kind">
          {formatDuration(hours * along)} flown · {formatDuration(hours * (1 - along))} still to go. The line is the great circle, not a filed route.
        </p>
        <form
          className="pair-form"
          onSubmit={(event) => {
            event.preventDefault()
            drawPair(fromCode, toCode)
          }}
        >
          <CodeField label="From" value={fromCode} onChange={setFromCode} onPick={(code) => drawPair(code, toCode)} />
          <CodeField label="To" value={toCode} onChange={setToCode} onPick={(code) => drawPair(fromCode, code)} />
          <button type="submit">Draw</button>
        </form>
        {note ? <p className="scene-note">{note}</p> : null}
        <div className="tool-row">
          <button
            type="button"
            onClick={() => {
              const nextFrom = toCode
              const nextTo = fromCode
              setFromCode(nextFrom)
              setToCode(nextTo)
              drawPair(nextFrom, nextTo)
            }}
          >
            Swap
          </button>
          <button
            type="button"
            aria-pressed={playing}
            onClick={() => {
              if (along >= 0.995) setAlong(0)
              setPlaying((value) => !value)
            }}
          >
            {playing ? "Pause" : "Fly"}
          </button>
          <button type="button" onClick={surprise}>Surprise me</button>
        </div>
        <label className="slider">
          Speed {speed} kt
          <input type="range" min={280} max={560} step={10} value={speed} aria-valuetext={`${speed} knots`} onChange={(event) => setSpeed(Number(event.target.value))} />
        </label>
        <label className="slider">
          Along the track, {Math.round(along * 100)} percent
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(along * 100)}
            aria-valuetext={`${Math.round(along * 100)} percent`}
            onChange={(event) => {
              setPlaying(false)
              setAlong(Number(event.target.value) / 100)
            }}
          />
        </label>
        <p className="scene-note">Drag the chart, or press space to fly it. Left and right change the saved pair.</p>
      </aside>
    </section>
  )
}
