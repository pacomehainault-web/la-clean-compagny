import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.css'
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconInstagram,
  IconTiktok,
  IconFacebook,
  IconLinkedin,
} from './Icons'
import { SITE, CONTACT, SOCIALS, telLink, mailtoLink } from '@/lib/constants'
import { SERVICE_PAGES } from '@/lib/data/servicePages'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Image
              src="/images/logo/logo-new.png"
              alt="La Clean Compagny"
              width={280}
              height={188}
              className={styles.brandLogo}
              style={{ height: 46, width: 'auto' }}
            />
            <p className={styles.tagline}>
              {SITE.slogan}. Detailing automobile haut de gamme à Angers et dans un rayon de{' '}
              {CONTACT.radiusKm} km, pour tous les véhicules.
            </p>
            <div className={styles.socials}>
              <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <IconInstagram size={18} />
              </a>
              <a href={SOCIALS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <IconTiktok size={18} />
              </a>
              <a href={SOCIALS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <IconFacebook size={18} />
              </a>
              <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <IconLinkedin size={18} />
              </a>
            </div>
          </div>

          <nav className={styles.col} aria-label="Prestations">
            <div className={styles.colTitle}>Prestations</div>
            <div className={styles.linkList}>
              {SERVICE_PAGES.map((s) => (
                <Link href={`/prestations/${s.slug}`} key={s.slug}>
                  {s.name}
                </Link>
              ))}
              <Link href="/prestations">Toutes les prestations</Link>
            </div>
          </nav>

          <nav className={styles.col} aria-label="Navigation">
            <div className={styles.colTitle}>Le site</div>
            <div className={styles.linkList}>
              <Link href="/devis">Demander un devis</Link>
              <Link href="/galerie">Galerie avant / après</Link>
              <Link href="/evenements">Événements</Link>
              <Link href="/notre-histoire">Notre histoire</Link>
              <Link href="/zone-intervention">Zone d&apos;intervention</Link>
              <Link href="/conseils">Conseils d&apos;expert</Link>
              <Link href="/bons-cadeaux">Bons cadeaux</Link>
              <Link href="/faq">Questions fréquentes</Link>
              <Link href="/pro">Espace Professionnels</Link>
            </div>
          </nav>

          <div className={styles.col}>
            <div className={styles.colTitle}>Contact</div>
            <div className={styles.linkList}>
              <div className={styles.contactItem}>
                <IconMapPin size={17} />
                <span>
                  {CONTACT.city} et {CONTACT.radiusKm} km alentour
                </span>
              </div>
              <div className={styles.contactItem}>
                <IconPhone size={17} />
                <a href={telLink()}>{CONTACT.phoneDisplay}</a>
              </div>
              <div className={styles.contactItem}>
                <IconMail size={17} />
                <a href={mailtoLink({})}>{CONTACT.email}</a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>
            © {year} {SITE.legalName} — SIREN {SITE.siren} — {SITE.vatNote}
          </span>
          <div className={styles.bottomLinks}>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/politique-de-confidentialite">Politique de confidentialité</Link>
            <Link href="/cgv">CGV</Link>
            <Link href="/cgv#bons-cadeaux">CGV Bons Cadeaux</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
