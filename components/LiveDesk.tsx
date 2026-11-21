"use client"

import { useState, type FormEvent } from "react"

type Craft = {
  callsign: string
  registration: string
  type: string
  lat: number | null
  lon: number | null
  altFt: number | null
  onGround: boolean
  gsKt: number | null
  track: number | null
  rateFpm: number | null
  phase: string
  seenSeconds: number | null
}

type Answer = {
  found: boolean
  mode?: "flight" | "near"
  label?: string
  mappedFrom?: string | null
  airport?: string
  city?: string
  source?: string
  aircraft?: Craft | Craft[]
  note?: string
  error?: string
}

function place(craft: Craft): string {
  if (craft.lat == null || craft.lon == null) return "Position was not sent."
  const north = craft.lat >= 0 ? "N" : "S"
  const east = craft.lon >= 0 ? "E" : "W"
  return `${Math.abs(craft.lat).toFixed(2)}° ${north}, ${Math.abs(craft.lon).toFixed(2)}° ${east}`
}

export function LiveDesk() {
  const [mode, setMode] = useState<"flight" | "near">("flight")
  const [query, setQuery] = useState("CX830")
  const [airport, setAirport] = useState("HKG")
  const [pending, setPending] = useState(false)
  const [answer, setAnswer] = useState<Answer | null>(null)

  async function ask(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setAnswer(null)
    const params = mode === "near" ? `airport=${encodeURIComponent(airport)}` : `q=${encodeURIComponent(query)}`
    const origins = ["", process.env.NEXT_PUBLIC_LIVE_ORIGIN ?? ""].filter((origin, index, all) => origin !== undefined && all.indexOf(origin) === index)
    let failure = "This copy of the site could not read the feed. The radar does not answer the browser directly, and this host has no server to ask for it."
    try {
      for (const origin of origins) {
        const response = await fetch(`${origin}/api/live?${params}`)
        const type = response.headers.get("content-type") ?? ""
        if (!type.includes("json")) continue
        setAnswer((await response.json()) as Answer)
        return
      }
    } catch (error) {
      failure = error instanceof Error ? error.message : failure
    } finally {
      setPending(false)
    }
    setAnswer({ found: false, error: failure })
  }

  const one = answer?.aircraft && !Array.isArray(answer.aircraft) ? answer.aircraft : null
  const many = answer?.aircraft && Array.isArray(answer.aircraft) ? answer.aircraft : []

  return (
    <div className="live">
      <div className="filters" role="group" aria-label="What to ask the feed">
        <button type="button" aria-pressed={mode === "flight"} onClick={() => { setMode("flight"); setAnswer(null) }}>One flight</button>
        <button type="button" aria-pressed={mode === "near"} onClick={() => { setMode("near"); setAnswer(null) }}>Near an airport</button>
      </div>
      <form className="find" onSubmit={ask}>
        {mode === "flight" ? (
          <input value={query} aria-label="Flight, callsign, or registration" onChange={(event) => setQuery(event.target.value.toUpperCase())} />
        ) : (
          <input value={airport} maxLength={4} aria-label="Airport code" onChange={(event) => setAirport(event.target.value.toUpperCase())} />
        )}
        <button type="submit">{pending ? "Reading" : "Read the feed"}</button>
      </form>
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
