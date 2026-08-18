'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import Image from 'next/image'
import styles from './Preloader.module.css'

const WORDMARK = 'LA CLEAN COMPAGNY'

// Décélération douce ("expo-out") pour toutes les arrivées — lecture premium,
// sans rebond ni à-coup. Courbe théâtrale plus marquée pour l'ouverture finale.
const EASE_DECEL = [0.16, 1, 0.3, 1]
const EASE_THEATRICAL = [0.85, 0, 0.15, 1]

const letterVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

// Phase 1 — compteur 0 → 100 %, courbe à décélération fluide, barre de
// progression liée à la même valeur animée (aucun état dupliqué).
function Counter({ reduceMotion }) {
  const count = useMotionValue(0)
  const width = useTransform(count, (v) => `${v}%`)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(count, 100, {
      duration: reduceMotion ? 0.01 : 1.5,
      ease: EASE_DECEL,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return controls.stop
  }, [count, reduceMotion])

  return (
    <div className={styles.counterWrap}>
      <div className={styles.counterRow}>
        <span className={styles.counterNumber}>{display}</span>
        <span className={styles.counterPercent}>%</span>
      </div>
      <div className={styles.progressTrack}>
        <motion.div className={styles.progressBar} style={{ width }} />
      </div>
    </div>
  )
}

export default function Preloader({ phase }) {
  const reduceMotion = useReducedMotion()
  const isExiting = phase === 'exit'
  const d = (value) => (reduceMotion ? 0.01 : value)

  return (
    <div className={styles.stage} role="status" aria-live="polite">
      <span className={styles.srOnly}>Chargement de La Clean Compagny…</span>

      {/* Portes façon garage premium : se séparent au moment de la révélation. */}
      <motion.div
        className={styles.halfTop}
        animate={{ y: isExiting ? '-100%' : '0%' }}
        transition={{ duration: d(1), ease: EASE_THEATRICAL }}
      />
      <motion.div
        className={styles.halfBottom}
        animate={{ y: isExiting ? '100%' : '0%' }}
        transition={{ duration: d(1), ease: EASE_THEATRICAL }}
      />

      <div className={styles.center}>
        <AnimatePresence mode="wait">
          {phase === 'counter' ? (
            <motion.div
              key="counter"
              exit={{ opacity: 0, y: -20, transition: { duration: d(0.35), ease: EASE_DECEL } }}
            >
              <Counter reduceMotion={reduceMotion} />
            </motion.div>
          ) : (
            <motion.div
              key="brand"
              className={styles.brand}
              animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 0.96 : 1 }}
              transition={{ duration: isExiting ? d(0.45) : d(0.3), ease: EASE_DECEL }}
            >
              <div className={styles.logoMask}>
                <motion.div
                  className={styles.logoInner}
                  initial={{ clipPath: 'inset(0% 0 100% 0)', y: 24 }}
                  animate={{ clipPath: 'inset(0% 0 0% 0)', y: 0 }}
                  transition={{ duration: d(0.9), ease: EASE_DECEL }}
                >
                  <Image
                    src="/images/logo/logo-new.png"
                    alt=""
                    width={280}
                    height={188}
                    priority
                    className={styles.logo}
                  />
                </motion.div>
              </div>

              <motion.span
                className={styles.wordmark}
                initial="hidden"
                animate="visible"
                transition={{ delayChildren: d(0.55), staggerChildren: d(0.025) }}
              >
                {WORDMARK.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    transition={{ duration: d(0.4), ease: EASE_DECEL }}
                    className={styles.letter}
                  >
                    {char === ' ' ? ' ' : char}
                  </motion.span>
                ))}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
