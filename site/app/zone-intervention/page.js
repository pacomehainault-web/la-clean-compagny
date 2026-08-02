import Link from 'next/link'
import PageHero from '@/components/PageHero'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import { IconMapPin, IconArrowRight } from '@/components/Icons'
import { CITIES } from '@/lib/data/cities'
import { CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Zone d’intervention — Angers et agglomération',
  description:
    "La Clean Compagny intervient à Angers et dans un rayon de 30 km : Trélazé, Avrillé, Les Ponts-de-Cé, Bouchemaine, Saint-Barthélemy-d'Anjou et bien d'autres communes.",
  path: '/zone-intervention',
})

export default function ZoneInterventionPage() {
  return (
    <>
      <PageHero
        eyebrow="Zone d'intervention"
        title={`Angers et jusqu'à ${CONTACT.radiusKm} km alentour`}
        lead="Nous nous déplaçons directement chez vous ou sur votre lieu de travail, avec le même matériel professionnel et la même exigence qu'en atelier."
        breadcrumb={[{ label: "Zone d'intervention" }]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.layout}>
            <div>
              <div className={styles.cityGrid}>
                {CITIES.map((c) => (
                  <Link href={`/zone-intervention/${c.slug}`} className={styles.cityCard} key={c.slug}>
                    <span className={styles.cityName}>
                      <IconMapPin size={14} style={{ marginRight: 8, verticalAlign: '-2px', color: 'var(--color-brand-blue)' }} />
                      {c.name}
                    </span>
                    <span className={styles.cityDistance}>{c.distanceKm === 0 ? 'Base' : `~ ${c.distanceKm} km`}</span>
                  </Link>
                ))}
              </div>
              <p className="lead" style={{ marginTop: 28 }}>
                Votre commune n&apos;apparaît pas dans la liste ? Contactez-nous : si vous êtes
                dans un rayon de {CONTACT.radiusKm} km autour d&apos;Angers, nous pouvons très
                probablement intervenir chez vous.
              </p>
              <div style={{ marginTop: 24, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/devis" className="btn btn-cta">
                  Voir les tarifs et réserver
                  <IconArrowRight size={18} />
                </Link>
                <a href={telLink()} className="btn btn-outline">
                  {CONTACT.phoneDisplay}
                </a>
              </div>
            </div>
            <GoogleMapEmbed height={480} />
          </div>
        </div>
      </section>
    </>
  )
}
