'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Preloader from './Preloader'

const STORAGE_KEY = 'lcc-intro-seen'

// Budget de la chorégraphie, en millisecondes. Partagé avec les composants qui
// doivent s'y synchroniser (HeroMedia, pour le parallax déclenché au moment
// exact de l'ouverture du splash) — une seule source de vérité pour le timing.
export const INTRO_PHASE_MS = {
  counter: 1600, // Phase 1 — compteur 0 → 100 %
  reveal: 1700, // Phase 2 — masque du logo + stagger du nom
  exit: 1100, // Phase 3 — ouverture façon porte de garage
}

const IntroContext = createContext({ playIntro: false, phase: 'done' })

export function useIntro() {
  return useContext(IntroContext)
}

// Orchestrateur unique de l'intro : décide si elle doit jouer (première visite
// de la session), pilote la machine à états des 3 phases, verrouille le
// scroll pendant que le splash est actif, et fournit ce contexte à tous ses
// descendants (le splash lui-même, mais aussi HeroMedia pour le parallax).
export default function IntroSequence({ children }) {
  const [playIntro, setPlayIntro] = useState(false)
  const [phase, setPhase] = useState('counter') // counter -> reveal -> exit -> done

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        sessionStorage.setItem(STORAGE_KEY, '1')
        setPlayIntro(true)
      }
    } catch {
      // sessionStorage indisponible (navigation privée stricte…) : pas d'intro
      // plutôt que de bloquer l'accès au site.
    }
  }, [])

  useEffect(() => {
    if (!playIntro) return
    const t1 = window.setTimeout(() => setPhase('reveal'), INTRO_PHASE_MS.counter)
    const t2 = window.setTimeout(() => setPhase('exit'), INTRO_PHASE_MS.counter + INTRO_PHASE_MS.reveal)
    const t3 = window.setTimeout(
      () => setPhase('done'),
      INTRO_PHASE_MS.counter + INTRO_PHASE_MS.reveal + INTRO_PHASE_MS.exit
    )
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [playIntro])

  useEffect(() => {
    const active = playIntro && phase !== 'done'
    document.body.style.overflow = active ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [playIntro, phase])

  return (
    <IntroContext.Provider value={{ playIntro, phase }}>
      {playIntro && phase !== 'done' && <Preloader phase={phase} />}
      {children}
    </IntroContext.Provider>
  )
}
