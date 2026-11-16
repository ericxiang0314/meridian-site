import { searchAirlines, searchAirports, searchTypes } from "@/lib/db"

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? ""
  return Response.json({
    airports: searchAirports(q),
    airlines: searchAirlines(q),
    types: searchTypes(q),
  })
}
