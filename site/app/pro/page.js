import Link from 'next/link'
import Image from 'next/image'
import StaticBeforeAfterGallery from '@/components/StaticBeforeAfterGallery'
import PhotoGallery from '@/components/PhotoGallery'
import { VEHICLE_ICONS, IconMapPin, IconInvoice, IconPercent, IconArrowRight, IconWhatsapp } from '@/components/Icons'
import { VEHICLE_TYPES } from '@/lib/data/vehicles'
import { whatsappLink, CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { BTP_PAIRS } from '@/lib/data/beforeAfter'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Espace Professionnels — Entretien de flotte à Angers',
  description:
    "La Clean Compagny entretient les flottes d'entreprise à Angers et alentours : utilitaires, poids lourds, engins de chantier. Intervention sur site, facturation groupée, tarifs dégressifs au volume.",
  path: '/pro',
})

const ARGUMENTS = [
  {
    icon: IconMapPin,
    title: 'Intervention sur site',
    text: "Nous nous déplaçons directement sur votre dépôt ou votre parking d'entreprise. Vos véhicules restent disponibles, sans organiser le moindre trajet.",
  },
  {
    icon: IconInvoice,
    title: 'Facturation groupée / mensuelle',
    text: 'Une seule facture périodique pour toute la flotte plutôt qu\'un règlement véhicule par véhicule — plus simple à traiter côté comptabilité.',
  },
  {
    icon: IconPercent,
    title: 'Tarifs dégressifs au volume',
    text: "Plus votre flotte est grande, plus le tarif par véhicule diminue. Chaque devis est établi sur-mesure selon le volume et la fréquence souhaités.",
  },
]

// La Moto reste une exclusivité Espace Particulier : volontairement absente de
// cette liste (cf. lib/data/vehicles.js) pour ne jamais apparaître côté Pro.
const FLEET_VEHICLE_IDS = ['citadine', 'berline', 'suv', 'monospace', 'utilitaire', 'camion', 'tracteur', 'pelleteuse']
const FLEET_VEHICLES = VEHICLE_TYPES.filter((v) => FLEET_VEHICLE_IDS.includes(v.id))

const FLEET_CARS_PHOTOS = [
  {
    src: '/images/interieur/bmw-m4-nettoyage-interieur-angers.jpg',
    alt: 'BMW M4 de flotte — nettoyage intérieur à Angers',
    caption: 'Berlines de fonction',
  },
  {
    src: '/images/interieur/bmw-x7-nettoyage-interieur-angers.jpg',
    alt: 'BMW X7 de flotte — nettoyage intérieur à Angers',
    caption: 'SUV & véhicules de direction',
  },
  {
    src: '/images/interieur/audi-rs6-dressing-habitacle-angers.jpg',
    alt: 'Audi RS6 de flotte — dressing habitacle à Angers',
    caption: 'Citadines & berlines commerciales',
  },
]


export default function ProPage() {
  const whatsappMessage = "Bonjour, je gère une flotte de véhicules d'entreprise et je souhaiterais un devis. Pouvez-vous m'en dire plus ?"

  return (
    <>
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          src="/videos/tracteur-nettoyage-btp.mp4"
          poster="/images/btp/nettoyage-cabine-pelleteuse-angers-apres.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Espace Professionnels</span>
          <h1 className={styles.heroTitle}>Le même soin, à l&apos;échelle de votre flotte</h1>
          <p className={styles.heroSlogan}>
            Utilitaires, poids lourds, engins de chantier — la même exigence, directement sur site.
          </p>
          <div className={styles.heroActions}>
            <Link href="/devis?pro=1" className="btn btn-cta">
              Demander mon devis flotte
              <IconArrowRight size={18} />
            </Link>
            <a href="#pourquoi" className="btn btn-outline">
              Découvrir nos engagements
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="pourquoi">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Pourquoi La Clean Compagny</span>
            <h2>Pensé pour les contraintes d&apos;une entreprise</h2>
          </div>
          <div className={styles.grid}>
            {ARGUMENTS.map((a) => (
              <div className={`card ${styles.card}`} key={a.title}>
                <a.icon size={30} />
                <h3 style={{ fontSize: '1.1rem' }}>{a.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.siteBanner}>
        <Image
          src="/images/evenements/intervention-domicile-la-clean-compagny-1.jpg"
          alt="Technicien La Clean Compagny intervenant sur un véhicule d'entreprise, directement sur site"
          fill
          sizes="100vw"
        />
        <div className={styles.siteBannerOverlay} aria-hidden="true" />
        <p className={styles.siteBannerCaption}>
          Nos techniciens interviennent directement sur votre site, avec leur propre matériel.
        </p>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Tous les gabarits</span>
            <h2>De la citadine de service à l&apos;engin de chantier</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Voitures de fonction, utilitaires, poids lourds, engins de chantier : le même niveau
              d&apos;exigence, quel que soit le véhicule à traiter.
            </p>
          </div>
          <div className={styles.vehicleGrid}>
            {FLEET_VEHICLES.map((v) => {
              const Icon = VEHICLE_ICONS[v.id]
              return (
                <div className={styles.vehicleCard} key={v.id}>
                  <Icon />
                  <span>{v.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Voitures de fonction</span>
            <h2>Vos flottes de voitures n&apos;ont pas que des utilitaires</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Berlines de direction, citadines commerciales, SUV : nous entretenons aussi les
              voitures classiques de votre flotte, pas uniquement les véhicules techniques.
            </p>
          </div>
          <PhotoGallery photos={FLEET_CARS_PHOTOS} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">La preuve par l&apos;image</span>
            <h2>Résultats chez nos clients du BTP</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Engins de chantier et utilitaires : quelques interventions récentes, sur le terrain,
              chez nos clients professionnels.
            </p>
          </div>
          <StaticBeforeAfterGallery pairs={BTP_PAIRS} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Prêt à démarrer ?</span>
          <h2 style={{ marginTop: 14 }}>Demandez votre devis flotte</h2>
          <p className="lead" style={{ marginTop: 16, maxWidth: 560, marginInline: 'auto' }}>
            Tarifs systématiquement sur devis, établis selon votre volume et votre fréquence
            d&apos;entretien. Réponse rapide, sans engagement.
          </p>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/devis?pro=1" className="btn btn-cta">
              Demander mon devis flotte
              <IconArrowRight size={18} />
            </Link>
            <a
              href={whatsappLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <IconWhatsapp size={18} />
              Nous écrire sur WhatsApp
            </a>
          </div>
          <p style={{ marginTop: 24, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Ou appelez-nous directement au{' '}
            <a href={telLink()} style={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {CONTACT.phoneDisplay}
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
