export type LatLon = { lat: number; lon: number }

function toVector(point: LatLon): [number, number, number] {
  const lat = (point.lat * Math.PI) / 180
  const lon = (point.lon * Math.PI) / 180
  return [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)]
}

function fromVector(vector: [number, number, number]): LatLon {
  const lat = (Math.atan2(vector[2], Math.hypot(vector[0], vector[1])) * 180) / Math.PI
  const lon = (Math.atan2(vector[1], vector[0]) * 180) / Math.PI
  return { lat, lon }
}

export function pointAlong(from: LatLon, to: LatLon, t: number): LatLon {
  const start = toVector(from)
  const end = toVector(to)
  const dot = Math.min(1, Math.max(-1, start[0] * end[0] + start[1] * end[1] + start[2] * end[2]))
  const omega = Math.acos(dot)
  if (omega < 1e-6) return { lat: from.lat, lon: from.lon }
  const sin = Math.sin(omega)
  const a = Math.sin((1 - t) * omega) / sin
  const b = Math.sin(t * omega) / sin
  return fromVector([
    start[0] * a + end[0] * b,
    start[1] * a + end[1] * b,
    start[2] * a + end[2] * b,
  ])
}

export function trackPoints(from: LatLon, to: LatLon, count = 160): LatLon[] {
  return Array.from({ length: count }, (_, index) => pointAlong(from, to, index / (count - 1)))
}

export function formatPosition(point: LatLon): string {
  const north = point.lat >= 0 ? "N" : "S"
  const east = point.lon >= 0 ? "E" : "W"
  return `${Math.abs(point.lat).toFixed(2)}° ${north}  ${Math.abs(point.lon).toFixed(2)}° ${east}`
}

export function formatDuration(hours: number): string {
  const minutes = Math.max(0, Math.round(hours * 60))
  const whole = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (whole === 0) return `${rest} min`
  return `${whole} h ${rest.toString().padStart(2, "0")} min`
}
