import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Protect with basic auth header same as admin page
  const auth = req.headers.authorization
  const adminPass = process.env.ADMIN_PASSWORD || ''
  const expected = 'Basic ' + Buffer.from(`admin:${adminPass}`).toString('base64')
  if (!auth || auth !== expected) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"')
    return res.status(401).json({ error: 'unauthorized' })
  }

  if (req.method !== 'POST') return res.status(405).end()
  const { id, status } = req.body
  if (!id || !status) return res.status(400).json({ error: 'missing' })
  const allowed = ['PENDING', 'CONFIRMED', 'CANCELLED']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid status' })

  const updated = await prisma.booking.update({ where: { id: Number(id) }, data: { status } })
  res.json({ booking: updated })
}
