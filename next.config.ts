import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "font-src 'self' fonts.gstatic.com",
  "img-src 'self' data: *.supabase.co blob:",
  "media-src 'self' blob:",
  "connect-src 'self' *.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
].join('; ')

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'Content-Security-Policy', value: csp }],
      },
      // Immutable cache for fingerprinted static chunks
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // 1-day cache for Next.js optimized images
      {
        source: '/_next/image(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ]
  },

  images: {
    // Serve AVIF then WebP — major size reduction vs JPEG/PNG
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 7 days
    minimumCacheTTL: 604800,
    // Only the sizes we actually use
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
