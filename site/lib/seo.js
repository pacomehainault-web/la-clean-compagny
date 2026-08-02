import { SITE } from './constants'

export function absoluteUrl(path = '') {
  return new URL(path, SITE.url).toString()
}

export function buildMetadata({ title, description, path = '/', image, noIndex = false }) {
  const url = absoluteUrl(path)
  const ogImage = image ? absoluteUrl(image) : absoluteUrl('/opengraph-image.jpg')

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${SITE.name} — ${SITE.slogan}` }],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}
