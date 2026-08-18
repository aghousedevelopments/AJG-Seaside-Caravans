import { useState } from 'react'

export default function BookingForm({ propertyId = 1 }: { propertyId?: number }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget) as any)
    const res = await fetch('/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const json = await res.json()
    setLoading(false)
    if (json.url) window.location.href = json.url
    else setMessage(json.error || 'Error')
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="hidden" name="propertyId" value={propertyId} />
      <div>
        <label>Start <input name="startDate" type="date" required className="border p-2 w-full" /></label>
      </div>
      <div>
        <label>End <input name="endDate" type="date" required className="border p-2 w-full" /></label>
      </div>
      <div>
        <label>Name <input name="guestName" required className="border p-2 w-full" /></label>
      </div>
      <div>
        <label>Email <input name="guestEmail" type="email" required className="border p-2 w-full" /></label>
      </div>
      <div>
        <label>Amount (cents) <input name="totalAmount" defaultValue="10000" className="border p-2 w-full" /></label>
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Processing...' : 'Pay & Book'}</button>
      {message && <p className="text-red-600">{message}</p>}
    </form>
  )
}
