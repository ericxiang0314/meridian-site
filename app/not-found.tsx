import Link from "next/link"
import { PageHead } from "@/components/PageHead"

export default function NotFound() {
  return (
    <>
      <PageHead title="Meridian" />
      <section className="miss">
        <h1>That code is not in the book.</h1>
        <Link className="action" href="/book">Search the book</Link>
      </section>
    </>
  )
}
