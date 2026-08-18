import { GetServerSideProps } from 'next'
import prisma from '../../lib/prisma'

export default function BookingSuccess({ booking }: { booking: any }) {
  if (!booking) return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Booking status</h1>
      <p>Booking not found.</p>
    </main>
  )

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Booking {booking.id} — {booking.status}</h1>
      <p><strong>Guest:</strong> {booking.guestName} ({booking.guestEmail})</p>
      <p><strong>Dates:</strong> {new Date(booking.startDate).toDateString()} — {new Date(booking.endDate).toDateString()}</p>
      <p><strong>Amount:</strong> {(booking.totalAmount/100).toFixed(2)} {booking.currency.toUpperCase()}</p>
      <p className="mt-4">If the booking is still PENDING it will be marked CONFIRMED after payment is received (Stripe webhook).</p>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionId = context.query.session_id as string | undefined
  if (!sessionId) return { props: { booking: null } }
  const booking = await prisma.booking.findUnique({ where: { stripeSessionId: sessionId } })
  if (!booking) return { props: { booking: null } }
  return { props: { booking: JSON.parse(JSON.stringify(booking)) } }
}
