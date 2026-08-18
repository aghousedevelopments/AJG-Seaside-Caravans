import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { buffer } from 'micro'

export const config = { api: { bodyParser: false } }

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature'] as string | undefined
  const buf = await buffer(req)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig ?? '', process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId
    if (bookingId) {
      await prisma.booking.update({ where: { id: Number(bookingId) }, data: { status: 'CONFIRMED' } })
      // TODO: send confirmation email using SendGrid
    }
  }

  res.json({ received: true })
}
