'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductImage } from '@/types'

interface Props {
  images: ProductImage[]
  productName: string
}

export default function ImageSlider({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(
    () => images.findIndex((i) => i.is_primary) ?? 0
  )

  if (!images.length) {
    return (
      <div className="relative aspect-square bg-[#f5f5f7] rounded-3xl flex items-center justify-center text-[#d2d2d7]">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>
    )
  }

  const current = images[activeIndex]
  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIndex((i) => (i + 1) % images.length)

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square bg-[#f5f5f7] rounded-3xl overflow-hidden group">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt || productName}
          fill
          className="object-contain p-8 transition-opacity duration-300"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Prev / Next arrows — visible only when > 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-90"
            >
              <ChevronLeft size={18} className="text-[#1d1d1f]" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-90"
            >
              <ChevronRight size={18} className="text-[#1d1d1f]" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    idx === activeIndex ? 'bg-[#1d1d1f] w-3' : 'bg-[#1d1d1f]/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 snap-start ${
                idx === activeIndex
                  ? 'border-[#1d1d1f] scale-105'
                  : 'border-[#d2d2d7] hover:border-[#6e6e73]'
              }`}
            >
              <Image src={img.url} alt="" fill className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
