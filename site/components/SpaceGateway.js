'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './SpaceGateway.module.css'
import { IconArrowRight } from './Icons'

const STORAGE_KEY = 'lcc-gateway-seen'

export default function SpaceGateway() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch {
      // sessionStorage indisponible (navigation privée stricte…) : on n'affiche
      // pas le portail plutôt que de bloquer l'accès au site.
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  function dismiss(destination) {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // rien à faire si le stockage est indisponible
    }
    setClosing(true)
    window.setTimeout(() => {
      setVisible(false)
      if (destination) router.push(destination)
    }, 500)
  }

  if (!visible) return null

  return (
    <div className={`${styles.gateway} ${closing ? styles.gatewayClosing : ''}`} role="dialog" aria-modal="true" aria-label="Choix de votre espace">
      <div className={styles.brand}>
        <Image
          src="/images/logo/logo-new.png"
          alt="La Clean Compagny"
          width={280}
          height={188}
          priority
          style={{ height: 40, width: 'auto' }}
        />
      </div>

      <div className={styles.panels}>
        <button type="button" className={`${styles.panel} ${styles.panelParticulier}`} onClick={() => dismiss(null)}>
          <video
            className={styles.panelVideo}
            src="/videos/ferrari-video-arriere-plan-heros.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className={styles.panelOverlay} aria-hidden="true" />
          <div className={styles.panelContent}>
            <span className={styles.panelLabel}>Espace Particulier</span>
            <span className={styles.panelSub}>Sublimer votre véhicule au quotidien</span>
            <span className={styles.panelCta}>
              Entrer
              <IconArrowRight size={16} />
            </span>
          </div>
        </button>

        <button type="button" className={`${styles.panel} ${styles.panelPro}`} onClick={() => dismiss('/pro')}>
          <video
            className={styles.panelVideo}
            src="/videos/tracteur-nettoyage-btp.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className={styles.panelOverlay} aria-hidden="true" />
          <div className={styles.panelContent}>
            <span className={styles.panelLabel}>Espace Professionnel</span>
            <span className={styles.panelSub}>Flottes, BTP, engins agricoles</span>
            <span className={styles.panelCta}>
              Entrer
              <IconArrowRight size={16} />
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}
