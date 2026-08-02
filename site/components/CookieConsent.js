'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './CookieConsent.module.css'

const STORAGE_KEY = 'lcc-cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) setVisible(true)
  }, [])

  function choose(value) {
    window.localStorage.setItem(STORAGE_KEY, value)
    window.dispatchEvent(new CustomEvent('lcc-consent-change', { detail: value }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.wrap} role="dialog" aria-label="Gestion des cookies">
      <p className={styles.text}>
        Nous utilisons des cookies de mesure d&apos;audience pour comprendre comment vous
        utilisez le site. Vous pouvez les accepter ou les refuser — le site fonctionne dans
        tous les cas. Plus d&apos;informations dans notre{' '}
        <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
      </p>
      <div className={styles.actions}>
        <button type="button" className="btn btn-cta btn-sm" onClick={() => choose('accepted')}>
          Accepter
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => choose('refused')}>
          Refuser
        </button>
      </div>
    </div>
  )
}
