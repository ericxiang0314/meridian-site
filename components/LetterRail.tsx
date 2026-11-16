import Link from "next/link"

export function LetterRail({
  base,
  counts,
  current,
}: {
  base: string
  counts: Record<string, number>
  current?: string
}) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0".split("")
  return (
    <nav className="letters" aria-label="Letters">
      {letters.map((letter) => {
        const count = counts[letter] ?? 0
        const on = current === letter
        if (count === 0) return <span key={letter} className="letter empty">{letter}</span>
        return (
          <Link key={letter} href={`${base}/${letter}`} aria-current={on ? "page" : undefined} className="letter">
            {letter}
            <small>{count}</small>
          </Link>
        )
      })}
    </nav>
  )
}
