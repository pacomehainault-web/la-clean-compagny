import Link from 'next/link'
import PageHero from '@/components/PageHero'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import PhotoGallery from '@/components/PhotoGallery'
import { IconArrowRight } from '@/components/Icons'
import { CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Galerie — Avant / Après & réalisations',
  description:
    "Découvrez nos réalisations en images : comparatifs avant/après interactifs, nettoyage intérieur et extérieur sur véhicules du quotidien, utilitaires et voitures de prestige.",
  path: '/galerie',
})

const SLIDERS = [
  { before: '/images/avant-apres/paire-1-avant.jpg', after: '/images/avant-apres/paire-1-apres.jpg', alt: 'Nettoyage intérieur complet — véhicule' },
  { before: '/images/avant-apres/paire-2-avant.jpg', after: '/images/avant-apres/paire-2-apres.jpg', alt: 'Rénovation esthétique — véhicule' },
  { before: '/images/avant-apres/paire-3-avant.jpg', after: '/images/avant-apres/paire-3-apres.jpg', alt: 'Detailing complet — véhicule' },
]

const EXTERIOR_PHOTOS = [
  { src: '/images/exterieur/lamborghini-huracan-detailing-angers.jpg', alt: 'Lamborghini Huracán — detailing extérieur à Angers', caption: 'Lamborghini Huracán' },
  { src: '/images/exterieur/ferrari-california-lavage-prestige-angers.jpg', alt: 'Ferrari California — lavage prestige à Angers', caption: 'Ferrari California' },
  { src: '/images/exterieur/bmw-xm-detailing-exterieur-angers.jpg', alt: 'BMW XM — detailing extérieur à Angers', caption: 'BMW XM' },
  { src: '/images/exterieur/bmw-m3-lavage-exterieur-angers.jpg', alt: 'BMW M3 — lavage extérieur à Angers', caption: 'BMW M3' },
  { src: '/images/exterieur/ford-mustang-detailing-exterieur-angers.jpg', alt: 'Ford Mustang — detailing extérieur à Angers', caption: 'Ford Mustang' },
]

const INTERIOR_PHOTOS = [
  { src: '/images/interieur/aston-martin-dbs-nettoyage-interieur-angers.jpg', alt: 'Aston Martin DBS — nettoyage intérieur à Angers', caption: 'Aston Martin DBS' },
  { src: '/images/interieur/audi-rs6-dressing-habitacle-angers.jpg', alt: 'Audi RS6 — dressing habitacle à Angers', caption: 'Audi RS6' },
  { src: '/images/interieur/bmw-m3-g80-renovation-habitacle-angers.jpg', alt: 'BMW M3 G80 — rénovation habitacle à Angers', caption: 'BMW M3 G80' },
  { src: '/images/interieur/bmw-m3-nettoyage-interieur-angers.jpg', alt: 'BMW M3 — nettoyage intérieur à Angers', caption: 'BMW M3' },
  { src: '/images/interieur/bmw-x5-nettoyage-interieur-angers.jpg', alt: 'BMW X5 — nettoyage intérieur à Angers', caption: 'BMW X5' },
  { src: '/images/interieur/utilitaire-nettoyage-interieur-angers.jpg', alt: 'Véhicule utilitaire — nettoyage intérieur à Angers', caption: 'Utilitaire' },
]

export default function GaleriePage() {
  return (
    <>
      <PageHero
        eyebrow="Galerie"
        title="Nos réalisations, en images"
        lead="Citadines, berlines, SUV, utilitaires ou voitures de prestige : chaque véhicule reçoit le même niveau d'exigence. Faites glisser le curseur pour comparer l'avant et l'après."
        breadcrumb={[{ label: 'Galerie' }]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Comparatif interactif</span>
            <h2>Avant / Après</h2>
          </div>
          <div className={styles.sliderGrid}>
            {SLIDERS.map((s) => (
              <BeforeAfterSlider key={s.before} {...s} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Extérieur</span>
            <h2>Carrosserie &amp; brillance</h2>
          </div>
          <PhotoGallery photos={EXTERIOR_PHOTOS} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Intérieur</span>
            <h2>Habitacle &amp; sellerie</h2>
          </div>
          <PhotoGallery photos={INTERIOR_PHOTOS} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Envie du même résultat ?</span>
          <h2 style={{ marginTop: 14 }}>Votre véhicule mérite le même soin</h2>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/devis" className="btn btn-cta">
              Voir les tarifs et réserver
              <IconArrowRight size={18} />
            </Link>
            <a href={telLink()} className="btn btn-outline">
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
