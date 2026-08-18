import Image from 'next/image'

export default function Gallery({ images }: { images: { url: string; alt?: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {images.map((img, i) => (
        <div key={i} className="relative w-full h-48">
          {/* next/image requires remote patterns configured; these are example URLs */}
          <Image src={img.url} alt={img.alt ?? `photo-${i}`} fill className="object-cover rounded" />
        </div>
      ))}
    </div>
  )
}
