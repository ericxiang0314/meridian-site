import type { Metadata } from "next"
import { Newsreader, Source_Sans_3 } from "next/font/google"
import { Shell } from "@/components/Shell"
import "./globals.css"

const display = Newsreader({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600"] })
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600"] })

export const metadata: Metadata = {
  title: { default: "Meridian", template: "%s · Meridian" },
  description: "A night flight desk, and the atlas of airports, airlines, and public fields it belongs to.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
