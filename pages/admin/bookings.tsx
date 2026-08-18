import { GetServerSideProps } from 'next'
import prisma from '../../lib/prisma'

export default function AdminBookings({ bookings, unauthorized }: { bookings: any[]; unauthorized?: boolean }) {
  if (unauthorized) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin — Bookings</h1>
        <p>Unauthorized. Provide HTTP Basic auth with username "admin" and the ADMIN_PASSWORD from your environment.</p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Bookings</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Property</th>
            <th className="border p-2 text-left">Guest</th>
            <th className="border p-2 text-left">Dates</th>
            <th className="border p-2 text-left">Amount</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td className="border p-2">{b.id}</td>
              <td className="border p-2">{b.property?.name || b.propertyId}</td>
              <td className="border p-2">{b.guestName} <br/><small>{b.guestEmail}</small></td>
              <td className="border p-2">{new Date(b.startDate).toDateString()} — {new Date(b.endDate).toDateString()}</td>
              <td className="border p-2">{(b.totalAmount/100).toFixed(2)} {b.currency.toUpperCase()}</td>
              <td className="border p-2">{b.status}</td>
              <td className="border p-2">
                <form method="post" action="/api/admin/update-booking" style={{ display: 'inline' }}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="status" value="CONFIRMED" />
                  <button className="mr-2 px-2 py-1 bg-green-600 text-white rounded">Confirm</button>
                </form>
                <form method="post" action="/api/admin/update-booking" style={{ display: 'inline' }}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="status" value="CANCELLED" />
                  <button className="px-2 py-1 bg-red-600 text-white rounded">Cancel</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const auth = context.req.headers.authorization
  const adminPass = process.env.ADMIN_PASSWORD || ''
  const expected = 'Basic ' + Buffer.from(`admin:${adminPass}`).toString('base64')
  if (!auth || auth !== expected) {
    // ask for basic auth
    context.res.statusCode = 401
    context.res.setHeader('WWW-Authenticate', 'Basic realm="Admin"')
    return { props: { bookings: [], unauthorized: true } }
  }

  const bookings = await prisma.booking.findMany({ include: { property: true }, orderBy: { createdAt: 'desc' } })
  return { props: { bookings: JSON.parse(JSON.stringify(bookings)) } }
}
