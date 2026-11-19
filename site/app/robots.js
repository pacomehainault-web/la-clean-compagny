import { SITE } from '@/lib/constants'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Espace privé du dashboard (prospects) : jamais dans Google.
      disallow: '/admin',
    },
    sitemap: new URL('/sitemap.xml', SITE.url).toString(),
  }
}
