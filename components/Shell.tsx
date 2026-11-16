"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Atlas" },
  { href: "/chart", label: "Chart" },
  { href: "/book", label: "Book" },
  { href: "/fields", label: "Fields" },
  { href: "/desk", label: "Desk" },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <>
      <header className="topnav">
        <Link href="/" className="marklink">
          <span className="markbox" aria-hidden="true">M</span>
          Meridian
        </Link>
        <nav>
          {links.map((link) => {
            const on = link.href === "/" ? path === "/" : path.startsWith(link.href)
            return (
              <Link key={link.href} href={link.href} aria-current={on ? "page" : undefined}>
                {link.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="colophon">
        <p>Narita apron by Nanashinodensyaku. Edinburgh apron by M J Richardson. Malmö by Niklas Morberg. Sumburgh by Ronnie Robertson. All CC BY-SA, via Wikimedia Commons.</p>
      </footer>
    </>
  )
}
