import Link from 'next/link'
import Gallery from '../components/Gallery'

export default function Home() {
  const sample = [
    { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', alt: 'Sample' },
  ]
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Holiday Let — Starter Site</h1>
      <p className="mb-4">A starter booking site with gallery, availability check, Stripe checkout, and iCal feed.</p>
      <section className="mb-6">
        <h2 className="text-2xl">Gallery</h2>
        <Gallery images={sample} />
        <Link href="/gallery"><a className="inline-block mt-3 text-blue-600">View gallery</a></Link>
      </section>

      <section>
        <h2 className="text-2xl">Book</h2>
        <p className="mb-2">Check availability and make a booking.</p>
        <Link href="/booking"><a className="inline-block px-4 py-2 bg-blue-600 text-white rounded">Book now</a></Link>
      </section>
    </main>
  )
}
