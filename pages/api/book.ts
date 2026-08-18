import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { propertyId, startDate, endDate, guestName, guestEmail, totalAmount, currency = 'usd' } = req.body
  if (!propertyId || !startDate || !endDate || !guestName || !guestEmail || !totalAmount) {
    return res.status(400).json({ error: 'missing fields' })
  }

  const s = new Date(startDate)
  const e = new Date(endDate)

  // check for conflicts
  const conflict = await prisma.booking.findFirst({
    where: {
      propertyId: Number(propertyId),
      status: 'CONFIRMED',
      AND: [{ startDate: { lt: e } }, { endDate: { gt: s } }]
    }
  })
  if (conflict) return res.status(409).json({ error: 'not available' })

  const booking = await prisma.booking.create({
    data: {
      propertyId: Number(propertyId),
      startDate: s,
      endDate: e,
      guestName,
      guestEmail,
      totalAmount: Number(totalAmount),
      currency,
      status: 'PENDING'
    }
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency,
        product_data: { name: `Booking ${booking.id}` },
        unit_amount: Number(totalAmount)
      },
      quantity: 1
    }],
    customer_email: guestEmail,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/cancel`,
    metadata: { bookingId: String(booking.id) }
  })

  await prisma.booking.update({ where: { id: booking.id }, data: { stripeSessionId: session.id } })

  res.json({ url: session.url })
}
