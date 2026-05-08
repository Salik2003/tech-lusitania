import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { Truck, Award, RotateCcw } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase'
import { Product } from '@/types'
import ProductActions from './ProductActions'
import ImageSlider from '@/components/product/ImageSlider'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select('name, description, images:product_images(url, alt, is_primary)')
    .eq('slug', slug)
    .single()
  if (!data) return {}

  const title = `Buy ${data.name}`
  const description = data.description || `Buy ${data.name} at Tech Lusitania — premium device, WhatsApp checkout, 1-year warranty.`
  const url = `https://techlusitania.com/product/${slug}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images = (data as any).images ?? []
  const primaryImage = images.find((i: { is_primary: boolean; url: string; alt: string }) => i.is_primary) || images[0]

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title: `${data.name} | Tech Lusitania`,
      description,
      ...(primaryImage && {
        images: [{ url: primaryImage.url, alt: primaryImage.alt || data.name }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} | Tech Lusitania`,
      description,
      ...(primaryImage && { images: [primaryImage.url] }),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, images:product_images(id, url, alt, is_primary, sort_order)')
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  const p = product as Product
  const images = (p.images ?? []).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-[13px] text-[#6e6e73] mb-10 flex items-center gap-2">
        <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/${p.category}`} className="capitalize hover:text-[#1d1d1f] transition-colors">{p.category}</Link>
        <span>/</span>
        <span className="text-[#1d1d1f] truncate max-w-xs">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Image slider */}
        <div>
          <ImageSlider images={images} productName={p.name} />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-2">{p.brand}</p>
          <h1 className="text-[32px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-tight leading-tight mb-4">
            {p.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className={`text-[12px] font-semibold px-3 py-1 rounded-full ${
              p.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {p.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
            {p.badge && (
              <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                {p.badge}
              </span>
            )}
          </div>

          <p className="text-[40px] font-semibold text-[#1d1d1f] tracking-tight mb-8">€{p.price}</p>

          <ProductActions product={p} />

          {/* Trust row */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t border-[#d2d2d7] mt-8">
            {[
              { icon: Truck, label: 'Free Shipping' },
              { icon: Award, label: '1 Year Warranty' },
              { icon: RotateCcw, label: '30 Day Returns' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1.5">
                <Icon size={18} className="text-[#6e6e73]" />
                <span className="text-[11px] text-[#6e6e73]">{label}</span>
              </div>
            ))}
          </div>

          {/* Specs */}
          {p.specs && Object.keys(p.specs).length > 0 && (
            <div className="border-t border-[#d2d2d7] pt-6">
              <h2 className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-4">Specifications</h2>
              <dl className="space-y-3">
                {Object.entries(p.specs).map(([key, value]) => (
                  <div key={key} className="flex gap-6 text-[15px]">
                    <dt className="text-[#6e6e73] w-32 flex-shrink-0">{key}</dt>
                    <dd className="text-[#1d1d1f]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Description */}
          {p.description && (
            <div className="border-t border-[#d2d2d7] pt-6 mt-6">
              <h2 className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-3">About</h2>
              <p className="text-[15px] text-[#6e6e73] leading-relaxed">{p.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
