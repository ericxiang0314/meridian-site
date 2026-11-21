export type DeskMode = "watch" | "chart" | "book"

export type Subject =
  | { kind: "none" }
  | { kind: "flight"; query: string; near?: string }
  | { kind: "airport"; iata: string }
  | { kind: "pair"; from: string; to: string }

export type Workspace = { mode: DeskMode; subject: Subject }

export const emptyWorkspace: Workspace = { mode: "watch", subject: { kind: "none" } }

export function watchFlight(query: string, near?: string | null): Workspace {
  return { mode: "watch", subject: { kind: "flight", query, ...(near ? { near } : {}) } }
}

export function watchAirport(iata: string): Workspace {
  return { mode: "watch", subject: { kind: "airport", iata } }
}

export function chartPair(from: string, to: string): Workspace {
  return { mode: "chart", subject: { kind: "pair", from, to } }
}

export function openBook(iata: string): Workspace {
  return { mode: "book", subject: { kind: "airport", iata } }
}

export function switchMode(workspace: Workspace, mode: DeskMode): Workspace {
  return { ...workspace, mode }
}

export function workspaceFromParams(params: URLSearchParams): Workspace | null {
  const modeParam = params.get("mode")
  const airport = (params.get("airport") ?? "").toUpperCase()
  const query = params.get("q") ?? ""
  const from = (params.get("from") ?? "").toUpperCase()
  const to = (params.get("to") ?? "").toUpperCase()
  if (!modeParam && !airport && !query && !from) return null
  const mode: DeskMode = modeParam === "chart" || modeParam === "book" || modeParam === "watch" ? modeParam : "watch"
  if (from && to && mode !== "book") return { mode: modeParam ? mode : "chart", subject: { kind: "pair", from, to } }
  if (airport) return { mode, subject: { kind: "airport", iata: airport } }
  if (query) return { mode: "watch", subject: { kind: "flight", query } }
  return { mode, subject: { kind: "none" } }
}

export function workspaceSearch(workspace: Workspace): string {
  const params = new URLSearchParams()
  params.set("mode", workspace.mode)
  const subject = workspace.subject
  if (subject.kind === "flight") params.set("q", subject.query)
  if (subject.kind === "airport") params.set("airport", subject.iata)
  if (subject.kind === "pair") {
    params.set("from", subject.from)
    params.set("to", subject.to)
  }
  return params.toString()
}

export function subjectLine(workspace: Workspace, city: (iata: string) => string): string {
  const subject = workspace.subject
  if (subject.kind === "none") return "Nothing is held. Watch a flight, or open an airport."
  if (subject.kind === "flight") {
    const near = subject.near ? ` Nearest field ${subject.near}, ${city(subject.near)}.` : ""
    return `Holding flight ${subject.query}.${near}`
  }
  if (subject.kind === "airport") return `Holding ${subject.iata}, ${city(subject.iata)}.`
  return `Holding ${subject.from} to ${subject.to}.`
}
