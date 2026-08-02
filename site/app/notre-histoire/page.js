import Image from 'next/image'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { IconStar, IconSparkle, IconShield, IconDroplet, IconCheck, IconEye, IconTarget, IconArrowRight } from '@/components/Icons'
import { SITE, CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Notre histoire — L’histoire d’Enzo Soldet',
  description:
    "Découvrez l'histoire de La Clean Compagny et de son fondateur, Enzo Soldet : d'électricien à passionné d'automobile, une entreprise née du jour au lendemain, par passion et souci du détail.",
  path: '/notre-histoire',
})

const VALUES = [
  { icon: IconStar, title: 'Qualité', text: 'Un résultat exigeant, quel que soit le véhicule ou la prestation demandée.' },
  { icon: IconSparkle, title: 'Passion', text: "L'automobile n'est pas qu'un métier ici, c'est ce qui a tout déclenché." },
  { icon: IconShield, title: 'Professionnalisme', text: 'Ponctualité, sérieux et méthode à chaque intervention, sans exception.' },
  { icon: IconDroplet, title: 'Respect du véhicule', text: 'Des produits et gestes adaptés à chaque matière, sans jamais prendre de risque.' },
  { icon: IconCheck, title: 'Satisfaction client', text: "Un travail qui ne s'arrête que lorsque le résultat est à la hauteur." },
  { icon: IconEye, title: 'Transparence', text: 'Des tarifs clairs, des devis honnêtes, sans mauvaise surprise.' },
  { icon: IconTarget, title: 'Travail minutieux', text: 'Chaque recoin compte : c’est dans le détail que se joue la différence.' },
]

export default function NotreHistoirePage() {
  return (
    <>
      <PageHero
        eyebrow="Notre histoire"
        title="Une entreprise née d'une passion, pas d'un plan de carrière"
        breadcrumb={[{ label: 'Notre histoire' }]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyImage}>
              <Image
                src="/images/equipe/enzo-soldet-gerant-la-clean-compagny.jpg"
                alt="Enzo Soldet, gérant et fondateur de La Clean Compagny"
                fill
                sizes="(max-width: 900px) 90vw, 420px"
                priority
              />
            </div>

            <div className={styles.prose}>
              <h2>Un métier qu&apos;il n&apos;a pas choisi de quitter</h2>
              <p>
                Avant La Clean Compagny, Enzo Soldet était électricien. Un métier technique,
                minutieux, qu&apos;il exerçait avec la même rigueur qu&apos;il applique aujourd&apos;hui
                à chaque véhicule. Mais un accident de voiture est venu bouleverser cette trajectoire :
                il a dû arrêter son activité du jour au lendemain, sans l&apos;avoir choisi.
              </p>
              <p>
                Ce genre de coup d&apos;arrêt pourrait décourager n&apos;importe qui. Pour Enzo, ça a
                été le déclencheur d&apos;autre chose : la possibilité de se tourner, enfin, vers ce
                qui le passionnait depuis toujours — l&apos;automobile.
              </p>

              <h2>De la passion à l&apos;entreprise, sans détour</h2>
              <p>
                Il n&apos;y a pas eu de longue étude de marché, ni de business plan mûri pendant des
                mois. La Clean Compagny est née en {SITE.foundedYear}, portée par une conviction simple :
                chaque véhicule mérite un soin minutieux, qu&apos;il s&apos;agisse d&apos;une citadine
                utilisée tous les jours ou d&apos;une voiture de collection sortie une fois par mois.
                Enzo a transformé son sens du détail — hérité de son ancien métier — en exigence de
                qualité pour chaque prestation.
              </p>
              <p>
                Depuis, il met un point d&apos;honneur à traiter chaque véhicule avec la même
                rigueur, sans jamais faire de compromis sur la qualité, quels que soient le modèle,
                l&apos;âge ou la valeur du véhicule confié.
              </p>

              <div className={styles.quote}>
                « Chaque véhicule, même exigence. Ce n&apos;est pas qu&apos;un slogan, c&apos;est la
                façon dont je travaille depuis le premier jour. »
                <div className={styles.signature}>— Enzo Soldet, fondateur de La Clean Compagny</div>
              </div>

              <h2>Une exigence qui ne se discute pas</h2>
              <p>
                Ce parcours atypique explique aussi pourquoi La Clean Compagny s&apos;adresse à
                tous types de véhicules : citadines du quotidien, utilitaires professionnels,
                berlines familiales, SUV, jusqu&apos;aux voitures de prestige et de collection.
                Le niveau d&apos;exigence, lui, ne change jamais.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nos valeurs</span>
            <h2>Ce qui guide chaque intervention</h2>
          </div>
          <div className={styles.valuesGrid}>
            {VALUES.map((v) => (
              <div className={styles.valueCard} key={v.title}>
                <v.icon size={26} />
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Confiez-lui votre véhicule</span>
          <h2 style={{ marginTop: 14 }}>Faites confiance à cette exigence</h2>
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
