'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/smartphones', label: 'Smartphones' },
  { href: '/laptops', label: 'Laptops' },
  { href: '/tablets', label: 'Tablets' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Transparent only when on home page AND not scrolled
  const isTransparent = isHome && !scrolled

  return (
    <>
      {/* ── Fixed header: announcement bar + nav stacked together ── */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-2xl shadow-sm border-b border-black/8'
      }`}>

        {/* Announcement bar */}
        <div className={`text-center py-2 text-[11px] font-medium tracking-wide transition-colors duration-500 ${
          isTransparent ? 'text-white/60' : 'text-[#6e6e73]'
        }`}>
          Free Shipping on orders over €100&nbsp;·&nbsp;1-Year Warranty on all products
        </div>

        {/* Nav row */}
        <nav>
          <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
            <Link href="/" className="flex items-center" aria-label="Tech Lusitania Home">
              <span className={`text-[17px] font-bold tracking-tight transition-colors duration-300 ${
                isTransparent ? 'text-white' : 'text-[#1d1d1f]'
              }`}>Tech Lusitania</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-[13px] font-medium transition-colors duration-300 ${
                    isTransparent ? 'text-white/80 hover:text-white' : 'text-[#1d1d1f] hover:text-black'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <button
              className={`md:hidden p-1 transition-colors duration-300 ${
                isTransparent ? 'text-white' : 'text-[#1d1d1f]'
              }`}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200 ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-2xl pt-4 pb-8 px-6 transition-transform duration-300 ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="flex items-center justify-between mb-6 h-12">
            <Link href="/" className="flex items-center" aria-label="Tech Lusitania Home" onClick={() => setMenuOpen(false)}>
              <span className="text-[17px] font-bold tracking-tight text-[#1d1d1f]">Tech Lusitania</span>
            </Link>
            <button onClick={() => setMenuOpen(false)} aria-label="Close">
              <X size={20} className="text-[#1d1d1f]" />
            </button>
          </div>
          <nav className="space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-[17px] text-[#1d1d1f] border-b border-[#d2d2d7] last:border-0"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* No spacer — hero fills full viewport behind fixed header */}
    </>
  )
}
