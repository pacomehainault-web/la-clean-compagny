'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './MotoSlider.module.css'

const INTERVAL_MS = 4000
const FADE_MS = 1100

export default function MotoSlider({ images, sizes }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (images.length < 2) return
    // Respecte la préférence système "mouvement réduit" : les images restent
    // affichées (la première), simplement sans défilement automatique.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <div className={styles.slider}>
      {images.map((img, index) => (
        <div
          key={img.src}
          className={`${styles.slide} ${index === activeIndex ? styles.slideActive : ''}`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          aria-hidden={index !== activeIndex}
        >
          <Image src={img.src} alt={img.alt} fill sizes={sizes} priority={index === 0} />
        </div>
      ))}

      <div className={styles.dots} aria-hidden="true">
        {images.map((img, index) => (
          <span key={img.src} className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
