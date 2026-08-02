import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { WhatsAppFloat, MobileStickyCTA } from '@/components/FloatingCTAs'
import CookieConsent from '@/components/CookieConsent'
import Analytics from '@/components/Analytics'
import JsonLd from '@/components/JsonLd'
import { SITE } from '@/lib/constants'
import { localBusinessSchema } from '@/lib/schema'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['600', '700'],
})

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'La Clean Compagny — Detailing automobile haut de gamme à Angers',
    template: '%s | La Clean Compagny',
  },
  description:
    "Detailing automobile haut de gamme à Angers : nettoyage intérieur/extérieur, polissage, traitement céramique, rénovation optiques. Chaque véhicule, même exigence.",
  keywords: [
    'detailing automobile Angers',
    'nettoyage auto Angers',
    'polissage carrosserie',
    'traitement céramique',
    'rénovation optiques',
    'lavage voiture prestige',
  ],
  authors: [{ name: SITE.gerant }],
  creator: SITE.name,
  formatDetection: { telephone: true, email: true, address: true },
}

export const viewport = {
  themeColor: '#08080a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <JsonLd data={localBusinessSchema()} />
        <a href="#main-content" className="skip-link">
          Aller au contenu
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <MobileStickyCTA />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  )
}
