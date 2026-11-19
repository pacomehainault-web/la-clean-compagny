import { SITE } from '@/lib/constants'
import { STANDALONE_CITIES, GROUPED_COMMUNES_PATH } from '@/lib/data/cities'
import { ARTICLES } from '@/lib/data/articles'
import { SERVICE_PAGES } from '@/lib/data/servicePages'

// Date de dernière modification réelle du contenu. Avant, chaque URL
// recevait `new Date()` (la date du build) : toutes les pages semblaient
// modifiées à chaque déploiement, et Google finit par ignorer un lastmod qui
// ne veut rien dire. À mettre à jour quand le contenu change vraiment.
const CONTENT_UPDATED = new Date('2026-11-19')

const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/prestations', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/pro', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/devis', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/galerie', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/evenements', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/notre-histoire', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/zone-intervention', changeFrequency: 'monthly', priority: 0.7 },
  { path: GROUPED_COMMUNES_PATH, changeFrequency: 'monthly', priority: 0.6 },
  { path: '/conseils', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/avis', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/bons-cadeaux', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/mentions-legales', changeFrequency: 'yearly', priority: 0.1 },
  { path: '/politique-de-confidentialite', changeFrequency: 'yearly', priority: 0.1 },
  { path: '/cgv', changeFrequency: 'yearly', priority: 0.1 },
]

export default function sitemap() {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: new URL(route.path, SITE.url).toString(),
    lastModified: CONTENT_UPDATED,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // Uniquement les communes qui ont leur propre page : Angers est portée par
  // l'accueil et les petites communes par GROUPED_COMMUNES_PATH (redirections
  // dans next.config.mjs — une URL redirigée n'a rien à faire dans un sitemap).
  const cityEntries = STANDALONE_CITIES.map((city) => ({
    url: new URL(`/zone-intervention/${city.slug}`, SITE.url).toString(),
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const articleEntries = ARTICLES.map((article) => ({
    url: new URL(`/conseils/${article.slug}`, SITE.url).toString(),
    lastModified: new Date(article.updatedDate || article.date),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const serviceEntries = SERVICE_PAGES.map((service) => ({
    url: new URL(`/prestations/${service.slug}`, SITE.url).toString(),
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticEntries, ...serviceEntries, ...cityEntries, ...articleEntries]
}
