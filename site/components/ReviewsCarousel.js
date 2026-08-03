'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './ReviewsCarousel.module.css'
import { IconStar, IconGoogleG, IconChevronRight } from './Icons'
import { AGGREGATE_RATING } from '@/lib/data/reviews'

export default function ReviewsCarousel({ reviews }) {
  const trackRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  function updateEdges() {
    const track = trackRef.current
    if (!track) return
    setAtStart(track.scrollLeft <= 4)
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4)
  }

  useEffect(() => {
    updateEdges()
    const track = trackRef.current
    if (!track) return
    track.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      track.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [reviews])

  function scrollBy(direction) {
    const track = trackRef.current
    if (!track) return
    const cardWidth = track.firstElementChild?.getBoundingClientRect().width || 340
    track.scrollBy({ left: direction * (cardWidth + 20), behavior: 'smooth' })
  }

  return (
    <div>
      <div className={styles.top}>
        <div className={styles.ratingBadge}>
          <IconGoogleG size={22} />
          <div className={styles.stars} aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar key={i} size={15} />
            ))}
          </div>
          <span className={styles.ratingValue}>{AGGREGATE_RATING.ratingValue.toFixed(1)}</span>
          <span className={styles.ratingCount}>({AGGREGATE_RATING.reviewCount} avis Google)</span>
        </div>
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scrollBy(-1)}
            disabled={atStart}
            aria-label="Avis précédents"
          >
            <IconChevronRight style={{ transform: 'rotate(180deg)' }} size={18} />
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scrollBy(1)}
            disabled={atEnd}
            aria-label="Avis suivants"
          >
            <IconChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className={styles.trackWrap}>
        <div className={`${styles.edgeFade} ${styles.edgeFadeLeft} ${atStart ? styles.edgeFadeHidden : ''}`} aria-hidden="true" />
        <div className={styles.track} ref={trackRef}>
          {reviews.map((review) => {
            const hasPhotos = review.photos && review.photos.length > 0
            return (
              <div className={`${styles.card} ${hasPhotos ? styles.cardWithPhoto : ''}`} key={review.author}>
                {hasPhotos && (
                  <div className={styles.photoGrid}>
                    <span className={styles.photoBadge}>
                      <span aria-hidden="true">📸</span> Photo du client
                    </span>
                    {review.photos.map((src, i) => (
                      <div className={styles.photoThumb} key={src}>
                        <Image
                          src={src}
                          alt={`Photo du véhicule envoyée par ${review.author}`}
                          fill
                          sizes="200px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.cardTop}>
                  <div className={styles.cardStars} aria-hidden="true">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <IconStar key={i} size={15} />
                    ))}
                  </div>
                  <IconGoogleG size={18} />
                </div>
                <p className={styles.text}>&laquo; {review.text} &raquo;</p>
                <span className={styles.author}>{review.author}</span>
              </div>
            )
          })}
        </div>
        <div className={`${styles.edgeFade} ${styles.edgeFadeRight} ${atEnd ? styles.edgeFadeHidden : ''}`} aria-hidden="true" />
      </div>
    </div>
  )
}
