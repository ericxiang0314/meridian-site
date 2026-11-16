"use client"

import { useEffect, useMemo, useState } from "react"
import type { Scene } from "./Stage"

function project(lat: number, lon: number, w: number, h: number) {
  return { x: ((lon + 180) / 360) * w, y: ((90 - lat) / 180) * h }
}

function pointOnCurve(a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, t: number) {
  const u = 1 - t
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  }
}

export function RouteStudio({ scenes, active }: { scenes: Scene[]; active: number }) {
  const [index, setIndex] = useState(active)
  const [custom, setCustom] = useState<Scene | null>(null)
  const [fromCode, setFromCode] = useState(scenes[active]?.from ?? "")
  const [toCode, setToCode] = useState(scenes[active]?.to ?? "")
  const [speed, setSpeed] = useState(480)
  const [along, setAlong] = useState(0.35)
  const [note, setNote] = useState("")
  const [now, setNow] = useState("")

  useEffect(() => {
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
      )
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
      event.preventDefault()
      setCustom(null)
      setIndex((current) => {
        const next = event.key === "ArrowRight" ? current + 1 : current - 1
        return (next + scenes.length) % scenes.length
      })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [scenes.length])

  const scene = custom ?? scenes[index] ?? scenes[0]
  const hours = scene ? Math.round((scene.nm / speed) * 10) / 10 : 0

  const plane = useMemo(() => {
    if (!scene) return null
    const w = 860
    const h = 480
    const a = project(scene.fromLat, scene.fromLon, w, h)
    const b = project(scene.toLat, scene.toLon, w, h)
    const wrap = Math.abs(a.x - b.x) > w / 2
    const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 48 }
    return { w, h, a, b, c, wrap, dot: wrap ? b : pointOnCurve(a, c, b, along) }
  }, [scene, along])

  async function drawPair(from: string, to: string) {
    const left = from.trim().toUpperCase()
    const right = to.trim().toUpperCase()
    if (left.length < 3 || right.length < 3) return
    const known = scenes.find((item) => item.from === left && item.to === right)
    if (known) {
      setCustom(null)
      setIndex(scenes.indexOf(known))
      setNote("")
      return
    }
    const response = await fetch(`/api/track?from=${left}&to=${right}`)
    if (!response.ok) {
      setNote("Those codes are not in the book.")
      return
    }
    setNote("")
    setCustom((await response.json()) as Scene)
  }

  function surprise() {
    if (scenes.length < 2) return
    let next = index
    while (next === index) next = Math.floor(Math.random() * scenes.length)
    setCustom(null)
    setIndex(next)
    setFromCode(scenes[next].from)
    setToCode(scenes[next].to)
    setAlong(0.35)
  }

  if (!scene || !plane) return null

  return (
    <section className="stage">
      <div className="desktop">
        <div className="menubar">
          <span>Meridian</span>
          <span>Chart</span>
          <span>Sky</span>
          <span>Book</span>
          <span className="menu-clock">{now || "—"}</span>
        </div>
        <svg className="scene-chart" viewBox={`0 0 ${plane.w} ${plane.h}`} role="img" aria-label={`${scene.from} to ${scene.to}`}>
          <rect width={plane.w} height={plane.h} fill="#202429" />
          {[80, 160, 240, 320, 400].map((y) => (
            <line key={y} x1="0" x2={plane.w} y1={y} y2={y} stroke="#2c363c" strokeWidth="1" />
          ))}
          {plane.wrap ? null : (
            <path d={`M ${plane.a.x} ${plane.a.y} Q ${plane.c.x} ${plane.c.y} ${plane.b.x} ${plane.b.y}`} fill="none" stroke="#e2a23a" strokeWidth="3" />
          )}
          <circle cx={plane.a.x} cy={plane.a.y} r="6" fill="#f4f1ea" />
          <circle cx={plane.b.x} cy={plane.b.y} r="6" fill="#7ec8c3" />
          <circle cx={plane.dot.x} cy={plane.dot.y} r="8" fill="#e2a23a" />
          <text x="28" y="54" fill="#f4f1ea" fontSize="28">{scene.from}</text>
          <text x="28" y="84" fill="#9eacb3" fontSize="16">{scene.fromCity}</text>
          <text x={plane.w - 28} y="54" fill="#7ec8c3" fontSize="28" textAnchor="end">{scene.to}</text>
          <text x={plane.w - 28} y="84" fill="#9eacb3" fontSize="16" textAnchor="end">{scene.toCity}</text>
        </svg>
        <div className="dock" aria-hidden="true">
          <span />
          <span />
          <span />
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
                setIndex(i)
                setFromCode(item.from)
                setToCode(item.to)
                setNote("")
              }}
            >
              <b>{item.from}</b>
              <b>{item.to}</b>
            </button>
          ))}
        </div>
        <h2>
          {scene.fromCity}
          <br />
          {scene.toCity}
        </h2>
        <p className="scene-by">{scene.from} to {scene.to}</p>
        <p className="scene-kind">Great-circle track</p>
        <form
          className="pair-form"
          onSubmit={(event) => {
            event.preventDefault()
            void drawPair(fromCode, toCode)
          }}
        >
          <label>
            From
            <input value={fromCode} maxLength={4} aria-label="From airport" onChange={(event) => setFromCode(event.target.value.toUpperCase())} />
          </label>
          <label>
            To
            <input value={toCode} maxLength={4} aria-label="To airport" onChange={(event) => setToCode(event.target.value.toUpperCase())} />
          </label>
          <button type="submit">Draw</button>
        </form>
        {note ? <p className="scene-note">{note}</p> : null}
        <label className="slider">
          Speed {speed} kt
          <input type="range" min={280} max={560} step={10} value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
        </label>
        <label className="slider">
          Along the track
          <input type="range" min={0} max={100} value={Math.round(along * 100)} onChange={(event) => setAlong(Number(event.target.value) / 100)} />
        </label>
        <p className="scene-note">
          {scene.nm.toLocaleString("en-US")} nm · {scene.bearing}° · about {hours} h at {speed} kt. Not a filed route.
        </p>
        <button type="button" className="btn" onClick={surprise}>
          Surprise me
        </button>
      </aside>
    </section>
  )
}
