import styles from './ServiceCard.module.css'

export default function ServiceCard({ service }) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.name}>{service.name}</span>
        <span className={styles.price}>
          dès
          <strong>{service.basePrice} €</strong>
        </span>
      </div>
      <p className={styles.description}>{service.description}</p>
    </div>
  )
}
