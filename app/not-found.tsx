import Link from "next/link"

export default function NotFound() {
  return (
    <>
      <section className="miss">
        <h1>That code is not in the book.</h1>
        <Link className="action" href="/book">Search the book</Link>
      </section>
    </>
  )
}
