import Link from "next/link"

export type Scene = {
  from: string
  to: string
  fromCity: string
  toCity: string
  fromLat: number
  fromLon: number
  toLat: number
  toLon: number
  nm: number
  bearing: number
}

function project(lat: number, lon: number, w: number, h: number) {
  return { x: ((lon + 180) / 360) * w, y: ((90 - lat) / 180) * h }
}

function Chart({ scene }: { scene: Scene }) {
  const w = 860
  const h = 480
  const a = project(scene.fromLat, scene.fromLon, w, h)
  const b = project(scene.toLat, scene.toLon, w, h)
  const wrap = Math.abs(a.x - b.x) > w / 2
  const midX = (a.x + b.x) / 2
  const midY = Math.min(a.y, b.y) - 48
  return (
    <svg className="scene-chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${scene.from} to ${scene.to}`}>
      <rect width={w} height={h} fill="#202429" />
      {[80, 160, 240, 320, 400].map((y) => (
        <line key={y} x1="0" x2={w} y1={y} y2={y} stroke="#2c363c" strokeWidth="1" />
      ))}
      {wrap ? null : <path d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`} fill="none" stroke="#e2a23a" strokeWidth="3" />}
      <circle cx={a.x} cy={a.y} r="6" fill="#f4f1ea" />
      <circle cx={b.x} cy={b.y} r="6" fill="#7ec8c3" />
      <text x="28" y="54" fill="#f4f1ea" fontSize="28">{scene.from}</text>
      <text x="28" y="84" fill="#9eacb3" fontSize="16">{scene.fromCity}</text>
      <text x={w - 28} y="54" fill="#7ec8c3" fontSize="28" textAnchor="end">{scene.to}</text>
      <text x={w - 28} y="84" fill="#9eacb3" fontSize="16" textAnchor="end">{scene.toCity}</text>
    </svg>
  )
}

export function Stage({ scenes, active }: { scenes: Scene[]; active: number }) {
  const scene = scenes[active] ?? scenes[0]
  const now = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date())
  if (!scene) return null
  const hours = Math.round((scene.nm / 480) * 10) / 10
  return (
    <section className="stage">
      <div className="desktop">
        <div className="menubar">
          <span>Meridian</span>
          <span>Chart</span>
          <span>Sky</span>
          <span>Book</span>
          <span className="menu-clock">{now}</span>
        </div>
        <Chart scene={scene} />
        <div className="dock" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <aside className="scene-side">
        <div className="film" role="listbox" aria-label="Routes">
          {scenes.map((item, i) => (
            <Link
              key={`${item.from}${item.to}`}
              href={`/?route=${item.from}-${item.to}`}
              role="option"
              aria-selected={i === active}
            >
              <b>{item.from}</b>
              <b>{item.to}</b>
            </Link>
          ))}
        </div>
        <h2>
          {scene.fromCity}
          <br />
          {scene.toCity}
        </h2>
        <p className="scene-by">{scene.from} to {scene.to}</p>
        <p className="scene-kind">Great-circle track</p>
        <p className="scene-note">
          {scene.nm.toLocaleString("en-US")} nm · {scene.bearing}° · about {hours} h at 480 kt. Not a filed route.
        </p>
      </aside>
    </section>
  )
}
