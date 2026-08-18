import Link from 'next/link'
import Image from 'next/image'
import PageHero from '@/components/PageHero'
import PhotoGallery from '@/components/PhotoGallery'
import { IconMapPin, IconSparkle, IconGift, IconArrowRight, IconInstagram, IconTiktok, IconFacebook } from '@/components/Icons'
import { CONTACT, SOCIALS, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Événements — La Clean Compagny sur les rassemblements automobiles',
  description:
    "La Clean Compagny se déplace sur les rassemblements et expositions automobiles de la région angevine. Découvrez nos stands et nos interventions en images.",
  path: '/evenements',
})

const EVENT_PHOTOS = [
  {
    src: '/images/evenements/enzo-stand-kenotek-angers.jpg',
    alt: 'Enzo Soldet sur le stand La Clean Compagny, partenaire Kenotek et Motul',
    caption: 'Sur le stand, aux couleurs Kenotek & Motul',
    aspect: '1179 / 1716',
  },
  {
    src: '/images/evenements/banniere-la-clean-compagny-stand.jpg',
    alt: 'Banderole La Clean Compagny sur un stand professionnel',
    caption: 'Notre banderole, prête pour l’événement',
    aspect: '3 / 4',
  },
  {
    src: '/images/evenements/intervention-domicile-la-clean-compagny-1.jpg',
    alt: 'La Clean Compagny en intervention sur un véhicule',
    caption: 'Intervention sur place',
    aspect: '3 / 4',
  },
  {
    src: '/images/evenements/stand-produits-kenotek-angers.jpg',
    alt: 'Présentoir de produits Kenotek sur le stand La Clean Compagny',
    caption: 'La gamme de produits professionnels Kenotek',
    aspect: '3 / 4',
  },
  {
    src: '/images/evenements/intervention-domicile-la-clean-compagny-2.jpg',
    alt: 'La Clean Compagny au travail sur un véhicule',
    caption: 'Le souci du détail, à chaque intervention',
    aspect: '3 / 4',
  },
]

export default function EvenementsPage() {
  return (
    <>
      <PageHero
        eyebrow="Événements"
        title="La Clean Compagny sur les routes de l'Anjou"
        lead="Rassemblements automobiles, expositions, stands partenaires : Enzo se déplace avec son matériel professionnel pour partager sa passion et présenter son savoir-faire."
        breadcrumb={[{ label: 'Événements' }]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.intro}>
            <div className={styles.introImage}>
              <Image
                src={EVENT_PHOTOS[0].src}
                alt={EVENT_PHOTOS[0].alt}
                fill
                sizes="(max-width: 900px) 90vw, 460px"
                priority
              />
            </div>
            <div>
              <span className="eyebrow">Toujours sur le terrain</span>
              <h2 style={{ marginTop: 14 }}>Une passion qui se partage aussi hors de l&apos;atelier</h2>
              <p className="lead" style={{ marginTop: 18 }}>
                Au-delà des interventions à domicile, La Clean Compagny participe régulièrement à
                des rassemblements et expositions automobiles dans la région angevine, aux côtés
                de marques partenaires comme Kenotek et Motul. L&apos;occasion de présenter les
                produits et méthodes utilisés au quotidien, d&apos;échanger avec d&apos;autres
                passionnés, et de faire découvrir le detailing haut de gamme à un plus large public.
              </p>
              <div className={styles.pointList}>
                <div className={styles.point}>
                  <IconMapPin size={18} />
                  <span>Présent sur des événements dans toute la région angevine</span>
                </div>
                <div className={styles.point}>
                  <IconSparkle size={18} />
                  <span>Démonstrations et conseils sur les produits professionnels utilisés</span>
                </div>
                <div className={styles.point}>
                  <IconGift size={18} />
                  <span>Un moment d&apos;échange convivial avec la communauté automobile locale</span>
                </div>
              </div>
              <Link href="/contact" className="btn btn-outline" style={{ marginTop: 28 }}>
                Nous inviter sur votre événement
                <IconArrowRight size={16} />
              </Link>
            </div>
          </div>

          <PhotoGallery photos={EVENT_PHOTOS.slice(1)} masonry />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Envie de nous rencontrer ?</span>
          <h2 style={{ marginTop: 14 }}>Suivez-nous pour connaître nos prochains rendez-vous</h2>
          <p className="lead" style={{ marginTop: 16, maxWidth: 560, marginInline: 'auto' }}>
            Nos prochaines participations à des événements sont annoncées sur nos réseaux sociaux.
          </p>
          <div className={styles.socials}>
            <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IconInstagram size={20} />
            </a>
            <a href={SOCIALS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <IconTiktok size={20} />
            </a>
            <a href={SOCIALS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <IconFacebook size={20} />
            </a>
          </div>
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
