"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { BookSearch } from "@/components/BookSearch"
import { LiveDesk } from "@/components/LiveDesk"
import { RouteStudio } from "@/components/RouteStudio"
import type { Scene } from "@/components/Stage"
import { airportByIata, nearestAirport, searchAirlines, searchAirports } from "@/lib/db"
import { pairScene } from "@/lib/pair"
import {
  chartPair,
  emptyWorkspace,
  openBook,
  subjectLine,
  switchMode,
  watchAirport,
  watchFlight,
  workspaceFromParams,
  workspaceSearch,
  type DeskMode,
  type Workspace,
} from "@/lib/workspace"

const storageKey = "meridian-desk"

function cityOf(iata: string): string {
  return airportByIata(iata)?.city || airportByIata(iata)?.name || iata
}

function readStored(): Workspace | null {
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Workspace
    if (!parsed?.mode || !parsed.subject) return null
    return parsed
  } catch {
    return null
  }
}

export function DeskWorkspace({ scenes }: { scenes: Scene[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fromUrl = workspaceFromParams(params)
    setWorkspace(fromUrl ?? readStored() ?? emptyWorkspace)
    setReady(true)
    // The address is the source on entry. Later changes write it back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ready) return
    sessionStorage.setItem(storageKey, JSON.stringify(workspace))
  }, [ready, workspace])

  useEffect(() => {
    if (!ready) return
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      const next = event.key === "1" ? "watch" : event.key === "2" ? "chart" : event.key === "3" ? "book" : null
      if (!next) return
      event.preventDefault()
      commit(switchMode(workspace, next))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [ready, workspace])

  function commit(next: Workspace) {
    setWorkspace(next)
    router.replace(`/sky?${workspaceSearch(next)}`, { scroll: false })
  }

  function chartFrom(iata: string) {
    const other = iata === "LHR" ? "JFK" : "LHR"
    commit(chartPair(iata, other))
  }

  const subject = workspace.subject
  const pair = subject.kind === "pair" ? subject : subject.kind === "flight" && subject.near ? { from: subject.near, to: subject.near === "LHR" ? "JFK" : "LHR" } : subject.kind === "airport" ? { from: subject.iata, to: subject.iata === "LHR" ? "JFK" : "LHR" } : null
  const known = pair ? scenes.findIndex((scene) => scene.from === pair.from && scene.to === pair.to) : 0
  const custom = pair && known < 0 ? pairScene(pair.from, pair.to) : null

  return (
    <div className="workspace">
      <div className="desk-modes" role="tablist" aria-label="Desk">
        {(["watch", "chart", "book"] as DeskMode[]).map((mode, index) => (
          <button key={mode} type="button" role="tab" aria-selected={workspace.mode === mode} onClick={() => commit(switchMode(workspace, mode))}>
            <kbd>{index + 1}</kbd>
            {mode === "watch" ? "Watch" : mode === "chart" ? "Chart" : "Book"}
          </button>
        ))}
      </div>
      <div className="subject">
        <p>{subjectLine(workspace, cityOf)}</p>
        <div className="filters">
          {subject.kind === "airport" ? (
            <>
              <button type="button" onClick={() => commit(watchAirport(subject.iata))}>Watch overhead</button>
              <button type="button" onClick={() => chartFrom(subject.iata)}>Chart onward</button>
              <button type="button" onClick={() => commit(openBook(subject.iata))}>Hold in the book</button>
            </>
          ) : null}
          {subject.kind === "flight" && subject.near ? (
            <>
              <button type="button" onClick={() => chartFrom(subject.near!)}>Chart from {subject.near}</button>
              <button type="button" onClick={() => commit(openBook(subject.near!))}>Open {subject.near}</button>
            </>
          ) : null}
          {subject.kind === "pair" ? (
            <>
              <button type="button" onClick={() => commit(watchAirport(subject.from))}>Watch near {subject.from}</button>
              <button type="button" onClick={() => commit(openBook(subject.to))}>Open {subject.to}</button>
            </>
          ) : null}
        </div>
      </div>
      <div className="desk-panel" key={workspace.mode}>
        {ready && workspace.mode === "watch" ? (
          <LiveDesk
            seed={{
              mode: subject.kind === "flight" ? "flight" : "near",
              query: subject.kind === "flight" ? subject.query : "",
              airport: subject.kind === "airport" ? subject.iata : subject.kind === "pair" ? subject.from : subject.kind === "flight" && subject.near ? subject.near : "LHR",
            }}
            onFlight={(query, craft) => {
              const near = craft.lat != null && craft.lon != null ? nearestAirport(craft.lat, craft.lon)?.iata ?? null : null
              commit(watchFlight(query, near))
            }}
            onNear={(iata) => commit(watchAirport(iata))}
          />
        ) : null}
        {workspace.mode === "chart" ? (
          <Suspense fallback={null}>
            <RouteStudio scenes={scenes} active={known >= 0 ? known : 0} initialCustom={custom} onPair={(from, to) => commit(chartPair(from, to))} />
          </Suspense>
        ) : null}
        {workspace.mode === "book" ? (
          <Suspense fallback={null}>
            {subject.kind === "airport" ? (
              <p className="live-note">
                <a href={`/book/airports/${subject.iata}`}>{subject.iata} {cityOf(subject.iata)}</a>
              </p>
            ) : null}
            <BookSearch initialQuery="" initial={{ airports: searchAirports(""), airlines: searchAirlines(""), types: [] }} />
          </Suspense>
        ) : null}
      </div>
    </div>
  )
}
