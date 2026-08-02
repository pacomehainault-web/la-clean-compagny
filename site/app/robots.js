import { SITE } from '@/lib/constants'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: new URL('/sitemap.xml', SITE.url).toString(),
  }
}
