import type { Metadata } from "next"
import { Schibsted_Grotesk, Source_Sans_3 } from "next/font/google"
import { Shell } from "@/components/Shell"
import "./globals.css"

const display = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] })
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600"] })

export const metadata: Metadata = {
  title: { default: "Meridian", template: "%s · Meridian" },
  description: "A night flight desk for the Mac, and the book of airports, airlines, and public fields it belongs to.",
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
