import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { buildWhatsAppLink } from '@/lib/whatsapp'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const primaryImage = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
  const defaultStorage = product.storage_options[0] ?? ''
  const waHref = buildWhatsAppLink(product.name, defaultStorage, product.price)

  return (
    <div className="group flex flex-col bg-[#f5f5f7] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/product/${product.slug}`} className="relative aspect-square bg-white overflow-hidden">
        {primaryImage?.url ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#d2d2d7]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
        )}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#0071e3] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-[13px] font-medium text-[#6e6e73]">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-1">{product.brand}</p>
        <Link href={`/product/${product.slug}`} className="flex-1">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] leading-snug mb-1 hover:text-[#0071e3] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-[22px] font-semibold text-[#1d1d1f] mt-2 mb-4">€{product.price}</p>

        {product.in_stock ? (
          <WhatsAppButton href={waHref} label="Buy on WhatsApp" size="sm" className="w-full justify-center" />
        ) : (
          <span className="text-[13px] text-[#6e6e73] text-center py-2">Out of Stock</span>
        )}
      </div>
    </div>
  )
}
