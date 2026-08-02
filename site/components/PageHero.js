import Link from 'next/link'
import styles from './PageHero.module.css'

export default function PageHero({ eyebrow, title, lead, breadcrumb }) {
  return (
    <section className={styles.hero}>
      <div className="container">
        {breadcrumb && (
          <div className={styles.breadcrumb}>
            <Link href="/">Accueil</Link>
            {breadcrumb.map((item) => (
              <span key={item.label}>
                {' '}
                / {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
              </span>
            ))}
          </div>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {lead && <p className={`lead ${styles.lead}`}>{lead}</p>}
      </div>
    </section>
  )
}
