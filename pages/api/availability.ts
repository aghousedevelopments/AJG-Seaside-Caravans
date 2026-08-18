import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { propertyId, start, end } = req.query
  if (!propertyId || !start || !end) return res.status(400).json({ error: 'missing' })
  const s = new Date(String(start))
  const e = new Date(String(end))
  const conflicting = await prisma.booking.findFirst({
    where: {
      propertyId: Number(propertyId),
      status: 'CONFIRMED',
      AND: [
        { startDate: { lt: e } },
        { endDate: { gt: s } }
      ]
    }
  })
  res.json({ available: conflicting ? false : true })
}
