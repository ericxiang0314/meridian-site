import Link from "next/link"

export function PageHead({ title }: { title: string }) {
  return (
    <header className="page-head">
      <Link href="/">{title}</Link>
      <nav>
        <Link href="/book">Book</Link>
        <Link href="/fields">Fields</Link>
        <Link href="/desk">Desk</Link>
      </nav>
    </header>
  )
}
