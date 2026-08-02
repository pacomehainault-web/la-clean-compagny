'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './PhotoGallery.module.css'
import { IconClose, IconChevronRight } from './Icons'

export default function PhotoGallery({ photos }) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const open = activeIndex >= 0

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') setActiveIndex(-1)
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % photos.length)
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, photos.length])

  return (
    <>
      <div className={styles.grid}>
        {photos.map((photo, index) => (
          <button
            type="button"
            key={photo.src}
            className={styles.thumb}
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 800px) 45vw, 320px"
            />
            <span className={styles.caption}>{photo.caption || photo.alt}</span>
          </button>
        ))}
      </div>

      {open && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" onClick={() => setActiveIndex(-1)}>
          <button
            type="button"
            className={styles.close}
            onClick={() => setActiveIndex(-1)}
            aria-label="Fermer"
          >
            <IconClose />
          </button>
          <button
            type="button"
            className={styles.prev}
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex((i) => (i - 1 + photos.length) % photos.length)
            }}
            aria-label="Photo précédente"
          >
            <IconChevronRight style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div className={styles.lightboxImageWrap} onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[activeIndex].src}
              alt={photos[activeIndex].alt}
              fill
              sizes="90vw"
            />
            <span className={styles.lightboxCaption}>{photos[activeIndex].caption || photos[activeIndex].alt}</span>
          </div>
          <button
            type="button"
            className={styles.next}
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex((i) => (i + 1) % photos.length)
            }}
            aria-label="Photo suivante"
          >
            <IconChevronRight />
          </button>
        </div>
      )}
    </>
  )
}
