import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BandView, bandPageSize } from "@/components/BandView"
import { airportsInBand, bands, type Band } from "@/lib/atlas"

type Params = { params: Promise<{ band: string; page: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return bands.flatMap((band) => {
    const pages = Math.ceil(airportsInBand(band).length / bandPageSize)
    return Array.from({ length: Math.max(0, pages - 1) }, (_, index) => ({ band, page: String(index + 2) }))
  })
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { band, page } = await params
  return { title: `${band} airports, page ${page}` }
}

export default async function BandNumberPage({ params }: Params) {
  const { band, page } = await params
  const number = Number(page)
  if (!bands.includes(band as Band) || !Number.isInteger(number) || number < 2) notFound()
  return <BandView band={band as Band} page={number} />
}
