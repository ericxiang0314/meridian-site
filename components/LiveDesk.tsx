"use client"

import { useEffect, useState, type FormEvent } from "react"
import { readLive, type LiveAnswer } from "@/lib/live-browser"
import type { LiveCraft } from "@/lib/live-feed"

type Craft = LiveCraft
type Answer = LiveAnswer

const liveKey = "meridian-live"

function remembered(seed?: { mode: "flight" | "near"; query: string; airport: string }): Answer | null {
  if (!seed || typeof sessionStorage === "undefined") return null
  try {
    const saved = JSON.parse(sessionStorage.getItem(liveKey) || "null") as { mode: string; query: string; airport: string; answer: Answer } | null
    if (!saved) return null
    if (saved.mode === "near" && seed.mode === "near" && saved.airport === seed.airport) return saved.answer
    if (saved.mode === "flight" && seed.mode === "flight" && saved.query === seed.query) return saved.answer
  } catch {
    return null
  }
  return null
}

function place(craft: Craft): string {
  if (craft.lat == null || craft.lon == null) return "Position was not sent."
  const north = craft.lat >= 0 ? "N" : "S"
  const east = craft.lon >= 0 ? "E" : "W"
  return `${Math.abs(craft.lat).toFixed(2)}° ${north}, ${Math.abs(craft.lon).toFixed(2)}° ${east}`
}

export function LiveDesk({
  seed,
  onFlight,
  onNear,
}: {
  seed?: { mode: "flight" | "near"; query: string; airport: string }
  onFlight?: (query: string, craft: Craft) => void
  onNear?: (airport: string) => void
} = {}) {
  const [mode, setMode] = useState<"flight" | "near">("flight")
  const [query, setQuery] = useState("")
  const [airport, setAirport] = useState("LHR")
  const [pending, setPending] = useState(false)
  const [answer, setAnswer] = useState<Answer | null>(null)

  useEffect(() => {
    if (!seed) return
    setMode(seed.mode)
    setQuery(seed.query)
    setAirport(seed.airport)
    const saved = remembered(seed)
    if (saved) setAnswer(saved)
  }, [seed?.mode, seed?.query, seed?.airport])

  async function read(next: { mode: "flight" | "near"; query: string; airport: string }) {
    setMode(next.mode)
    setQuery(next.query)
    setAirport(next.airport)
    setPending(true)
    setAnswer(null)
    try {
      const data = await readLive(next)
      try {
        sessionStorage.setItem(liveKey, JSON.stringify({ mode: next.mode, query: next.query, airport: next.airport, answer: data }))
      } catch {
        /* The list still shows for this view. */
      }
      setAnswer(data)
      if (data.found && data.aircraft && !Array.isArray(data.aircraft)) onFlight?.(next.query, data.aircraft)
      if (data.found && next.mode === "near") onNear?.(next.airport)
    } catch (error) {
      setAnswer({ found: false, error: error instanceof Error ? error.message : "The radar did not answer." })
    } finally {
      setPending(false)
    }
  }

  const one = answer?.aircraft && !Array.isArray(answer.aircraft) ? answer.aircraft : null
  const many = answer?.aircraft && Array.isArray(answer.aircraft) ? answer.aircraft : []

  return (
    <div className="live">
      <div className="filters" role="group" aria-label="What to ask the feed">
        <button type="button" aria-pressed={mode === "flight"} onClick={() => { setMode("flight"); setAnswer(null) }}>One flight</button>
        <button type="button" aria-pressed={mode === "near"} onClick={() => { setMode("near"); setAnswer(null) }}>Near an airport</button>
      </div>
      <form className="find" onSubmit={(event: FormEvent) => { event.preventDefault(); void read({ mode, query, airport }) }}>
        {mode === "flight" ? (
          <input value={query} placeholder="BA117 or BAW117" aria-label="Flight, callsign, or registration" onChange={(event) => setQuery(event.target.value.toUpperCase())} />
        ) : (
          <input value={airport} maxLength={4} placeholder="LHR" aria-label="Airport code" onChange={(event) => setAirport(event.target.value.toUpperCase())} />
        )}
        <button type="submit">{pending ? "Reading" : "Read the feed"}</button>
      </form>
      <div className="filters" role="group" aria-label="Examples">
        {[
          { label: "Over London", mode: "near" as const, query: "", airport: "LHR" },
          { label: "Over New York", mode: "near" as const, query: "", airport: "JFK" },
          { label: "Over Tokyo", mode: "near" as const, query: "", airport: "NRT" },
        ].map((sample) => (
          <button key={sample.label} type="button" onClick={() => void read(sample)}>{sample.label}</button>
        ))}
      </div>
      {!answer && !pending ? <p className="live-note">The feed is adsb.lol. A position is shown only when a receiver sent one.</p> : null}
      {answer?.error ? <p className="live-note">{answer.error}</p> : null}
      {answer?.mappedFrom ? <p className="live-note">{answer.mappedFrom} is asked as the callsign {answer.label}.</p> : null}
      {one ? (
        <article className="paper live-card">
          <h2>{one.callsign || answer?.label}</h2>
          <p>{one.onGround ? "On the ground, as the feed reported it." : one.phase}</p>
          <p>{place(one)}</p>
          <p>
            {one.altFt != null ? `${one.altFt.toLocaleString("en-US")} ft` : "No altitude"}
            {" · "}
            {one.gsKt != null ? `${one.gsKt} kt` : "No speed"}
            {" · "}
            {one.track != null ? `${one.track}°` : "No heading"}
          </p>
          <p>{[one.registration, one.type].filter(Boolean).join(" · ") || "No registration or type was sent."}</p>
          {one.seenSeconds != null ? <p>Last heard about {one.seenSeconds} seconds ago.</p> : null}
        </article>
      ) : null}
      {many.length > 0 ? (
        <ul className="directory">
          {many.map((craft) => (
            <li key={`${craft.callsign}${craft.registration}${craft.lat}`}>
              <span className="hit">
                <b>{craft.callsign || craft.registration || "—"}</b>
                <span>
                  {place(craft)}
                  <small>{craft.altFt != null ? `${craft.altFt.toLocaleString("en-US")} ft` : "ground"} · {craft.gsKt ?? "—"} kt · {craft.type}</small>
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {answer?.note ? <p className="live-note">{answer.note} Source: {answer.source}.</p> : null}
    </div>
  )
}
