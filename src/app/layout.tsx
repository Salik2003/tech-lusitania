import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: { default: 'Tech Lusitania — Premium Electronics', template: '%s | Tech Lusitania' },
  description: 'Shop the latest smartphones, laptops, and tablets at the best prices. Every purchase handled personally via WhatsApp.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tech-lusitania.vercel.app'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  )
}
