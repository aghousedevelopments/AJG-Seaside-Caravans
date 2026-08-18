import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import prisma from '../../lib/prisma'
import { buffer } from 'micro'
import sendEmail from '../../lib/sendEmail'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature'] as string | undefined
  const buf = await buffer(req)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig ?? '', process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err: any) {
    console.error('Webhook signature error', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId
    if (bookingId) {
      const bookingIdNum = Number(bookingId)
      await prisma.booking.update({ where: { id: bookingIdNum }, data: { status: 'CONFIRMED' } })
      // fetch booking to include details
      const booking = await prisma.booking.findUnique({ where: { id: bookingIdNum }, include: { property: true } })
      if (booking) {
        // send confirmation email to guest
        try {
          await sendEmail({
            to: booking.guestEmail,
            subject: `Booking confirmed — ${booking.property?.name ?? 'Property'}`,
            text: `Hi ${booking.guestName},\n\nYour booking (${booking.id}) for ${new Date(booking.startDate).toDateString()} to ${new Date(booking.endDate).toDateString()} has been confirmed.\n\nThank you.`,
            html: `<p>Hi ${booking.guestName},</p><p>Your booking (${booking.id}) for <strong>${booking.property?.name ?? 'the property'}</strong> from <strong>${new Date(booking.startDate).toDateString()}</strong> to <strong>${new Date(booking.endDate).toDateString()}</strong> has been confirmed.</p><p>Thanks.</p>`
          })
        } catch (err) {
          console.error('Error sending confirmation email', err)
        }
      }
    }
  }

  res.json({ received: true })
}
