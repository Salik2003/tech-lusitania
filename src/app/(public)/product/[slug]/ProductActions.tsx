'use client'

import { useState } from 'react'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { Product } from '@/types'
import { WhatsAppIcon } from '@/components/ui/WhatsAppButton'

interface Props {
  product: Product
}

export default function ProductActions({ product }: Props) {
  const [selectedStorage, setSelectedStorage] = useState(product.storage_options[0] ?? '')

  if (!product.in_stock) {
    return (
      <div className="mb-6 bg-[#f5f5f7] text-[#6e6e73] text-[13px] font-medium text-center py-3 rounded-xl">
        Currently out of stock
      </div>
    )
  }

  const waHref = buildWhatsAppLink(product.name, selectedStorage, product.price)

  return (
    <div>
      {product.storage_options.length > 0 && (
        <div className="mb-6">
          <p className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-3">Storage</p>
          <div className="flex flex-wrap gap-2">
            {product.storage_options.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStorage(s)}
                className={`border rounded-full px-5 py-2 text-[13px] font-medium transition-all ${
                  selectedStorage === s
                    ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white'
                    : 'border-[#d2d2d7] text-[#1d1d1f] hover:border-[#86868b]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] text-white rounded-full py-3.5 text-[17px] font-semibold hover:bg-[#1ebe5d] active:scale-[0.98] transition-all duration-200"
      >
        <WhatsAppIcon size={22} />
        Buy on WhatsApp
      </a>

      <p className="text-[11px] text-[#6e6e73] text-center mt-3">
        You&apos;ll be redirected to WhatsApp to complete your purchase
      </p>
    </div>
  )
}
