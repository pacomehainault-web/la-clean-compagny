import Link from 'next/link'
import PageHero from '@/components/PageHero'
import FormulaCard from '@/components/FormulaCard'
import ServiceCard from '@/components/ServiceCard'
import { IconArrowRight } from '@/components/Icons'
import { FORMULAS, COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT } from '@/lib/data/services'
import { telLink, CONTACT, SITE } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Prestations & tarifs — Detailing automobile à Angers',
  description:
    "Découvrez nos formules Coup de Propre et Sortie de Concession, ainsi que nos prestations complémentaires : polissage, lustrage, traitement céramique, rénovation optiques, désinfection à l'ozone.",
  path: '/prestations',
})

export default function PrestationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Prestations & tarifs"
        title="Des prestations sur-mesure, un tarif toujours transparent"
        lead="Deux formules pensées pour l'entretien de l'habitacle, et une palette de prestations complémentaires sur devis pour aller plus loin : carrosserie, protection longue durée, optiques, désinfection."
        breadcrumb={[{ label: 'Prestations' }]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Formules habitacle</span>
            <h2>Nos deux formules principales</h2>
          </div>
          <div className={styles.formulaGrid}>
            {FORMULAS.map((formula) => (
              <FormulaCard formula={formula} key={formula.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Sur devis</span>
            <h2>Prestations complémentaires</h2>
          </div>
          <div className={styles.serviceGrid}>
            {COMPLEMENTARY_SERVICES.map((s) => (
              <ServiceCard service={s} key={s.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Prestations spécifiques</span>
            <h2>Optiques &amp; désinfection</h2>
          </div>
          <div className={styles.serviceGrid}>
            <ServiceCard service={OPTICS_RENOVATION} />
            <ServiceCard service={OZONE_TREATMENT} />
          </div>

          <div className={styles.note}>
            <strong style={{ color: 'var(--color-text)' }}>Bon à savoir — </strong>
            Les prix de nos formules sont indiqués « à partir de » : le tarif final dépend du
            gabarit et de l&apos;état du véhicule. Toutes nos prestations complémentaires sont
            systématiquement établies sur devis avant intervention, sans engagement.{' '}
            {SITE.vatNote}.
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
        </div>
      </section>
    </>
  )
}
