import styles from './StatsRow.module.css'

export default function StatsRow({ stats }) {
  return (
    <div className={styles.row}>
      {stats.map((s) => (
        <div className={styles.stat} key={s.label}>
          <div className={styles.value}>{s.value}</div>
          <div className={styles.label}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
