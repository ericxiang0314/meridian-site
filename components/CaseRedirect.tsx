"use client"

import { useEffect } from "react"

export function CaseRedirect() {
  useEffect(() => {
    const match = window.location.pathname.match(/^(.*)\/(book\/airports|book\/airlines|book\/types|fields)\/([^/]+)\/?$/)
    if (!match) return
    const code = match[3]
    const upper = code.toUpperCase()
    if (code === upper) return
    const next = `${match[1]}/${match[2]}/${upper}/`
    window.location.replace(next + window.location.search)
  }, [])
  return null
}
