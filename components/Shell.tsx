"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Design" },
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
          <a className="download" href="https://github.com/ericxiang0314/meridian-site">GitHub</a>
        </nav>
      </header>
      <main>{children}</main>
    </>
  )
}
