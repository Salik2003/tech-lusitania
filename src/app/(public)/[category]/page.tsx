import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { createSupabasePublicClient } from '@/lib/supabase-public'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'

// ISR: cache rendered HTML for 60 s — served from CDN between rebuilds
export const revalidate = 60

// Pre-generate all 3 category pages at build time
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <nav className="text-[13px] text-[#6e6e73] mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#1d1d1f] font-medium">{label}</span>
      </nav>

      <div className="flex gap-10">
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

          {!products || products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[17px] text-[#6e6e73] mb-4">No products match your filters.</p>
              <Link href={`/${category}`} className="text-[#0071e3] text-[15px] font-medium hover:text-[#0077ed]">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {(products as Product[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
