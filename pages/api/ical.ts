import type { NextApiRequest, NextApiResponse } from 'next'
import ical from 'ical-generator'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { propertyId } = req.query
  if (!propertyId) return res.status(400).send('missing propertyId')
  const bookings = await prisma.booking.findMany({ where: { propertyId: Number(propertyId), status: 'CONFIRMED' } })
  const cal = ical({ domain: (process.env.NEXT_PUBLIC_SITE_URL || 'localhost').replace(/^https?:\/\//, '') })
  bookings.forEach(b => {
    cal.createEvent({ start: b.startDate, end: b.endDate, summary: `Booked: ${b.guestName}`, description: `Booking ${b.id}` })
  })
  res.setHeader('Content-Type', 'text/calendar')
  res.send(cal.toString())
}
