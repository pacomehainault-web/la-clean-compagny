'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './BeforeAfterSlider.module.css'

export default function BeforeAfterSlider({ before, after, alt }) {
  const [pos, setPos] = useState(50)

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
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Curseur de comparaison avant / après — ${alt}`}
      />
    </div>
  )
}
