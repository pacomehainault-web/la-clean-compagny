import Link from 'next/link'
import styles from './FormulaCard.module.css'
import { IconCheck, IconClock } from './Icons'

export default function FormulaCard({ formula }) {
  return (
    <div className={`${styles.card} ${formula.featured ? styles.featured : ''}`}>
      {formula.featured && <span className={styles.ribbon}>{formula.ribbonLabel || 'La plus complète'}</span>}
      <div className={styles.head}>
        <h3>{formula.name}</h3>
        <span className={styles.tagline}>{formula.tagline}</span>
      </div>

      {formula.promo && <span className={styles.promoBadge}>🎁 {formula.promo}</span>}

      <div>
        <div className={styles.priceRow}>
          <span className={styles.priceFrom}>à partir de</span>
          <span className={styles.price}>{formula.basePrice} €</span>
        </div>
        <div className={styles.duration}>
          <IconClock size={14} style={{ verticalAlign: '-2px', marginRight: 5 }} />
          {formula.duration}
        </div>
      </div>

      <p className={styles.description}>{formula.description}</p>

      <ul className={styles.includes}>
        {formula.includes.map((item) => (
          <li key={item}>
            <IconCheck size={16} />
            {item}
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Link href={`/devis?formule=${formula.id}`} className="btn btn-cta btn-sm">
          Réserver cette formule
        </Link>
        <Link href="/prestations" className="btn btn-ghost btn-sm">
          Voir le détail
        </Link>
      </div>
    </div>
  )
}
