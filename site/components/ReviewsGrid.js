import styles from './ReviewsGrid.module.css'
import { IconStar } from './Icons'

export default function ReviewsGrid({ reviews }) {
  return (
    <div className={styles.grid}>
      {reviews.map((review) => (
        <div className={styles.card} key={review.author}>
          <div className={styles.stars} aria-hidden="true">
            {Array.from({ length: review.rating }).map((_, i) => (
              <IconStar key={i} size={16} />
            ))}
          </div>
          <p className={styles.text}>&laquo; {review.text} &raquo;</p>
          <span className={styles.author}>{review.author}</span>
        </div>
      ))}
    </div>
  )
}
