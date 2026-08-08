import Link from 'next/link'
import Image from 'next/image'
import styles from './SubscriptionSection.module.css'
import { IconCheck, IconWhatsapp } from './Icons'
import { VEHICLE_TIERS, PRICED_TIER_IDS, PASS_TRIMESTRIEL, PASS_ANNUEL } from '@/lib/data/pricing'
import { whatsappLink } from '@/lib/constants'

const PRICED_TIERS = VEHICLE_TIERS.filter((t) => PRICED_TIER_IDS.includes(t.id))

export default function SubscriptionSection() {
  const trimestrielMessage = `Bonjour, je suis intéressé(e) par le ${PASS_TRIMESTRIEL.name} (${PASS_TRIMESTRIEL.price} € / ${PASS_TRIMESTRIEL.period}). Pouvez-vous m'en dire plus ?`
  const annuelMessage = `Bonjour, je suis intéressé(e) par le ${PASS_ANNUEL.name}. Pouvez-vous m'en dire plus ?`

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
          <div className={styles.card}>
            <span className={styles.badge}>Trimestriel</span>
            <h3>{PASS_TRIMESTRIEL.name}</h3>
            <div className={styles.priceRow}>
              <span className={styles.price}>{PASS_TRIMESTRIEL.price} €</span>
              <span className={styles.priceUnit}>/ {PASS_TRIMESTRIEL.period}</span>
            </div>

            <ul className={styles.includes}>
              {PASS_TRIMESTRIEL.includes.map((item) => (
                <li key={item}>
                  <IconCheck size={16} />
                  {item}
                </li>
              ))}
            </ul>

            <div className={styles.trimestrielImage}>
              <Image
                src="/images/lustrage/lustrage-showroom.jpg"
                alt="Véhicule parfaitement propre après un entretien La Clean Compagny"
                fill
                sizes="(max-width: 800px) 90vw, 420px"
              />
            </div>

            <div className={styles.actions}>
              <a
                href={whatsappLink(trimestrielMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-cta btn-block"
              >
                <IconWhatsapp size={18} />
                Souscrire au Pass Trimestriel
              </a>
              <Link href="/contact" className="btn btn-outline btn-block">
                Être recontacté(e)
              </Link>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardFeatured}`}>
            <span className={styles.badge}>Annuel</span>
            <h3>{PASS_ANNUEL.name}</h3>
            <p className={styles.tagline}>{PASS_ANNUEL.tagline}</p>

            <div className={styles.tierPrices}>
              {PRICED_TIERS.map((tier) => (
                <div className={styles.tierPriceRow} key={tier.id}>
                  <span>
                    <span aria-hidden="true">{tier.emoji}</span> {tier.label}
                  </span>
                  <strong>{PASS_ANNUEL.prices[tier.id]} € / an</strong>
                </div>
              ))}
              <div className={styles.tierPriceRow}>
                <span>
                  <span aria-hidden="true">🏎️</span> Prestige / Collection
                </span>
                <strong>Sur devis</strong>
              </div>
            </div>

            <ul className={styles.includes}>
              {PASS_ANNUEL.includes.map((item) => (
                <li key={item}>
                  <IconCheck size={16} />
                  {item}
                </li>
              ))}
            </ul>

            <p className={styles.commitmentNote}>{PASS_ANNUEL.commitmentNote}</p>

            <div className={styles.actions}>
              <a
                href={whatsappLink(annuelMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-cta btn-block"
              >
                <IconWhatsapp size={18} />
                Souscrire au Pass Annuel
              </a>
              <Link href="/contact" className="btn btn-outline btn-block">
                Être recontacté(e)
              </Link>
            </div>
          </div>
        </div>

        <p className={styles.b2bNote}>
          Vous gérez une flotte de véhicules ? <Link href="/pro">Découvrez notre espace Pro</Link>{' '}
          pour une offre entreprise sur-mesure.
        </p>
      </div>
    </section>
  )
}
