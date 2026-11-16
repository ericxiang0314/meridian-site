import type { Metadata } from "next"
import { Newsreader, Source_Sans_3 } from "next/font/google"
import { CaseRedirect } from "@/components/CaseRedirect"
import { Shell } from "@/components/Shell"
import "./globals.css"

const display = Newsreader({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600"] })
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600"] })

const site = "https://ericxiang0314.github.io/meridian-site"

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Meridian", template: "%s · Meridian" },
  description: "A Mac flight desk and the reference book beside it. The chart on this site is a great-circle example, not live traffic.",
  openGraph: {
    title: "Meridian",
    description: "A Mac flight desk and the reference book beside it. The chart on this site is a great-circle example, not live traffic.",
    images: [{ url: `${site}/atlas/barcelona-night.jpg`, width: 2800, height: 1570, alt: "Barcelona airport at night" }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <CaseRedirect />
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
