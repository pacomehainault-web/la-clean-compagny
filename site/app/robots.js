import { SITE } from '@/lib/constants'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      // L'espace équipe n'est pas cité ici (robots.txt est public) : il est
      // protégé par mot de passe et marqué noindex (balise + en-tête HTTP).
      allow: '/',
    },
    sitemap: new URL('/sitemap.xml', SITE.url).toString(),
  }
}
