import Link from 'next/link'
import StaticBeforeAfterGallery from '@/components/StaticBeforeAfterGallery'
import { VEHICLE_ICONS, IconMapPin, IconInvoice, IconPercent, IconArrowRight, IconWhatsapp } from '@/components/Icons'
import { VEHICLE_TYPES } from '@/lib/data/vehicles'
import { whatsappLink, CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
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

const FLEET_VEHICLE_IDS = ['utilitaire', 'camion', 'tracteur', 'pelleteuse']
const FLEET_VEHICLES = VEHICLE_TYPES.filter((v) => FLEET_VEHICLE_IDS.includes(v.id))

const BTP_RESULTS = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1
  return {
    id: n,
    before: `/images/btp/btp-${n}-avant.jpg`,
    after: `/images/btp/btp-${n}-apres.jpg`,
    alt: `Cabine d'engin de chantier — intervention ${n}`,
  }
})

export default function ProPage() {
  const whatsappMessage = "Bonjour, je gère une flotte de véhicules d'entreprise et je souhaiterais un devis. Pouvez-vous m'en dire plus ?"

  return (
    <>
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          src="/videos/tracteur-nettoyage-btp.mp4"
          poster="/images/btp/btp-1-apres.jpg"
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

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Tous les gabarits</span>
            <h2>Du fourgon utilitaire à l&apos;engin de chantier</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Le même niveau d&apos;exigence, quel que soit le véhicule à traiter.
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
            <span className="eyebrow">La preuve par l&apos;image</span>
            <h2>Résultats sur engins de chantier</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Quelques interventions récentes, sur le terrain, chez nos clients professionnels.
            </p>
          </div>
          <StaticBeforeAfterGallery pairs={BTP_RESULTS} />
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
