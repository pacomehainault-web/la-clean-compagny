import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.css'
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconClock,
  IconInstagram,
  IconTiktok,
  IconFacebook,
  IconLinkedin,
} from './Icons'
import { SITE, CONTACT, HOURS, SOCIALS, telLink, mailtoLink } from '@/lib/constants'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Image
              src="/images/logo/logo-source.jpg"
              alt="La Clean Compagny"
              width={140}
              height={187}
              className={styles.brandLogo}
              style={{ height: 52, width: 'auto' }}
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

          <nav className={styles.col} aria-label="Navigation">
            <div className={styles.colTitle}>Le site</div>
            <div className={styles.linkList}>
              <Link href="/prestations">Prestations &amp; tarifs</Link>
              <Link href="/devis">Demander un devis</Link>
              <Link href="/galerie">Galerie avant / après</Link>
              <Link href="/notre-histoire">Notre histoire</Link>
              <Link href="/zone-intervention">Zone d&apos;intervention</Link>
              <Link href="/conseils">Conseils d&apos;expert</Link>
              <Link href="/bons-cadeaux">Bons cadeaux</Link>
              <Link href="/faq">Questions fréquentes</Link>
            </div>
          </nav>

          <div className={styles.col}>
            <div className={styles.colTitle}>Contact</div>
            <div className={styles.linkList}>
              <div className={styles.contactItem}>
                <IconMapPin size={17} />
                <span>{CONTACT.fullAddress}</span>
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

          <div className={styles.col}>
            <div className={styles.colTitle}>
              <IconClock size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
              Horaires
            </div>
            <div className={styles.linkList}>
              {HOURS.map((h) => (
                <div key={h.day} className={styles.hours}>
                  <span>{h.day}</span>
                  <strong>{h.hours}</strong>
                </div>
              ))}
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
          </div>
        </div>
      </div>
    </footer>
  )
}
