'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './BeforeAfterSlider.module.css'
import { IconMotion } from './Icons'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function BeforeAfterSlider({ before, after, alt }) {
  const [pos, setPos] = useState(50)
  const [motionSupported, setMotionSupported] = useState(false)
  const [motionActive, setMotionActive] = useState(false)

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'DeviceOrientationEvent' in window &&
      window.matchMedia('(pointer: coarse)').matches
    setMotionSupported(supported)
  }, [])

  useEffect(() => {
    if (!motionActive) return

    let baseline = null

    function onOrientation(e) {
      const gamma = e.gamma // left/right tilt, roughly -90..90
      if (gamma === null) return
      if (baseline === null) baseline = gamma
      const delta = gamma - baseline
      const next = clamp(50 + delta * 2.2, 0, 100)
      setPos(next)
    }

    window.addEventListener('deviceorientation', onOrientation)
    return () => window.removeEventListener('deviceorientation', onOrientation)
  }, [motionActive])

  async function toggleMotion() {
    if (motionActive) {
      setMotionActive(false)
      setPos(50)
      return
    }

    const DOE = window.DeviceOrientationEvent
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission()
        if (result === 'granted') setMotionActive(true)
      } catch {
        setMotionActive(false)
      }
    } else {
      setMotionActive(true)
    }
  }

  return (
    <div className={styles.wrap} style={{ '--pos': `${pos}%` }}>
      <div className={styles.layer}>
        <Image src={after} alt={`${alt} — après intervention`} fill sizes="(max-width: 768px) 90vw, 480px" />
      </div>
      <div className={`${styles.layer} ${styles.beforeLayer}`}>
        <Image src={before} alt={`${alt} — avant intervention`} fill sizes="(max-width: 768px) 90vw, 480px" />
      </div>

      <span className={`${styles.tag} ${styles.tagBefore}`}>Avant</span>
      <span className={`${styles.tag} ${styles.tagAfter}`}>Après</span>

      <div className={styles.handle}>
        <div className={styles.handleLine} />
        <div className={styles.handleGrip}>
          <span />
          <span />
        </div>
      </div>

      <input
        type="range"
        className={styles.range}
        min={0}
        max={100}
        value={pos}
        onChange={(e) => {
          setMotionActive(false)
          setPos(Number(e.target.value))
        }}
        aria-label={`Curseur de comparaison avant / après — ${alt}`}
      />

      {motionSupported && (
        <button
          type="button"
          className={`${styles.motionBtn} ${motionActive ? styles.motionBtnActive : ''}`}
          onClick={toggleMotion}
        >
          <IconMotion size={14} />
          {motionActive ? 'Mouvement actif' : 'Incliner le téléphone'}
        </button>
      )}
    </div>
  )
}
