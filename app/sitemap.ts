import type { MetadataRoute } from "next"
import { atlasAirlines, atlasAirports, atlasTypes, bands, letters } from "@/lib/atlas"
import { allFields } from "@/lib/db"

export const dynamic = "force-static"

const base = "https://ericxiang0314.github.io/meridian-site"

function url(path: string) {
  return `${base}${path === "/" ? "/" : `${path}/`}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/sky",
    "/chart",
    "/book",
    "/book/airports",
    "/book/airlines",
    "/book/types",
    "/fields",
    "/desk",
    ...letters.map((letter) => `/book/airports/letter/${letter}`),
    ...letters.map((letter) => `/book/airlines/letter/${letter}`),
    ...bands.map((band) => `/book/airports/band/${band}`),
    ...atlasAirports.map((row) => `/book/airports/${row.iata}`),
    ...atlasAirlines.map((row) => `/book/airlines/${row.iata}`),
    ...atlasTypes.map((row) => `/book/types/${row.code}`),
    ...allFields().map((field) => `/fields/${field.iata}`),
  ]
  return paths.map((path) => ({ url: url(path) }))
}
