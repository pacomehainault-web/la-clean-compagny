import Link from 'next/link'
import styles from './SubscriptionSection.module.css'
import { IconCheck, IconWhatsapp } from './Icons'
import { FORMULAS, QUARTERLY_SUBSCRIPTION } from '@/lib/data/services'
import { whatsappLink } from '@/lib/constants'

export default function SubscriptionSection() {
  const coupDePropre = FORMULAS.find((f) => f.id === 'coup-de-propre')
  const example = QUARTERLY_SUBSCRIPTION.exampleComplementaryService

  const unitTotal = coupDePropre.basePrice * 2 + example.basePrice
  const subscriptionPrice = Math.round(unitTotal * (1 - QUARTERLY_SUBSCRIPTION.discountPercent / 100))
  const savings = unitTotal - subscriptionPrice

  const whatsappMessage = `Bonjour, je suis intéressé(e) par l'abonnement ${QUARTERLY_SUBSCRIPTION.name} (trimestriel). Pouvez-vous m'en dire plus ?`

  return (
    <section className="section section-alt">
      <div className="container">
        <div className={styles.sectionHead}>
          <span className="eyebrow">{QUARTERLY_SUBSCRIPTION.eyebrow}</span>
          <h2 style={{ marginTop: 14 }}>{QUARTERLY_SUBSCRIPTION.name}</h2>
          <p className="lead" style={{ marginTop: 14, maxWidth: 560 }}>
            {QUARTERLY_SUBSCRIPTION.tagline}
          </p>
        </div>

        <div className={styles.card}>
          <span className={styles.ribbon}>{QUARTERLY_SUBSCRIPTION.durationMonths} mois</span>

          <div className={styles.layout}>
            <div>
              <div className={styles.priceRow}>
                <span className={styles.price}>{subscriptionPrice} €</span>
                <span className={styles.priceUnit}>/ trimestre</span>
              </div>
              <div className={styles.priceCompare}>
                <span className={styles.priceStrike}>{unitTotal} €</span>à l&apos;unité — soit{' '}
                {QUARTERLY_SUBSCRIPTION.discountPercent} % d&apos;économie (≈ {savings} €)
              </div>

              <ul className={styles.includes}>
                <li>
                  <IconCheck size={16} />
                  2 entretiens complets Coup de Propre (répartis sur le trimestre)
                </li>
                <li>
                  <IconCheck size={16} />
                  <span>
                    1{' '}
                    <a href="#prestations-complementaires" className={styles.inlineLink}>
                      <strong>prestation complémentaire</strong>
                    </a>{' '}
                    au choix, incluse avec la même remise
                  </span>
                </li>
                <li>
                  <IconCheck size={16} />
                  {QUARTERLY_SUBSCRIPTION.discountPercent} % de remise sur l&apos;ensemble par
                  rapport au tarif payé à l&apos;unité
                </li>
              </ul>
            </div>

            <div className={styles.actionCol}>
              <div className={styles.actions}>
                <a
                  href={whatsappLink(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-cta btn-block"
                >
                  <IconWhatsapp size={18} />
                  Souscrire à l&apos;abonnement
                </a>
                <Link href="/contact" className="btn btn-outline btn-block">
                  Être recontacté(e)
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className={styles.b2bNote}>
          Vous gérez une flotte de véhicules ? <Link href="/contact">Contactez-nous</Link> pour une
          offre entreprise sur-mesure.
        </p>
      </div>
    </section>
  )
}
