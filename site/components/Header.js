'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Header.module.css'
import { IconMenu, IconClose, IconPhone } from './Icons'
import { CONTACT, telLink } from '@/lib/constants'

const NAV_LINKS = [
  { href: '/prestations', label: 'Prestations' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/zone-intervention', label: "Zone d'intervention" },
  { href: '/notre-histoire', label: 'Notre histoire' },
  { href: '/conseils', label: 'Conseils' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className={`${styles.header} ${scrolled || open ? styles.headerScrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <Image
            src="/images/logo/logo-source.jpg"
            alt="La Clean Compagny — service de nettoyage automobile"
            width={140}
            height={187}
            priority
            style={{ height: 46, width: 'auto', borderRadius: 6 }}
          />
        </Link>

        <nav className={styles.nav} aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href={telLink()} className={styles.phone}>
            <IconPhone size={17} />
            {CONTACT.phoneDisplay}
          </a>
          <Link href="/devis" className="btn btn-cta btn-sm">
            Voir les tarifs et réserver
          </Link>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.overlay}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className={styles.overlayFooter}>
            <a href={telLink()} className={styles.overlayContact}>
              <IconPhone size={18} />
              {CONTACT.phoneDisplay}
            </a>
            <Link href="/devis" className="btn btn-cta btn-block" onClick={() => setOpen(false)}>
              Voir les tarifs et réserver
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
