import Link from 'next/link'
import styles from './SubscriptionSection.module.css'
import { IconCheck, IconWhatsapp } from './Icons'
import { PASS_TIERS, PASS_6_MOIS, PASS_3_MOIS } from '@/lib/data/pricing'
import { whatsappLink } from '@/lib/constants'

const PASSES = [PASS_6_MOIS, PASS_3_MOIS]

export default function SubscriptionSection() {
  return (
    <section className="section section-alt">
      <div className="container">
        <div className={styles.sectionHead}>
          <span className="eyebrow">Abonnements</span>
          <h2 style={{ marginTop: 14 }}>Les Pass Entretien</h2>
          <p className="lead" style={{ marginTop: 14, maxWidth: 620 }}>
            Deux façons de garder votre véhicule impeccable toute l&apos;année, sans avoir à y
            repenser à chaque fois.
          </p>
        </div>

        <div className={styles.grid}>
          {PASSES.map((pass, index) => {
            const message = `Bonjour, je suis intéressé(e) par le ${pass.name} (${pass.subtitle}). Pouvez-vous m'en dire plus ?`
            const featured = index === 1

            return (
              <div className={`${styles.card} ${featured ? styles.cardFeatured : ''}`} key={pass.id}>
                <span className={styles.badge}>
                  <span aria-hidden="true">{pass.eyebrow}</span> {pass.badge}
                </span>
                <h3>{pass.name}</h3>
                <p className={styles.tagline}>{pass.subtitle}</p>
                <p className={styles.frequency}>{pass.frequency}</p>
                <p className={styles.description}>{pass.description}</p>

                <div className={styles.includesBlock}>
                  <span className={styles.includesTitle}>Comprend :</span>
                  <ul className={styles.includes}>
                    {pass.includes.map((item) => (
                      <li key={item}>
                        <IconCheck size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.tierPrices}>
                  <span className={styles.tierPricesTitle}>{pass.pricesLabel}</span>
                  {PASS_TIERS.map((tier) => (
                    <div className={styles.tierPriceRow} key={tier.id}>
                      <span>
                        <span aria-hidden="true">{tier.emoji}</span> {tier.label}
                      </span>
                      <strong>{pass.prices[tier.id]} € / {pass.period}</strong>
                    </div>
                  ))}
                  <div className={styles.tierPriceRow}>
                    <span>
                      <span aria-hidden="true">🏎️</span> Prestige / Collection
                    </span>
                    <strong>Sur devis</strong>
                  </div>
                </div>

                <div className={styles.actions}>
                  <a
                    href={whatsappLink(message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-cta btn-block"
                  >
                    <IconWhatsapp size={18} />
                    Souscrire au {pass.name}
                  </a>
                  <Link href="/contact" className="btn btn-outline btn-block">
                    Être recontacté(e)
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <p className={styles.b2bNote}>
          Vous gérez une flotte de véhicules ? <Link href="/pro">Découvrez notre espace Pro</Link>{' '}
          pour une offre entreprise sur-mesure.
        </p>
      </div>
    </section>
  )
}
