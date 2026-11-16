import { project } from "@/lib/geo"
import type { Airport } from "@/lib/db"

export function Strip({
  flight,
  airline,
  from,
  to,
  nm,
}: {
  flight: string
  airline: string
  from: string
  to: string
  nm: number
}) {
  return (
    <article className="strip-ui" data-ui="strip">
      <div className="strip-top">
        <p className="strip-flight">{flight}</p>
        <p>{airline}</p>
      </div>
      <div className="strip-route">
        <strong>{from}</strong>
        <span>{nm.toLocaleString("en-US")} nm</span>
        <strong>{to}</strong>
      </div>
      <div className="track" aria-hidden="true">
        <span />
      </div>
      <div className="meta-row">
        <span>Airborne</span>
        <span className="amber">Height and speed, when the feed has them</span>
      </div>
    </article>
  )
}

export function Rose({ bearing }: { bearing: number }) {
  const rad = ((bearing - 90) * Math.PI) / 180
  const x = 90 + Math.cos(rad) * 58
  const y = 90 + Math.sin(rad) * 58
  return (
    <svg className="rose" viewBox="0 0 180 180" role="img" aria-label={`Initial bearing ${bearing} degrees`} data-ui="rose">
      <circle cx="90" cy="90" r="78" fill="none" stroke="#161b20" strokeWidth="6" />
      <circle cx="90" cy="90" r="4" fill="#e2a23a" />
      <line x1="90" y1="90" x2={x} y2={y} stroke="#e2a23a" strokeWidth="6" />
      <text x="84" y="22">N</text>
      <text x="158" y="96">E</text>
      <text x="84" y="170">S</text>
      <text x="10" y="96">W</text>
    </svg>
  )
}

export function PairChart({ from, to }: { from: Airport; to: Airport }) {
  const w = 640
  const h = 280
  const a = project(from.lat, from.lon, w, h)
  const b = project(to.lat, to.lon, w, h)
  const wrap = Math.abs(a.x - b.x) > w / 2
  const midX = wrap ? (a.x + b.x + w) / 2 % w : (a.x + b.x) / 2
  const midY = Math.min(a.y, b.y) - 36
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${from.iata} to ${to.iata}`} data-ui="chart">
      <rect width={w} height={h} fill="#101820" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2={w} y1={40 + i * 60} y2={40 + i * 60} stroke="#24303a" strokeWidth="4" />
      ))}
      {wrap ? null : (
        <path d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`} fill="none" stroke="#e2a23a" strokeWidth="4" />
      )}
      <circle cx={a.x} cy={a.y} r="6" fill="#f3efe6" />
      <circle cx={b.x} cy={b.y} r="6" fill="#7ec8c3" />
      <text x={a.x + 10} y={a.y - 8} fill="#f3efe6" fontSize="16">{from.iata}</text>
      <text x={b.x + 10} y={b.y - 8} fill="#7ec8c3" fontSize="16">{to.iata}</text>
    </svg>
  )
}
