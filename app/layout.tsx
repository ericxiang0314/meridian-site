import type { Metadata } from "next"
import { Inter, Newsreader } from "next/font/google"
import "./globals.css"

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600"] })
const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", style: ["normal", "italic"], weight: ["400", "600"] })

export const metadata: Metadata = {
  title: { default: "Meridian", template: "%s · Meridian" },
  description: "The night desk Meridian belongs to. A book of airports, airlines, and the fields you can stand beside.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
