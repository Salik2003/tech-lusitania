import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  // Drop 300 (not used) — fewer font files to download
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const SITE_URL = 'https://techlusitania.com'
const SITE_NAME = 'Tech Lusitania'
const DESCRIPTION =
  'Buy iPhones, tablets, and premium electronics at unbeatable prices. Every purchase handled personally via WhatsApp — no bots, no checkout forms.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Buy iPhones & Tablets Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'buy iPhone', 'iPhone for sale', 'buy tablet', 'iPad for sale',
    'smartphones online', 'buy phones WhatsApp', 'premium electronics',
    'Tech Lusitania', 'techlusitania', 'cheap iPhones', 'buy iPhone Europe',
  ],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Buy iPhones & Tablets Online`,
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Tech Lusitania' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Buy iPhones & Tablets Online`,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') ?? ''

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to Supabase so image requests start immediately */}
        {supabaseHost && (
          <>
            <link rel="preconnect" href={`https://${supabaseHost}`} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={`https://${supabaseHost}`} />
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  )
}
