import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { saveImage, deleteLocalFileIfExists } from '../../../lib/imageStorage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Basic auth protection
  const auth = req.headers.authorization
  const adminPass = process.env.ADMIN_PASSWORD || ''
  const expected = 'Basic ' + Buffer.from(`admin:${adminPass}`).toString('base64')
  if (!auth || auth !== expected) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"')
    return res.status(401).json({ error: 'unauthorized' })
  }

  if (req.method === 'GET') {
    const propertyId = Number(req.query.propertyId || 1)
    const images = await prisma.image.findMany({ where: { propertyId }, orderBy: { order: 'asc' } })
    return res.json({ images })
  }

  if (req.method === 'POST') {
    try {
      const { propertyId, filename, dataUrl, alt, order } = req.body
      if (!propertyId || !filename || !dataUrl) return res.status(400).json({ error: 'missing' })
      const url = await saveImage({ dataUrl, filename })
      const img = await prisma.image.create({ data: { propertyId: Number(propertyId), url, alt: alt || null, order: Number(order) || 0 } })
      return res.json({ image: img })
    } catch (err: any) {
      console.error('upload error', err)
      return res.status(500).json({ error: err.message || 'upload failed' })
    }
  }

  return res.status(405).end()
}
