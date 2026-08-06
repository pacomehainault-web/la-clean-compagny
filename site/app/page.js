import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import StatsRow from '@/components/StatsRow'
import FormulaCard from '@/components/FormulaCard'
import SubscriptionSection from '@/components/SubscriptionSection'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import ReviewsCarousel from '@/components/ReviewsCarousel'
import FAQAccordion from '@/components/FAQAccordion'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import { VEHICLE_ICONS, IconArrowRight, IconCheck } from '@/components/Icons'
import { FORMULAS, COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT } from '@/lib/data/services'
import { VEHICLE_TYPES } from '@/lib/data/vehicles'
import { REVIEWS } from '@/lib/data/reviews'
import { FAQ_ITEMS } from '@/lib/data/faq'
import { CITIES } from '@/lib/data/cities'
import { CONTACT, SITE, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { getRotatingIndex } from '@/lib/rotatingSelection'

export const metadata = buildMetadata({
  title: 'Detailing automobile haut de gamme à Angers',
  description:
    "La Clean Compagny redonne à chaque véhicule l'éclat qu'il mérite : nettoyage intérieur/extérieur, polissage, traitement céramique, rénovation optiques. Intervention à Angers et dans un rayon de 30 km.",
  path: '/',
})

// Régénère la page toutes les heures : suffisant pour suivre la rotation de
// l'avant/après en vedette (qui change tous les 2 jours, cf. lib/rotatingSelection).
export const revalidate = 3600

const ALL_BEFORE_AFTER = Array.from({ length: 13 }, (_, i) => {
  const n = i + 1
  return {
    before: `/images/avant-apres/paire-${n}-avant.jpg`,
    after: `/images/avant-apres/paire-${n}-apres.jpg`,
    alt: `Detailing avant / après — véhicule ${n}`,
  }
})

export default function HomePage() {
  const featuredBeforeAfter = ALL_BEFORE_AFTER[getRotatingIndex(ALL_BEFORE_AFTER.length, { namespace: 'home' })]

  return (
    <>
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          src="/videos/ferrari-video-arriere-plan-heros.mp4"
          poster="/images/exterieur/ferrari-california-lavage-prestige-angers.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={`${styles.heroContent} reveal`}>
          <h1 className={styles.heroTitle}>{SITE.name}</h1>
          <p className={styles.heroSlogan}>{SITE.slogan}</p>
          <div className={styles.heroActions}>
            <Link href="/devis" className="btn btn-cta">
              Voir les tarifs et réserver
              <IconArrowRight size={18} />
            </Link>
            <Link href="/prestations" className="btn btn-outline">
              Découvrir nos prestations
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.statsBar}>
        <div className="container">
          <StatsRow
            stats={[
              { value: `Depuis ${SITE.foundedYear}`, label: 'passionnés par l’automobile' },
              { value: '5.0 ★', label: 'de moyenne sur Google' },
              { value: `${CONTACT.radiusKm} km`, label: 'autour d’Angers, à domicile' },
              { value: '100 %', label: 'sur-mesure, sur devis' },
            ]}
          />
        </div>
      </div>

      <section className="section section-ink">
        <div className="container">
          <div className={`${styles.lustrageGrid} reveal`}>
            <div className={styles.lustrageVisual}>
              <div className={styles.lustrageMainImage}>
                <Image
                  src="/images/lustrage/lustrage-showroom.jpg"
                  alt="Carrosserie noire au fini miroir après lustrage, showroom BMW à Angers"
                  fill
                  sizes="(max-width: 900px) 90vw, 480px"
                />
              </div>
              <div className={styles.lustrageAccentImage}>
                <Image
                  src="/images/lustrage/lustrage-reflet-phare.jpg"
                  alt="Détail d'un feu avant et d'une carrosserie au fini miroir après lustrage"
                  fill
                  sizes="220px"
                />
              </div>
            </div>

            <div className={styles.lustrageContent}>
              <span className={styles.lustrageBadge}>🌟 Notre spécialité</span>
              <h2>Lustrage minute</h2>
              <p className={styles.lustrageLead}>
                Redonnez l&apos;éclat du neuf à votre carrosserie en un temps record.
              </p>
              <p className={styles.lustrageText}>
                Notre prestation phare : une finition brillance haute performance qui ravive la
                peinture, efface les micro-ternissures et sublime chaque reflet, sans les heures
                que demande un polissage complet.
              </p>
              <ul className={styles.lustrageFeatures}>
                <li>
                  <IconCheck size={18} />
                  Brillance miroir immédiate
                </li>
                <li>
                  <IconCheck size={18} />
                  Intervention rapide, directement à domicile
                </li>
              </ul>
              <Link href="/devis?extra=lustrage-minute" className="btn btn-cta">
                Réserver mon lustrage minute
                <IconArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className={`${styles.caseStudy} reveal`}>
            <div className={styles.caseStudyText}>
              <span className={styles.caseStudyBadge}>📍 Étude de cas</span>
              <p>
                Une rayure ciblée sur votre carrosserie ? Inutile de passer par la case
                carrosserie. Chez La Clean Compagny, nous intervenons directement chez vous pour
                effacer les éraflures.
              </p>
              <p>
                <strong>Exemple avec ce client</strong> : après avoir frotté un poteau dans un
                parking, il a fait appel à nos services. Intervention réalisée en bas de chez lui
                pour un résultat impeccable, sans immobiliser son véhicule (BMW X1).
              </p>
            </div>
            <div className={styles.caseStudyVisual}>
              <BeforeAfterSlider
                before="/images/lustrage/x1-lustrage-minute-avant.jpg"
                after="/images/lustrage/x1-lustrage-minute-apres.jpg"
                alt="Rayure sur la portière d'un BMW X1 effacée par un lustrage minute à domicile"
              />
              <span className={styles.caseStudyCaption}>BMW X1 — rayure de poteau effacée à domicile</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.sectionHeadRow} reveal`}>
            <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
              <span className="eyebrow">Nos formules</span>
              <h2>Deux formules, un seul niveau d&apos;exigence</h2>
            </div>
            <Link href="/prestations" className="btn btn-ghost btn-sm">
              Toutes les prestations
              <IconArrowRight size={16} />
            </Link>
          </div>

          <div className={`${styles.formulaGrid} reveal`}>
            {FORMULAS.map((formula) => (
              <FormulaCard formula={formula} key={formula.id} />
            ))}
          </div>

          <div className={styles.complementaryNote} id="prestations-complementaires">
            <span>Et aussi, sur devis :</span>
            <div className={styles.chipRow}>
              {[...COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT].map((s) => (
                <span className={styles.chip} key={s.id}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SubscriptionSection />

      <section className="section section-alt">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">Pour chaque véhicule</span>
            <h2>Un savoir-faire adapté à votre gabarit</h2>
          </div>
          <div className={`${styles.vehicleGrid} reveal`}>
            {VEHICLE_TYPES.map((v) => {
              const Icon = VEHICLE_ICONS[v.id]
              return (
                <Link href={`/devis?vehicule=${v.id}`} className={styles.vehicleCard} key={v.id}>
                  <Icon />
                  <span>{v.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.sectionHeadRow} reveal`}>
            <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
              <span className="eyebrow">Avant / Après</span>
              <h2>Le résultat parle de lui-même</h2>
            </div>
            <Link href="/galerie" className="btn btn-ghost btn-sm">
              Voir toute la galerie
              <IconArrowRight size={16} />
            </Link>
          </div>
          <div className={`${styles.sliderSingle} reveal`}>
            <BeforeAfterSlider key={featuredBeforeAfter.before} {...featuredBeforeAfter} />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={`${styles.storyGrid} reveal`}>
            <div className={styles.storyImage}>
              <Image
                src="/images/equipe/enzo-soldet-gerant-la-clean-compagny.jpg"
                alt="Enzo Soldet, gérant et fondateur de La Clean Compagny"
                fill
                sizes="(max-width: 900px) 90vw, 380px"
              />
            </div>
            <div>
              <span className="eyebrow">Notre histoire</span>
              <h2 style={{ marginTop: 14 }}>Une entreprise née d&apos;une passion, pas d&apos;un plan de carrière</h2>
              <p className="lead" style={{ marginTop: 18 }}>
                Ancien électricien, Enzo Soldet a dû tout arrêter après un accident de voiture.
                De cette épreuve est née La Clean Compagny, en {SITE.foundedYear} : une entreprise
                fondée du jour au lendemain, portée par la passion de l&apos;automobile et un sens
                du détail qui ne transige jamais.
              </p>
              <p className={styles.storyQuote}>
                « Chaque véhicule mérite le même soin, qu&apos;il s&apos;agisse d&apos;une citadine
                de tous les jours ou d&apos;une voiture de collection. »
              </p>
              <Link href="/notre-histoire" className="btn btn-outline" style={{ marginTop: 28 }}>
                Découvrir notre histoire
                <IconArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">Avis clients</span>
            <h2>Ce que nos clients en disent</h2>
          </div>
          <ReviewsCarousel reviews={REVIEWS} />
          <div className={styles.reviewsFooter}>
            <a href={CONTACT.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-cta btn-sm">
              Voir tous nos avis Google
            </a>
            <Link href="/avis" className="btn btn-ghost btn-sm">
              Toute la page avis
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={`${styles.zoneGrid} reveal`}>
            <div>
              <span className="eyebrow">Zone d&apos;intervention</span>
              <h2 style={{ marginTop: 14 }}>Angers et jusqu&apos;à {CONTACT.radiusKm} km alentour</h2>
              <p className="lead" style={{ marginTop: 18 }}>
                Nous nous déplaçons directement chez vous ou sur votre lieu de travail, à Angers
                et dans les communes environnantes.
              </p>
              <div className={styles.chipRow} style={{ marginTop: 24 }}>
                {CITIES.slice(0, 8).map((c) => (
                  <Link href={`/zone-intervention/${c.slug}`} className={styles.chip} key={c.slug}>
                    {c.name}
                  </Link>
                ))}
              </div>
              <Link href="/zone-intervention" className="btn btn-outline" style={{ marginTop: 28 }}>
                Toute la zone d&apos;intervention
                <IconArrowRight size={16} />
              </Link>
            </div>
            <GoogleMapEmbed height={360} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.faqGrid} reveal`}>
            <div>
              <span className="eyebrow">Questions fréquentes</span>
              <h2 style={{ marginTop: 14 }}>Tout ce qu&apos;il faut savoir</h2>
              <p className="lead" style={{ marginTop: 18 }}>
                Une question sur nos prestations, nos délais ou nos tarifs ?
              </p>
              <Link href="/faq" className="btn btn-ghost btn-sm" style={{ marginTop: 20 }}>
                Toutes les questions
                <IconArrowRight size={16} />
              </Link>
            </div>
            <FAQAccordion items={FAQ_ITEMS.slice(0, 4)} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.ctaBanner} reveal`}>
            <div className={styles.ctaBannerInner}>
              <span className="eyebrow">Prêt à commencer ?</span>
              <h2>Offrez à votre véhicule le traitement qu&apos;il mérite</h2>
              <p className="lead">
                Choisissez votre véhicule, votre prestation, et recevez votre devis en quelques
                minutes.
              </p>
              <div className={styles.ctaBannerActions}>
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
        </div>
      </section>
    </>
  )
}
