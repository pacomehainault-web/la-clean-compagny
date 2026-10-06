import Image from 'next/image'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import ServiceCard from '@/components/ServiceCard'
import PricingMatrixTable from '@/components/PricingMatrixTable'
import SubscriptionSection from '@/components/SubscriptionSection'
import { IconArrowRight, IconCheck } from '@/components/Icons'
import { OZONE_TREATMENT, ALL_SERVICES } from '@/lib/data/services'
import {
  FORMULAS_PRICING,
  EXTERIOR_PRICING,
  CORRECTION_PRICING,
  CORRECTION_PRESTIGE,
  LUSTRAGE_MINUTE_HIGHLIGHT,
  PRICING_NOTES,
  OPTICS_PRICING,
  ADDITIONAL_CARE,
  PRESTIGE_SECTION,
  PRICING_TERMS,
} from '@/lib/data/pricing'
import { telLink, CONTACT, SITE } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Prestations & tarifs — Detailing automobile à Angers',
  description:
    "Grille tarifaire complète par gabarit : Coup de Propre, Sortie de Concession, lavage, décontamination, lustrage, correction, rénovation optiques et abonnements d’entretien. Tarifs transparents, à partir de.",
  path: '/prestations',
})

// Services de la carte historique non couverts par la nouvelle grille tarifaire
// par gabarit (traitement céramique, nettoyage moteur) : toujours sur devis.
const REMAINING_ON_REQUEST = ALL_SERVICES.filter((s) => ['ceramique', 'nettoyage-moteur'].includes(s.id))

export default function PrestationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Prestations & tarifs"
        title="Des prestations sur-mesure, un tarif toujours transparent"
        lead="Nos tarifs dépendent du gabarit de votre véhicule et de son état initial. Voici l'intégralité de notre grille, prestation par prestation."
        breadcrumb={[{ label: 'Prestations' }]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Formules habitacle</span>
            <h2>Nos deux formules principales</h2>
          </div>
          <PricingMatrixTable services={FORMULAS_PRICING} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Extérieur</span>
            <h2>Lavage &amp; décontamination</h2>
          </div>
          <PricingMatrixTable services={EXTERIOR_PRICING} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Brillance</span>
            <h2>Lustrage &amp; correction</h2>
          </div>
          <PricingMatrixTable services={CORRECTION_PRICING} />

          <div className={styles.highlightRow}>
            <div className={styles.highlightCard}>
              <span className={styles.highlightLabel}>À la une</span>
              <div className={styles.highlightTop}>
                <h3>{LUSTRAGE_MINUTE_HIGHLIGHT.name}</h3>
                <span className={styles.highlightPrice}>à partir de {LUSTRAGE_MINUTE_HIGHLIGHT.fromPrice} €</span>
              </div>
              <p>{LUSTRAGE_MINUTE_HIGHLIGHT.description}</p>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightTop}>
                <h3>{CORRECTION_PRESTIGE.name}</h3>
                <span className={styles.highlightPrice}>à partir de {CORRECTION_PRESTIGE.fromPrice} €</span>
              </div>
              <p>{CORRECTION_PRESTIGE.description}</p>
            </div>
          </div>

          <p className={styles.inlineNote}>
            <IconCheck size={16} />
            {PRICING_NOTES.decontaminationInLustrage}
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Prestations spécifiques</span>
            <h2>Rénovation optiques &amp; soins complémentaires</h2>
          </div>

          <div className={styles.opticsAndCare}>
            <div className={styles.opticsCard}>
              <h3>{OPTICS_PRICING.name}</h3>
              <p className={styles.opticsUnit}>
                À partir de <strong>{OPTICS_PRICING.fromPrice} €</strong> {OPTICS_PRICING.unit}
              </p>
              <div className={styles.opticsLevels}>
                {OPTICS_PRICING.levels.map((level) => (
                  <div className={styles.opticsLevelRow} key={level.id}>
                    <span>{level.label}</span>
                    <strong>dès {level.price} €</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.careCard}>
              <h3>Soins &amp; prestations complémentaires</h3>
              <div className={styles.careTableWrap}>
                <table className={styles.careTable}>
                  <tbody>
                    {ADDITIONAL_CARE.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td className={styles.carePriceCell}>
                          {item.priceOnRequest ? 'Sur devis' : `dès ${item.price} €`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <p className={styles.careFootnote}>
            Les prestations complémentaires peuvent être ajoutées aux formules ou réalisées
            indépendamment.
          </p>

          {REMAINING_ON_REQUEST.length > 0 && (
            <>
              <div className={styles.sectionHead} style={{ marginTop: 56 }}>
                <span className="eyebrow">Sur devis</span>
                <h2>Autres prestations</h2>
              </div>
              <div className={styles.serviceGrid}>
                {REMAINING_ON_REQUEST.map((s) => (
                  <ServiceCard service={s} key={s.id} />
                ))}
                <ServiceCard service={OZONE_TREATMENT} />
              </div>
            </>
          )}
        </div>
      </section>

      <SubscriptionSection />

      <section className="section" id="prestige">
        <div className="container">
          <div className={styles.prestigeBanner}>
            <div className={styles.prestigeImage}>
              <Image
                src="/images/exterieur/ferrari-jaune-lavage-mousse-angers.jpg"
                alt="Ferrari jaune recouverte de mousse active lors d'un lavage prestige La Clean Compagny"
                fill
                sizes="(max-width: 900px) 100vw, 1100px"
              />
            </div>
            <div className={styles.prestigeContent}>
              <span className="eyebrow">{PRESTIGE_SECTION.eyebrow}</span>
              <h2 style={{ marginTop: 14 }}>{PRESTIGE_SECTION.title}</h2>
              <p className={styles.prestigeBrands}>{PRESTIGE_SECTION.brands.join(' · ')}</p>
              <p className="lead" style={{ marginTop: 20, maxWidth: 640, marginInline: 'auto' }}>
                {PRESTIGE_SECTION.text}
              </p>
              <div className={styles.prestigePriceRow}>
                <span>à partir de</span>
                <strong>{PRESTIGE_SECTION.fromPrice} €</strong>
              </div>
              <p className={styles.prestigeNote}>{PRESTIGE_SECTION.note}</p>
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/devis" className="btn btn-cta">
                  Demander mon devis Prestige
                  <IconArrowRight size={18} />
                </Link>
                <a href={telLink()} className="btn btn-outline">
                  {CONTACT.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.ctaBanner}>
            <span className="eyebrow">Passons à l&apos;étape suivante</span>
            <h2>Composez votre devis en quelques clics</h2>
            <p className="lead">
              Sélectionnez votre véhicule et vos prestations pour recevoir une estimation
              immédiate.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/devis" className="btn btn-cta">
                Voir les tarifs et réserver
                <IconArrowRight size={18} />
              </Link>
              <a href={telLink()} className="btn btn-outline">
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>

          <div className={styles.terms}>
            <p className={styles.termsTitle}>Conditions tarifaires</p>
            <ul>
              {PRICING_TERMS.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
            <p className={styles.termsVat}>{SITE.vatNote}.</p>
          </div>
        </div>
      </section>
    </>
  )
}
