'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { useIntro } from './IntroSequence'
import styles from './HeroMedia.module.css'

const EASE_DECEL = [0.16, 1, 0.3, 1]

// Effet de profondeur synchronisé sur l'ouverture du splash : l'image démarre
// légèrement zoomée (110-112%) et revient à sa taille normale exactement
// quand les "portes de garage" du Preloader s'écartent (phase 'exit').
//
// Le zoom initial n'est appliqué QUE si l'intro joue réellement (playIntro) —
// une visite déjà vue dans la session affiche l'image à sa taille normale,
// sans transition. Tous les changements qui se produisent pendant que le
// splash recouvre encore l'écran sont instantanés (duration 0) : ils ne sont
// jamais visibles, seule la bascule au moment de la révélation est animée.
export default function HeroMedia({ src, alt }) {
  const { playIntro, phase } = useIntro()
  const reduceMotion = useReducedMotion()
  const revealed = phase === 'exit' || phase === 'done'
  const targetScale = playIntro && !revealed ? 1.1 : 1
  const animateReveal = playIntro && revealed && !reduceMotion

  return (
    <motion.div
      className={styles.wrap}
      initial={false}
      animate={{ scale: targetScale }}
      transition={animateReveal ? { duration: 1.4, ease: EASE_DECEL } : { duration: 0 }}
    >
      <Image src={src} alt={alt} fill sizes="100vw" priority quality={85} className={styles.image} />
    </motion.div>
  )
}
