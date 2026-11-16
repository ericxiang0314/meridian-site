import { airportByIata } from "@/lib/db"
import { haversineNm, initialBearing } from "@/lib/geo"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const from = airportByIata(url.searchParams.get("from") ?? "")
  const to = airportByIata(url.searchParams.get("to") ?? "")
  if (!from || !to) return Response.json({ error: "Those codes are not in the book." }, { status: 404 })
  return Response.json({
    from: from.iata,
    to: to.iata,
    fromCity: from.city || from.name,
    toCity: to.city || to.name,
    fromLat: from.lat,
    fromLon: from.lon,
    toLat: to.lat,
    toLon: to.lon,
    nm: haversineNm(from, to),
    bearing: initialBearing(from, to),
  })
}
