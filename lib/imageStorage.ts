import fs from 'fs'
import path from 'path'
import cloudinary from 'cloudinary'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUD_KEY = process.env.CLOUDINARY_API_KEY
const CLOUD_SECRET = process.env.CLOUDINARY_API_SECRET

let cloudinaryConfigured = false
if (CLOUD_NAME && CLOUD_KEY && CLOUD_SECRET) {
  cloudinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_KEY,
    api_secret: CLOUD_SECRET,
  })
  cloudinaryConfigured = true
}

export async function saveImage({ dataUrl, filename }: { dataUrl: string; filename: string }) {
  // dataUrl may be like "data:image/jpeg;base64,/9j/..." or raw base64
  const isDataUrl = dataUrl.startsWith('data:')
  let base64: string
  let mime = 'application/octet-stream'
  if (isDataUrl) {
    const match = dataUrl.match(/^data:(.+);base64,(.*)$/)
    if (!match) throw new Error('Invalid data URL')
    mime = match[1]
    base64 = match[2]
  } else {
    base64 = dataUrl
  }

  if (cloudinaryConfigured) {
    // upload to cloudinary using data URI
    const uploadResult = await cloudinary.v2.uploader.upload(`data:${mime};base64,${base64}`, {
      folder: 'holiday-let',
      use_filename: true,
      unique_filename: true,
      resource_type: 'image'
    })
    return uploadResult.secure_url as string
  }

  // fallback: write to /public/uploads
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  // ensure unique filename
  const ext = path.extname(filename) || (mime === 'image/png' ? '.png' : '.jpg')
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`
  const filePath = path.join(uploadsDir, safeName)
  const buffer = Buffer.from(base64, 'base64')
  fs.writeFileSync(filePath, buffer)

  // serve via /uploads/<name>
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''}/uploads/${safeName}`
  return publicUrl
}

export async function deleteLocalFileIfExists(url: string) {
  try {
    if (!url) return
    // only delete if it's a local uploads URL we control
    const uploadsPath = '/uploads/'
    const idx = url.indexOf(uploadsPath)
    if (idx === -1) return
    const filename = url.slice(idx + uploadsPath.length)
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch (err) {
    console.warn('deleteLocalFileIfExists error', err)
  }
}
