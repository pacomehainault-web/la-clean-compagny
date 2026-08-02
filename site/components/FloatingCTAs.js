import Link from 'next/link'
import styles from './FloatingCTAs.module.css'
import { IconWhatsapp, IconPhone } from './Icons'
import { whatsappLink, telLink } from '@/lib/constants'

const DEFAULT_MESSAGE =
  'Bonjour La Clean Compagny, je souhaiterais obtenir un devis pour le nettoyage de mon véhicule.'

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(DEFAULT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsapp}
      aria-label="Contacter La Clean Compagny sur WhatsApp"
    >
      <IconWhatsapp size={28} />
    </a>
  )
}

export function MobileStickyCTA() {
  return (
    <div className={styles.mobileBar}>
      <a href={telLink()} className="btn btn-outline btn-sm">
        <IconPhone size={16} />
        Appeler
      </a>
      <Link href="/devis" className="btn btn-cta btn-sm">
        Demander un devis
      </Link>
    </div>
  )
}
