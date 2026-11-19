import { SITE, CONTACT, SOCIALS } from './constants'
import { CITIES } from './data/cities'
import { absoluteUrl } from './seo'

// ⚠️ Pas de Review ni d'AggregateRating ici, volontairement : Google proscrit
// les avis "auto-déclarés" (non vérifiés par une plateforme tierce) sur les
// types LocalBusiness/Service, et peut pénaliser un site qui le fait. Les
// étoiles affichées sur le site (lib/data/reviews.js, ReviewsCarousel) restent
// un contenu éditorial classique, sans balisage schema.org — les vraies
// étoiles structurées viendront de la fiche Google Business, gérée par Google
// lui-même, jamais du site.
export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    // « AutoDetailing » n'existe pas dans schema.org : Google ignorait donc ce
    // bloc. AutoWash (sous-type de AutomotiveBusiness → LocalBusiness) est le
    // type officiel le plus proche d'une activité de nettoyage/detailing auto.
    '@type': 'AutoWash',
    '@id': absoluteUrl('/#business'),
    name: SITE.name,
    // Google corrige souvent « Compagny » en « Company » (et certains avis
    // l'écrivent ainsi) : on déclare explicitement la variante pour qu'il la
    // rattache à la même entreprise.
    alternateName: 'La Clean Company',
    description:
      "Detailing automobile haut de gamme à Angers : rénovation esthétique, nettoyage intérieur/extérieur, polissage, traitement céramique, pour véhicules du quotidien, utilitaires et voitures de prestige.",
    slogan: SITE.slogan,
    url: SITE.url,
    telephone: CONTACT.phoneTel,
    email: CONTACT.email,
    image: absoluteUrl('/opengraph-image.jpg'),
    priceRange: '59 € - 179 €+',
    founder: {
      '@type': 'Person',
      name: SITE.gerant,
    },
    foundingDate: String(SITE.foundedYear),
    // Pas d'adresse postale publiée (entreprise sans point de vente physique,
    // intervention exclusivement à domicile) : on ne déclare que la ville et la
    // zone de service, conformément aux recommandations pour les "service-area
    // businesses" sans adresse publique.
    address: {
      '@type': 'PostalAddress',
      addressLocality: CONTACT.city,
      postalCode: '49000',
      addressCountry: 'FR',
    },
    // Zone de service déclarée à la fois comme rayon (pratique pour les
    // moteurs de recherche qui savent exploiter un GeoCircle) et comme liste
    // nominative des communes couvertes (cf. lib/data/cities.js — source
    // unique, jamais dupliquée ici).
    areaServed: [
      {
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: 47.4784, longitude: -0.5632 },
        geoRadius: `${CONTACT.radiusKm}000`,
      },
      ...CITIES.map((city) => ({ '@type': 'City', name: city.name })),
    ],
    sameAs: [...Object.values(SOCIALS), CONTACT.googleBusinessUrl, CONTACT.googleMapsCidUrl],
  }
}

export function serviceSchema(service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.h1,
    description: service.metaDescription,
    url: absoluteUrl(`/prestations/${service.slug}`),
    provider: { '@id': absoluteUrl('/#business') },
    // Toute la zone d'intervention, pas seulement Angers : chaque prestation
    // est proposée à l'identique dans toutes les communes de lib/data/cities.js.
    areaServed: CITIES.map((city) => ({ '@type': 'City', name: city.name })),
    ...(service.fromPrice
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: service.fromPrice,
              priceCurrency: 'EUR',
              // "dès X €" : le prix réel dépend du gabarit et de l'état du
              // véhicule — minPrice signale explicitement un prix plancher,
              // pas un tarif fixe, conformément à ce qu'affiche la page.
              minPrice: service.fromPrice,
            },
          },
        }
      : {}),
  }
}

// Bloc Service d'une page commune (/zone-intervention/[ville]) : relie
// explicitement « nettoyage de voiture à domicile » + la commune + l'entreprise,
// avec la liste des prestations proposées sur place et leur prix plancher.
export function cityServiceSchema(city, services) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Nettoyage de voiture à domicile à ${city.name}`,
    serviceType: 'Nettoyage et detailing automobile à domicile',
    url: absoluteUrl(`/zone-intervention/${city.slug}`),
    provider: { '@id': absoluteUrl('/#business') },
    areaServed: { '@type': 'City', name: city.name },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Prestations à ${city.name}`,
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: `${service.name} à ${city.name}`,
          url: absoluteUrl(`/prestations/${service.slug}`),
        },
        ...(service.fromPrice
          ? {
              priceCurrency: 'EUR',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: service.fromPrice,
                priceCurrency: 'EUR',
                minPrice: service.fromPrice,
              },
            }
          : {}),
      })),
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
    dateModified: article.updatedDate || article.date,
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
