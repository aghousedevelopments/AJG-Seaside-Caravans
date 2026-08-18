import { GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import prisma from '../../lib/prisma'

export default function AdminImages({ unauthorized }: { unauthorized?: boolean }) {
  const [propertyId, setPropertyId] = useState<number>(1)
  const [images, setImages] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchImages() }, [propertyId])

  async function fetchImages() {
    const res = await fetch(`/api/admin/images?propertyId=${propertyId}`, { credentials: 'same-origin' })
    const json = await res.json()
    setImages(json.images || [])
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return alert('Choose a file')
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ propertyId, filename: file.name, dataUrl, alt })
      })
      const json = await res.json()
      setLoading(false)
      if (json.error) return alert(json.error)
      setFile(null)
      setAlt('')
      fetchImages()
    }
    reader.readAsDataURL(file)
  }

  async function remove(id: number) {
    if (!confirm('Delete image?')) return
    const res = await fetch('/api/admin/delete-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ id }) })
    const json = await res.json()
    if (json.ok) fetchImages()
    else alert(json.error || 'delete failed')
  }

  if (unauthorized) return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Images</h1>
      <p>Unauthorized. Provide HTTP Basic auth with username "admin" and the ADMIN_PASSWORD from your environment.</p>
    </main>
  )

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Images</h1>

      <section className="mb-6">
        <label className="block mb-2">Property ID: <input type="number" value={propertyId} onChange={e => setPropertyId(Number(e.target.value))} className="border p-2" /></label>
        <form onSubmit={upload} className="space-y-2">
          <div>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
          </div>
          <div>
            <input placeholder="Alt text (optional)" value={alt} onChange={e => setAlt(e.target.value)} className="border p-2 w-full" />
          </div>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl mb-3">Images</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="border p-2">
              <img src={img.url} alt={img.alt || ''} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
              <p className="text-sm mt-1">{img.alt}</p>
              <div className="mt-2 flex gap-2">
                <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => remove(img.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const auth = context.req.headers.authorization
  const adminPass = process.env.ADMIN_PASSWORD || ''
  const expected = 'Basic ' + Buffer.from(`admin:${adminPass}`).toString('base64')
  if (!auth || auth !== expected) {
    context.res.statusCode = 401
    context.res.setHeader('WWW-Authenticate', 'Basic realm="Admin"')
    return { props: { unauthorized: true } }
  }

  return { props: {} }
}
