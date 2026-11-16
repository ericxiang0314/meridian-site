"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function Missing() {
  const [code, setCode] = useState<string | null>(null)
  useEffect(() => {
    const segment = window.location.pathname.split("/").filter(Boolean).pop() ?? ""
    if (/^[A-Za-z0-9]{2,8}$/.test(segment)) setCode(segment.toUpperCase())
  }, [])
  return (
    <section className="sheet miss">
      <h1>{code ? `${code} is not in the book` : "That page is not on this site"}</h1>
      <p>{code ? "The book has no airport, airline, airframe, or field under that code." : "The address does not match a chart, a book, a field, or the desk."}</p>
      <p>
        <Link className="action" href="/book">Search the book</Link>
        {" "}
        <Link className="action" href="/">Back to the front</Link>
      </p>
    </section>
  )
}
