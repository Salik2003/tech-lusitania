import Link from 'next/link'

const columns = [
  {
    heading: 'Shop',
    links: [
      { label: 'Smartphones', href: '/smartphones' },
      { label: 'Laptops', href: '/laptops' },
      { label: 'Tablets', href: '/tablets' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'WhatsApp Us', href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}` },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f7] border-t border-[#d2d2d7] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-2">
            <p className="text-[17px] font-semibold text-[#1d1d1f] mb-3">Tech Lusitania</p>
            <p className="text-[13px] text-[#6e6e73] leading-relaxed max-w-xs">
              Premium electronics delivered across Europe. All purchases are processed securely via WhatsApp.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-[12px] font-semibold text-[#1d1d1f] uppercase tracking-wider mb-4">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[13px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[#d2d2d7] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#86868b]">Copyright © {new Date().getFullYear()} Tech Lusitania. All rights reserved.</p>
          <p className="text-[12px] text-[#86868b]">All purchases via WhatsApp — no payment gateway</p>
        </div>
      </div>
    </footer>
  )
}
