import { SITE } from '@/lib/constants'
import { CITIES } from '@/lib/data/cities'
import { ARTICLES } from '@/lib/data/articles'
import { SERVICE_PAGES } from '@/lib/data/servicePages'

const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/prestations', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/pro', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/devis', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/galerie', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/evenements', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/notre-histoire', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/zone-intervention', changeFrequency: 'monthly', priority: 0.7 },
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
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const cityEntries = CITIES.map((city) => ({
    url: new URL(`/zone-intervention/${city.slug}`, SITE.url).toString(),
    lastModified: new Date(),
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
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticEntries, ...serviceEntries, ...cityEntries, ...articleEntries]
}
