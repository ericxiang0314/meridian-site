import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BandView } from "@/components/BandView"
import { bands, type Band } from "@/lib/atlas"

type Params = { params: Promise<{ band: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return bands.map((band) => ({ band }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: `${(await params).band} airports` }
}

export default async function BandPage({ params }: Params) {
  const band = (await params).band as Band
  if (!bands.includes(band)) notFound()
  return <BandView band={band} page={1} />
}
