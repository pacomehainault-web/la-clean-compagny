import { SITE, CONTACT, OPENING_HOURS_SCHEMA, SOCIALS } from './constants'
import { AGGREGATE_RATING } from './data/reviews'
import { absoluteUrl } from './seo'

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDetailing',
    '@id': absoluteUrl('/#business'),
    name: SITE.name,
    description:
      "Detailing automobile haut de gamme à Angers : rénovation esthétique, nettoyage intérieur/extérieur, polissage, traitement céramique, pour véhicules du quotidien, utilitaires et voitures de prestige.",
    slogan: SITE.slogan,
    url: SITE.url,
    telephone: CONTACT.phoneTel,
    email: CONTACT.email,
    image: absoluteUrl('/opengraph-image.jpg'),
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.addressLine,
      postalCode: CONTACT.postalCode,
      addressLocality: CONTACT.city,
      addressCountry: 'FR',
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 47.4784,
        longitude: -0.5632,
      },
      geoRadius: `${CONTACT.radiusKm}000`,
    },
    openingHoursSpecification: OPENING_HOURS_SCHEMA.map((o) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: o.days,
      opens: o.opens,
      closes: o.closes,
    })),
    sameAs: Object.values(SOCIALS),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: AGGREGATE_RATING.ratingValue,
      reviewCount: AGGREGATE_RATING.reviewCount,
    },
  }
}

export function faqPageSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function articleSchema(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Person',
      name: SITE.gerant,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
    },
    mainEntityOfPage: absoluteUrl(`/conseils/${article.slug}`),
  }
}
