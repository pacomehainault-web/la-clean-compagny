import { Inter, Archivo } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { WhatsAppFloat, MobileStickyCTA } from '@/components/FloatingCTAs'
import CookieConsent from '@/components/CookieConsent'
import Analytics from '@/components/Analytics'
import JsonLd from '@/components/JsonLd'
import CustomCursor from '@/components/CustomCursor'
import ScrollRevealInit from '@/components/ScrollRevealInit'
import { SITE } from '@/lib/constants'
import { localBusinessSchema } from '@/lib/schema'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['700', '800', '900'],
})

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'La Clean Compagny — Detailing automobile haut de gamme à Angers',
    template: '%s | La Clean Compagny',
  },
  description:
    "Detailing automobile haut de gamme à Angers : nettoyage intérieur/extérieur, polissage, traitement céramique, rénovation optiques. Chaque véhicule, même exigence.",
  // Pas de balise meta keywords : Google ne l'utilise plus depuis 2009, elle
  // n'a donc aucun effet SEO et ne fait qu'ajouter du poids à chaque page.
  authors: [{ name: SITE.gerant }],
  creator: SITE.name,
  formatDetection: { telephone: true, email: true, address: true },
}

export const viewport = {
  themeColor: '#eeece7',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${inter.variable} ${archivo.variable}`}>
      <body>
        <noscript>
          <style>{'.reveal { opacity: 1 !important; transform: none !important; }'}</style>
        </noscript>
        <JsonLd data={localBusinessSchema()} />
        <a href="#main-content" className="skip-link">
          Aller au contenu
        </a>
        <CustomCursor />
        <ScrollRevealInit />
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
