"use client"

import Link from "next/link"
import { useEffect, useState, type FormEvent } from "react"
import { airportByIata, nearestAirport } from "@/lib/db"
import { readLive, type LiveAnswer } from "@/lib/live-browser"
import type { LiveCraft } from "@/lib/live-feed"

type Craft = LiveCraft
type Answer = LiveAnswer
type Ask = { mode: "flight" | "near"; query: string; airport: string }

const places = [
  { label: "Over London", airport: "LHR" },
  { label: "Over New York", airport: "JFK" },
  { label: "Over Tokyo", airport: "NRT" },
]

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
  const [text, setText] = useState(seed?.mode === "flight" ? seed.query : seed?.airport || "LHR")
  const [airport, setAirport] = useState(seed?.airport || "LHR")
  const [pending, setPending] = useState(true)
  const [answer, setAnswer] = useState<Answer | null>(null)

  useEffect(() => {
    const next: Ask = seed?.mode === "flight" && seed.query.trim()
      ? { mode: "flight", query: seed.query, airport: seed.airport || "LHR" }
      : { mode: "near", query: "", airport: seed?.airport || "LHR" }
    setText(next.mode === "flight" ? next.query : next.airport)
    setAirport(next.airport)
    void read(next)
    // Load the subject this page opened with. Later reads come from the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.mode, seed?.query, seed?.airport])

  async function read(next: Ask) {
    setAirport(next.airport || "LHR")
    setPending(true)
    try {
      const data = await readLive(next)
      setAnswer(data)
      if (data.airport) setAirport(data.airport)
      if (data.found && data.aircraft && !Array.isArray(data.aircraft)) onFlight?.(next.query, data.aircraft)
      if (data.found && next.mode === "near" && data.airport) onNear?.(data.airport)
    } catch (error) {
      setAnswer({ found: false, error: error instanceof Error ? error.message : "The feed did not answer. Use Show aircraft to try again." })
    } finally {
      setPending(false)
    }
  }

  function ask(raw: string) {
    const value = raw.trim().toUpperCase()
    if (!value) {
      void read({ mode: "near", query: "", airport: airport || "LHR" })
      return
    }
    if (/^[A-Z]{3}$/.test(value) && airportByIata(value)) {
      setText(value)
      void read({ mode: "near", query: "", airport: value })
      return
    }
    setText(value)
    void read({ mode: "flight", query: value, airport: airport || "LHR" })
  }

  const one = answer?.aircraft && !Array.isArray(answer.aircraft) ? answer.aircraft : null
  const many = answer?.aircraft && Array.isArray(answer.aircraft) ? answer.aircraft : []
  const field = answer?.airport
    || (one?.lat != null && one.lon != null ? nearestAirport(one.lat, one.lon)?.iata : null)
    || airport
  const other = field === "LHR" ? "JFK" : "LHR"

  return (
    <div className="live">
      <form
        className="find"
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          ask(text)
        }}
      >
        <input
          value={text}
          placeholder="BA117 or LHR"
          aria-label="Flight, callsign, registration, or airport"
          onChange={(event) => setText(event.target.value.toUpperCase())}
        />
        <button type="submit">{pending ? "Reading" : "Show aircraft"}</button>
      </form>
      <div className="filters" role="group" aria-label="Places">
        {places.map((sample) => (
          <button
            key={sample.airport}
            type="button"
            aria-pressed={answer?.mode === "near" && answer.airport === sample.airport && !answer.missed}
            onClick={() => ask(sample.airport)}
          >
            {sample.label}
          </button>
        ))}
      </div>
      {pending && !answer ? <p className="live-note">Reading aircraft from the feed.</p> : null}
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
          {many.map((craft, index) => {
            const name = craft.callsign || craft.registration
            return (
              <li key={`${name}${craft.lat}${index}`}>
                <button
                  type="button"
                  className="hit"
                  disabled={!name}
                  onClick={() => {
                    if (!name) return
                    setText(name)
                    void read({ mode: "flight", query: name, airport })
                  }}
                >
                  <b>{name || "—"}</b>
                  <span>
                    {place(craft)}
                    <small>{craft.altFt != null ? `${craft.altFt.toLocaleString("en-US")} ft` : "ground"} · {craft.gsKt ?? "—"} kt · {craft.type}</small>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
      {field ? (
        <p className="live-links">
          <Link href={`/chart?from=${field}&to=${other}`}>Example great circle from {field}</Link>
          <Link href={`/book/airports/${field}`}>Open {field} in the book</Link>
        </p>
      ) : null}
      {answer?.note ? <p className="live-note">{answer.note} Source: {answer.source}.</p> : null}
    </div>
  )
}
