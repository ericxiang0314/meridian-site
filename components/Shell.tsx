"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/sky", label: "Track", icon: "track" },
  { href: "/chart", label: "Chart", icon: "chart" },
  { href: "/book", label: "Book", icon: "book" },
  { href: "/fields", label: "Fields", icon: "field" },
] as const

function Icon({ name }: { name: "chart" | "book" | "field" | "desk" | "track" }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true as const }
  if (name === "track") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 1.5v2.2M8 12.3v2.2M1.5 8h2.2M12.3 8h2.2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    )
  }
  if (name === "chart") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.4 8h11.2M8 1.8c1.6 1.8 2.4 3.8 2.4 6.2S9.6 12.4 8 14.2C6.4 12.4 5.6 10.4 5.6 8S6.4 3.6 8 1.8Z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    )
  }
  if (name === "book") {
    return (
      <svg {...common}>
        <path d="M3 2.5h4.2c.7.8 1.2 1.8 1.2 2.8V13c0-1-.5-2-1.2-2.8H3V2.5Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M13 2.5H8.8C8.1 3.3 7.6 4.3 7.6 5.3V13c0-1 .5-2 1.2-2.8H13V2.5Z" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    )
  }
  if (name === "field") {
    return (
      <svg {...common}>
        <path d="M2 12.5 8 3.2l6 9.3H2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 7.2v3.2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="2.2" y="3" width="11.6" height="9.2" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.2 6h11.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

const footerLinks = [
  { href: "/sky", label: "Track" },
  { href: "/chart", label: "Chart" },
  { href: "/book", label: "Book" },
  { href: "/book/airports", label: "Airports" },
  { href: "/book/airlines", label: "Airlines" },
  { href: "/book/types", label: "Airframes" },
  { href: "/fields", label: "Fields" },
  { href: "/desk", label: "The desk" },
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
            const on = path.startsWith(link.href)
            return (
              <Link key={link.href} href={link.href} aria-current={on ? "page" : undefined}>
                <Icon name={link.icon} />
                {link.label}
              </Link>
            )
          })}
          <Link href="/desk" className="nav-cta" aria-current={path.startsWith("/desk") ? "page" : undefined}>
            <Icon name="desk" />
            The desk
          </Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="colophon">
        <nav aria-label="Footer">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
        <p>Barcelona by Mike McBey, CC BY 2.0. Haneda by contri, CC BY-SA 2.0. Boston by 4300streetcar, CC BY 4.0. Dulles by Joe Ravi, CC BY-SA 3.0. Narita by Nanashinodensyaku, CC BY-SA 4.0. Sumburgh by Ronnie Robertson, CC BY-SA 2.0. Via Wikimedia Commons.</p>
      </footer>
    </>
  )
}
