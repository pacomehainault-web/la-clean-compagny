import Image from 'next/image'
import styles from './StaticBeforeAfterGallery.module.css'

// Galerie de résultats "avant/après" purement statique (pas de curseur à glisser) :
// affiche plusieurs paires côte à côte pour montrer davantage de résultats d'un
// coup d'œil. Complémentaire du <BeforeAfterSlider /> interactif, pas un remplacement.
export default function StaticBeforeAfterGallery({ pairs }) {
  return (
    <div className={styles.grid}>
      {pairs.map((p, i) => (
        <div className={`${styles.card} ${i === 0 ? styles.cardLarge : ''}`} key={p.id ?? p.before}>
          <div className={styles.images}>
            <div className={styles.image}>
              <Image src={p.before} alt={`${p.alt} — avant`} fill sizes="(max-width: 700px) 45vw, 260px" />
              <span className={styles.tag}>Avant</span>
            </div>
            <div className={styles.image}>
              <Image src={p.after} alt={`${p.alt} — après`} fill sizes="(max-width: 700px) 45vw, 260px" />
              <span className={`${styles.tag} ${styles.tagAfter}`}>Après</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
