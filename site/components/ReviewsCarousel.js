'use client'

import { useRef } from 'react'
import styles from './ReviewsCarousel.module.css'
import { IconStar, IconGoogleG, IconChevronRight } from './Icons'
import { AGGREGATE_RATING } from '@/lib/data/reviews'

export default function ReviewsCarousel({ reviews }) {
  const trackRef = useRef(null)

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
          <button type="button" className={styles.arrow} onClick={() => scrollBy(-1)} aria-label="Avis précédents">
            <IconChevronRight style={{ transform: 'rotate(180deg)' }} size={18} />
          </button>
          <button type="button" className={styles.arrow} onClick={() => scrollBy(1)} aria-label="Avis suivants">
            <IconChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className={styles.track} ref={trackRef}>
        {reviews.map((review) => (
          <div className={styles.card} key={review.author}>
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
        ))}
      </div>
    </div>
  )
}
