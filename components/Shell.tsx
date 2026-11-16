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
        <p>Barcelona by Mike McBey, CC BY 2.0. Haneda by contri, CC BY-SA 2.0. Boston by 4300streetcar, CC BY 4.0. Dulles by Joe Ravi, CC BY-SA 3.0. Narita by Nanashinodensyaku, CC BY-SA 4.0. Sumburgh by Ronnie Robertson, CC BY-SA 2.0. Via Wikimedia Commons.</p>
      </footer>
    </>
  )
}
