import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
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

  // ── Canonical & robots ──────────────────────────────────────────────
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Open Graph ───────────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Buy iPhones & Tablets Online`,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tech Lusitania — Premium iPhones & Tablets',
      },
    ],
  },

  // ── Twitter / X Card ─────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@techlusitania',
    creator: '@techlusitania',
    title: `${SITE_NAME} — Buy iPhones & Tablets Online`,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },

  // ── Icons ─────────────────────────────────────────────────────────────
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },

  // ── Verification (add your own keys when ready) ───────────────────────
  // verification: {
  //   google: 'YOUR_GOOGLE_SEARCH_CONSOLE_KEY',
  // },
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
