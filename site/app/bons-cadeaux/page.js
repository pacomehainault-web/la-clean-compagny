import PageHero from '@/components/PageHero'
import { IconGift, IconSparkle, IconMail } from '@/components/Icons'
import { FORMULAS } from '@/lib/data/services'
import { whatsappLink, CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Bons cadeaux — Offrez un detailing haut de gamme',
  description:
    "Offrez un bon cadeau La Clean Compagny : formule Coup de Propre, Sortie de Concession ou montant libre. L'idée cadeau parfaite pour tout passionné d'automobile.",
  path: '/bons-cadeaux',
})

const OPTIONS = [
  {
    name: `Bon cadeau — ${FORMULAS[0].name}`,
    price: `${FORMULAS[0].basePrice} €`,
    description: FORMULAS[0].description,
  },
  {
    name: `Bon cadeau — ${FORMULAS[1].name}`,
    price: `${FORMULAS[1].basePrice} €`,
    description: FORMULAS[1].description,
  },
  {
    name: 'Bon cadeau — Montant libre',
    price: 'Sur mesure',
    description:
      "Choisissez le montant que vous souhaitez offrir : le bénéficiaire pourra l'utiliser sur la prestation de son choix.",
  },
]

const STEPS = [
  { title: 'Vous nous contactez', text: 'Par WhatsApp, téléphone ou email, indiquez la formule ou le montant souhaité.' },
  { title: 'Nous préparons le bon', text: 'Un bon cadeau personnalisé vous est envoyé, prêt à être offert.' },
  { title: 'Il est utilisé à son rythme', text: 'Le bénéficiaire prend rendez-vous quand il le souhaite, dans la limite de validité indiquée.' },
]

export default function BonsCadeauxPage() {
  return (
    <>
      <PageHero
        eyebrow="Bons cadeaux"
        title="Offrez un moment d'exception à votre véhicule"
        lead="L'idée cadeau qui change du bon classique : une prestation detailing haut de gamme, à offrir à un proche passionné d'automobile ou tout simplement soucieux du détail."
        breadcrumb={[{ label: 'Bons cadeaux' }]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nos formules cadeaux</span>
            <h2>Choisissez la formule à offrir</h2>
          </div>
          <div className={styles.grid}>
            {OPTIONS.map((o) => (
              <div className={`card ${styles.card}`} key={o.name}>
                <IconGift size={30} />
                <h3>{o.name}</h3>
                <span className={styles.price}>{o.price}</span>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{o.description}</p>
                <a
                  href={whatsappLink(
                    `Bonjour La Clean Compagny, je souhaiterais offrir un « ${o.name} ». Pouvez-vous me donner la marche à suivre ?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-cta btn-sm btn-block"
                >
                  Demander ce bon cadeau
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Comment ça marche</span>
            <h2>Trois étapes très simples</h2>
          </div>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div className={styles.step} key={s.title}>
                <span className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</span>
                <h3 style={{ fontSize: '1.1rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <IconSparkle size={26} style={{ color: 'var(--color-brand-blue)' }} />
          <h2 style={{ marginTop: 14 }}>Une question sur les bons cadeaux ?</h2>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <a href={telLink()} className="btn btn-cta">
              {CONTACT.phoneDisplay}
            </a>
            <a href={whatsappLink('Bonjour, j’ai une question au sujet des bons cadeaux La Clean Compagny.')} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
              <IconMail size={16} />
              Nous écrire
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
