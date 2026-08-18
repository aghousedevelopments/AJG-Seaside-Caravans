import { useState } from 'react'

export default function BookingPage() {
  const [status, setStatus] = useState<string | null>(null)

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Make a booking</h1>
      <p className="mb-4">Pick dates, enter your details and you'll be redirected to Stripe Checkout.</p>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const data = Object.fromEntries(new FormData(form) as any);
        setStatus('Creating checkout...');
        const res = await fetch('/api/book', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
        const json = await res.json();
        if (json.url) {
          window.location.href = json.url;
        } else {
          setStatus(json.error || 'Error');
        }
      }}>
        <label className="block mb-2">Property ID (example): <input name="propertyId" defaultValue="1" className="border p-2 w-full" /></label>
        <label className="block mb-2">Start date: <input name="startDate" type="date" className="border p-2 w-full" /></label>
        <label className="block mb-2">End date: <input name="endDate" type="date" className="border p-2 w-full" /></label>
        <label className="block mb-2">Your name: <input name="guestName" className="border p-2 w-full" /></label>
        <label className="block mb-2">Email: <input name="guestEmail" type="email" className="border p-2 w-full" /></label>
        <label className="block mb-4">Amount (in cents): <input name="totalAmount" defaultValue="10000" className="border p-2 w-full" /></label>
        <button className="px-4 py-2 bg-green-600 text-white rounded">Pay & Book</button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </main>
  )
}
