import styles from './ReviewCards.module.css'
import { IconStar, IconGoogleG } from './Icons'
import { REVIEWS, AGGREGATE_RATING } from '@/lib/data/reviews'
import { CONTACT } from '@/lib/constants'

// 3 vrais avis Google (hors famille du gérant), décalés selon `offset` pour
// que deux pages n'affichent pas les mêmes, + lien vers tous les avis.
const POOL = REVIEWS.filter((r) => r.text.length > 90 && !r.author.includes('Soldet'))

export default function ReviewCards({ offset = 0, count = 3 }) {
  const picks = Array.from({ length: Math.min(count, POOL.length) }, (_, i) => POOL[(offset + i) % POOL.length])
  return (
    <>
      <div className={styles.grid}>
        {picks.map((r) => (
          <figure className={styles.card} key={r.author}>
            <div className={styles.stars} aria-label={`${r.rating} étoiles sur 5`}>
              {Array.from({ length: r.rating }, (_, i) => (
                <IconStar size={14} key={i} />
              ))}
            </div>
            <blockquote>{r.text}</blockquote>
            <figcaption>{r.author}</figcaption>
          </figure>
        ))}
      </div>
      <a href={CONTACT.googleMapsCidUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
        <IconGoogleG size={16} /> Lire les {AGGREGATE_RATING.reviewCount} avis sur Google
      </a>
    </>
  )
}
