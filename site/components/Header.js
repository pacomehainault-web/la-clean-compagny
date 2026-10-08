'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import styles from './Header.module.css'
import { IconMenu, IconClose, IconPhone, IconInstagram, IconTiktok, IconFacebook, IconLinkedin, IconArrowRight } from './Icons'
import { CONTACT, SOCIALS, telLink } from '@/lib/constants'

const NAV_LINKS = [
  { href: '/prestations', label: 'Prestations' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/evenements', label: 'Événements' },
  { href: '/zone-intervention', label: "Zone d'intervention" },
  { href: '/notre-histoire', label: 'Notre histoire' },
  { href: '/conseils', label: 'Conseils' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [isProQuery, setIsProQuery] = useState(false)
  const isProSpace = pathname?.startsWith('/pro') || isProQuery

  // Lu depuis window.location plutôt que useSearchParams() : ce Header est monté
  // sur tout le site via le layout racine, et useSearchParams() forcerait un rendu
  // dynamique (avec Suspense) sur des pages autrement statiques.
  useEffect(() => {
    setIsProQuery(new URLSearchParams(window.location.search).get('pro') === '1')
  }, [pathname])

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

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div className={styles.proBar}>
        <div className={`container ${styles.proBarInner}`}>
          {isProSpace ? (
            <>
              <span className={styles.proBarText}>Vous êtes un particulier ?</span>
              <Link href="/" className={styles.proBarLink}>
                Retour au site grand public
                <IconArrowRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <span className={styles.proBarText}>Vous êtes un professionnel ? Découvrez nos offres flottes</span>
              <Link href="/pro" className={styles.proBarLink}>
                Espace Pro
                <IconArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>

      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
            <Image
              src="/images/logo/logo-new.png"
              alt="La Clean Compagny — service de nettoyage automobile"
              width={280}
              height={188}
              priority
              className={styles.brandLogo}
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
            <Link href="/devis" className={`btn btn-cta btn-sm ${styles.headerCta}`}>
              Voir les tarifs et réserver
            </Link>
            <button
              type="button"
              className={styles.menuBtn}
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      {/*
        Le backdrop et le drawer sont rendus HORS du <header> (qui utilise
        backdrop-filter). Sur Safari/WebKit, un ancêtre avec backdrop-filter ou
        filter crée un nouveau bloc de positionnement pour ses descendants en
        position:fixed — le menu se retrouvait alors coincé derrière le
        contenu de la page au lieu de s'afficher au premier plan.
      */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} role="dialog" aria-modal="true" aria-label="Menu">
        <div className={styles.drawerTop}>
          <Image
            src="/images/logo/logo-new.png"
            alt="La Clean Compagny"
            width={280}
            height={188}
            className={styles.drawerLogo}
            style={{ height: 34, width: 'auto' }}
          />
          <button type="button" className={styles.drawerClose} aria-label="Fermer le menu" onClick={() => setOpen(false)}>
            <IconClose />
          </button>
        </div>

        <nav className={styles.drawerNav} aria-label="Navigation mobile">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : '0ms' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.drawerFooter}>
          <a href={telLink()} className={styles.drawerContact}>
            <IconPhone size={18} />
            {CONTACT.phoneDisplay}
          </a>
          <Link href="/devis" className="btn btn-cta btn-block" onClick={() => setOpen(false)}>
            Voir les tarifs et réserver
          </Link>
          <div className={styles.drawerSocials}>
            <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IconInstagram size={17} />
            </a>
            <a href={SOCIALS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <IconTiktok size={17} />
            </a>
            <a href={SOCIALS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <IconFacebook size={17} />
            </a>
            <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <IconLinkedin size={17} />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
