import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/admin/login'],
      },
    ],
    sitemap: 'https://techlusitania.com/sitemap.xml',
    host: 'https://techlusitania.com',
  }
}
