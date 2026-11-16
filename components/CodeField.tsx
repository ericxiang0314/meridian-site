"use client"

import { useEffect, useId, useRef, useState } from "react"
import { searchAirports } from "@/lib/db"

type Hit = { iata: string; city: string; name: string }

export function CodeField({
  label,
  value,
  onChange,
  onPick,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onPick: (code: string) => void
}) {
  const listId = useId()
  const [hits, setHits] = useState<Hit[]>([])
  const [open, setOpen] = useState(false)
  const skip = useRef("")

  useEffect(() => {
    const query = value.trim()
    if (query.length < 2 || query === skip.current) {
      setHits([])
      setOpen(false)
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      if (controller.signal.aborted) return
      const found = searchAirports(query, 6)
      setHits(found)
      setOpen(found.length > 0)
    }, 140)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [value])

  function choose(hit: Hit) {
    skip.current = hit.iata
    onChange(hit.iata)
    onPick(hit.iata)
    setOpen(false)
    setHits([])
  }

  return (
    <label className="code-field">
      {label}
      <input
        value={value}
        maxLength={4}
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        onChange={(event) => {
          skip.current = ""
          onChange(event.target.value.toUpperCase())
        }}
        onFocus={() => {
          if (hits.length) setOpen(true)
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false)
          if (event.key === "Enter" && open && hits[0]) {
            event.preventDefault()
            choose(hits[0])
          }
        }}
      />
      {open ? (
        <ul id={listId} className="suggest" role="listbox">
          {hits.map((hit) => (
            <li key={hit.iata}>
              <button type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(hit)}>
                <b>{hit.iata}</b>
                <span>{hit.city || hit.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </label>
  )
}
