import Link from 'next/link'
import { Suspense } from 'react'
import { ChevronRight, Truck, ShieldCheck, Award } from 'lucide-react'
import { createSupabasePublicClient } from '@/lib/supabase-public'
import ProductCard from '@/components/product/ProductCard'
import HeroVideo from '@/components/ui/HeroVideo'
import { Product, Category } from '@/types'

// ISR: re-render at most once per 60 s, served from CDN between renders
export const revalidate = 60

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://techlusitania.com/#organization',
      name: 'Tech Lusitania',
      url: 'https://techlusitania.com',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://techlusitania.com/#website',
      url: 'https://techlusitania.com',
      name: 'Tech Lusitania',
      publisher: { '@id': 'https://techlusitania.com/#organization' },
    },
  ],
}

async function getHomeData() {
  const supabase = createSupabasePublicClient()
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, images:product_images(id, url, alt, is_primary, sort_order)')
      .not('badge', 'is', null)
      .limit(3),
    supabase.from('categories').select('*').order('display_order').limit(3),
  ])
  return { products: products ?? [], categories: categories ?? [] }
}

const trustItems = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over €100' },
  { icon: ShieldCheck, title: '1-Year Warranty', desc: 'On all products' },
  { icon: Award, title: 'Secure via WhatsApp', desc: 'Direct, no payment gateway' },
]

export default async function HomePage() {
  const { products, categories } = await getHomeData()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Instant gradient shown before video loads */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d1a2e] to-[#0a0f1a]" />

        {/* Video loads lazily — never blocks FCP */}
        <HeroVideo src="/hero.mp4" />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-16 text-center text-white">
          <p className="text-[11px] md:text-[12px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-5">
            Premium Smartphones &amp; More
          </p>
          <h1 className="text-[34px] md:text-[52px] font-semibold leading-[1.1] tracking-[-0.02em] mb-5">
            The best tech,<br />one WhatsApp away.
          </h1>
          <p className="text-[14px] md:text-[16px] text-white/60 font-light max-w-xl mx-auto mb-10 leading-relaxed">
            Curated smartphones, laptops &amp; tablets at unbeatable prices.<br className="hidden md:block" />
            Every purchase handled personally — no bots, no forms.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/smartphones"
              prefetch
              className="bg-white text-[#1d1d1f] rounded-full px-7 py-3 text-[14px] font-semibold hover:bg-white/90 active:scale-95 transition-all duration-200"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="border border-white/30 text-white rounded-full px-7 py-3 text-[14px] font-medium hover:border-white/60 hover:bg-white/10 active:scale-95 transition-all duration-200 flex items-center gap-1.5"
            >
              Contact us <ChevronRight size={15} />
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10">
            {['Free shipping over €100', '1-year warranty', 'Secure WhatsApp checkout'].map((pill) => (
              <span key={pill} className="text-[11px] text-white/40 border border-white/10 rounded-full px-3.5 py-1">
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-[#f5f5f7] border-b border-[#d2d2d7]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {trustItems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <Icon size={24} className="text-[#0071e3] flex-shrink-0" />
                <div>
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">{title}</p>
                  <p className="text-[13px] text-[#6e6e73]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by category ── */}
      {categories.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-[28px] md:text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-10">
              Shop by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {(categories as Category[]).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  prefetch
                  className="group relative bg-[#f5f5f7] rounded-2xl p-8 overflow-hidden hover:bg-[#e8e8ed] transition-colors duration-200"
                >
                  <p className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-3">{cat.name}</p>
                  <p className="text-[22px] font-semibold text-[#1d1d1f] mb-4 tracking-tight">
                    Explore {cat.name}
                  </p>
                  <span className="text-[#0071e3] text-[15px] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Shop now <ChevronRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured products ── */}
      {products.length > 0 && (
        <section className="bg-[#f5f5f7] py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-[28px] md:text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-10 text-center">
              Featured Products
            </h2>
            <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-[#e8e8ed]" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(products as Product[]).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Suspense>
            <div className="mt-10 flex justify-center">
              <Link
                href="/smartphones"
                className="inline-flex items-center gap-2 border border-[#0071e3] text-[#0071e3] rounded-full px-8 py-3 text-[15px] font-medium hover:bg-[#0071e3] hover:text-white transition-all duration-200 active:scale-95"
              >
                View all products <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── WhatsApp CTA ── */}
      <section
        className="relative overflow-hidden py-32"
        style={{ background: 'linear-gradient(135deg, #fdf6ec 0%, #f0faf4 40%, #eef2ff 70%, #fdf6ec 100%)' }}
      >
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a8f0c6 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-35 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #c4b5fd 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-60 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #fde68a 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <div
            className="rounded-3xl px-10 py-14 text-center"
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset',
            }}
          >
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] uppercase text-[#25D366] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block" />
              Available on WhatsApp
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block" />
            </span>
            <h2 className="text-[30px] md:text-[40px] font-semibold tracking-[-0.02em] text-[#1d1d1f] mb-4 leading-tight">
              Questions? We&apos;re just<br />a message away.
            </h2>
            <p className="text-[15px] text-[#6e6e73] mb-10 leading-relaxed max-w-md mx-auto">
              All purchases and enquiries handled personally. No bots, no checkout forms — just a real, human conversation.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-white rounded-full px-8 py-3.5 text-[15px] font-semibold active:scale-95 transition-all duration-200 shadow-lg shadow-green-200/60"
              style={{ background: 'linear-gradient(135deg, #25D366 0%, #1aad53 100%)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
            <p className="mt-5 text-[12px] text-[#a1a1a6]">Typically replies within a few minutes</p>
          </div>
        </div>
      </section>
    </>
  )
}
