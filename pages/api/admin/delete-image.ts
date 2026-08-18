import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { deleteLocalFileIfExists } from '../../../lib/imageStorage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Basic auth protection
  const auth = req.headers.authorization
  const adminPass = process.env.ADMIN_PASSWORD || ''
  const expected = 'Basic ' + Buffer.from(`admin:${adminPass}`).toString('base64')
  if (!auth || auth !== expected) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"')
    return res.status(401).json({ error: 'unauthorized' })
  }

  if (req.method !== 'POST') return res.status(405).end()
  const { id } = req.body
  if (!id) return res.status(400).json({ error: 'missing id' })

  const img = await prisma.image.findUnique({ where: { id: Number(id) } })
  if (!img) return res.status(404).json({ error: 'not found' })

  // delete local file if applicable
  await deleteLocalFileIfExists(img.url)
  await prisma.image.delete({ where: { id: Number(id) } })
  return res.json({ ok: true })
}
