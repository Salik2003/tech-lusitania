import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { createSupabasePublicClient } from '@/lib/supabase-public'
import ProductCard from '@/components/product/ProductCard'
import HeroVideo from '@/components/ui/HeroVideo'
import { Product } from '@/types'

export const revalidate = 60

export function generateStaticParams() {
  return [
    { category: 'smartphones' },
    { category: 'laptops' },
    { category: 'tablets' },
  ]
}

const VALID_CATEGORIES = ['smartphones', 'laptops', 'tablets'] as const
type ValidCategory = (typeof VALID_CATEGORIES)[number]

const categoryLabels: Record<ValidCategory, string> = {
  smartphones: 'Smartphones',
  laptops: 'Laptops',
  tablets: 'Tablets',
}

const categoryDescriptions: Record<ValidCategory, string> = {
  smartphones: 'Buy the latest iPhones and premium smartphones at Tech Lusitania. Every purchase handled personally via WhatsApp — no bots, no checkout forms.',
  laptops: 'Shop premium laptops at unbeatable prices at Tech Lusitania. Direct WhatsApp checkout, 1-year warranty on all products.',
  tablets: 'Buy iPads and premium tablets at Tech Lusitania. Authentic devices, personal WhatsApp service, and free shipping over €100.',
}

// Coming-soon videos — shown when a category has no products yet
const comingSoonVideos: Partial<Record<ValidCategory, string>> = {
  laptops: '/videos/laptop-coming-soon.webm',
  tablets: '/videos/tablet-coming-soon.webm',
}


interface Props {
  params: Promise<{ category: string }>
  searchParams: Promise<{ brand?: string; sort?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  if (!VALID_CATEGORIES.includes(category as ValidCategory)) return {}
  const label = categoryLabels[category as ValidCategory]
  const desc = categoryDescriptions[category as ValidCategory]
  const url = `https://techlusitania.com/${category}`
  return {
    title: `Buy ${label} Online`,
    description: desc,
    alternates: { canonical: url },
    openGraph: { url, title: `${label} | Tech Lusitania`, description: desc },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params
  const { brand, sort } = await searchParams

  if (!VALID_CATEGORIES.includes(category as ValidCategory)) notFound()

  const supabase = createSupabasePublicClient()
  let query = supabase
    .from('products')
    .select('*, images:product_images(id, url, alt, is_primary, sort_order)')
    .eq('category', category)

  if (brand) query = query.eq('brand', brand)
  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: products } = await query

  const { data: brandRows } = await supabase
    .from('products')
    .select('brand')
    .eq('category', category)

  const brands = [...new Set((brandRows ?? []).map((r: { brand: string }) => r.brand))]
  const label = categoryLabels[category as ValidCategory]
  const hasProducts = products && products.length > 0
  const comingSoonVideo = comingSoonVideos[category as ValidCategory]
  const waNotifyText = encodeURIComponent(`Hi! I'd like to be notified when ${label} are available on Tech Lusitania.`)

  // ── No products + coming-soon video → full-screen cinematic hero ──────
  if (!hasProducts && comingSoonVideo) {
    return (
      <section className="relative min-h-screen overflow-hidden">
        {/* Dark gradient shown instantly */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#101820] to-[#0a0a14]" />
        {/* Video fades in over it */}
        <HeroVideo src={comingSoonVideo} />
        {/* Overlay so text is always readable */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content layer — spans full section, flex column pushes buttons to bottom */}
        <div className="absolute inset-0 flex flex-col px-6 text-white text-center">

          {/* ── TOP: heading ── */}
          <div className="pt-40 pb-6">
            <p className="text-[11px] md:text-[12px] font-semibold tracking-[0.26em] uppercase text-white/40 mb-5">
              Coming Soon
            </p>
            <h1 className="text-[48px] md:text-[80px] font-semibold tracking-[-0.03em] leading-[1]">
              {label}
            </h1>
          </div>

          {/* ── MIDDLE: spacer so video shows ── */}
          <div className="flex-1" />

          {/* ── BOTTOM: CTA buttons ── */}
          <div className="pb-20">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${waNotifyText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#25D366] text-white rounded-full px-8 py-3.5 text-[15px] font-semibold hover:bg-[#22c55e] active:scale-95 transition-all duration-200 shadow-2xl shadow-[#25D366]/30"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Notify me on WhatsApp
              </a>
              <Link
                href="/"
                className="border border-white/30 text-white/85 rounded-full px-7 py-3.5 text-[15px] font-medium hover:border-white/60 hover:bg-white/10 active:scale-95 transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>

        </div>
      </section>
    )
  }

  // ── Normal product grid ───────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <nav className="text-[13px] text-[#6e6e73] mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#1d1d1f] font-medium">{label}</span>
      </nav>

      <div className="flex gap-10">
        {/* Sidebar — only when products exist */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-3">Brand</p>
              <div className="space-y-1">
                <Link
                  href={`/${category}${sort ? `?sort=${sort}` : ''}`}
                  className={`block text-[13px] py-1 transition-colors ${!brand ? 'text-[#0071e3] font-medium' : 'text-[#6e6e73] hover:text-[#1d1d1f]'}`}
                >
                  All
                </Link>
                {brands.map((b) => (
                  <Link
                    key={String(b)}
                    href={`/${category}?brand=${encodeURIComponent(String(b))}${sort ? `&sort=${sort}` : ''}`}
                    className={`block text-[13px] py-1 transition-colors ${brand === b ? 'text-[#0071e3] font-medium' : 'text-[#6e6e73] hover:text-[#1d1d1f]'}`}
                  >
                    {String(b)}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-3">Sort</p>
              <div className="space-y-1">
                {[
                  { value: '', label: 'Featured' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                ].map((option) => (
                  <Link
                    key={option.value}
                    href={`/${category}?${brand ? `brand=${encodeURIComponent(brand)}&` : ''}${option.value ? `sort=${option.value}` : ''}`}
                    className={`block text-[13px] py-1 transition-colors ${(!sort && !option.value) || sort === option.value ? 'text-[#0071e3] font-medium' : 'text-[#6e6e73] hover:text-[#1d1d1f]'}`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">{label}</h1>
            <span className="text-[13px] text-[#6e6e73]">{products?.length ?? 0} products</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {(products as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
