"use client"

import { useEffect, useRef, type ReactNode } from "react"

export function StickyCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const onScroll = () => {
      const travel = Math.min(1, window.scrollY / 640)
      node.style.transform = `scale(${1 - travel * 0.38})`
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <div className="card-pin" ref={ref}>
      {children}
    </div>
  )
}
