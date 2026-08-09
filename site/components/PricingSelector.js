'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './PricingSelector.module.css'
import { IconArrowRight } from './Icons'
import { VEHICLE_TIERS, FORMULAS_PRICING, MOTO_PRICING } from '@/lib/data/pricing'

// Palier affiché par défaut : Citadine — correspond aux prix "à partir de 109 € /
// 179 €" demandés comme affichage initial de la page d'accueil.
const DEFAULT_TIER_ID = 'citadine'

// Les paliers tarifaires de la page d'accueil ne correspondent pas 1:1 aux types
// de véhicules du configurateur de devis (taxonomie historique, incluant aussi
// les gabarits professionnels). On fait correspondre chaque palier au type de
// véhicule le plus proche pour préremplir le devis correctement.
const TIER_TO_VEHICLE_ID = {
  citadine: 'citadine',
  'compacte-berline': 'berline',
  'suv-break': 'suv',
  'grand-suv': 'monospace',
}

// Moto : exclusivité Espace Particulier, insérée juste avant Prestige. Ce
// sélecteur n'est utilisé que sur la page d'accueil grand public (jamais dans
// l'espace Pro), donc aucune condition d'affichage supplémentaire n'est requise.
const SELECTOR_TIERS = [
  ...VEHICLE_TIERS.slice(0, -1),
  { id: 'moto', emoji: '🏍️', label: 'Moto' },
  VEHICLE_TIERS[VEHICLE_TIERS.length - 1],
]

export default function PricingSelector() {
  const [tierId, setTierId] = useState(DEFAULT_TIER_ID)
  const isPrestige = tierId === 'prestige'
  const isMoto = tierId === 'moto'

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Choisissez le gabarit de votre véhicule">
        {SELECTOR_TIERS.map((tier) => {
          const active = tier.id === tierId
          return (
            <button
              type="button"
              key={tier.id}
              role="tab"
              aria-selected={active}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              onClick={() => setTierId(tier.id)}
            >
              <span aria-hidden="true">{tier.emoji}</span>
              {tier.label}
            </button>
          )
        })}
      </div>

      {isMoto ? (
        <div className={styles.motoCard}>
          <div className={styles.motoImage}>
            <Image
              src="/images/moto/enzo-lustrage-moto-bmw-angers.jpg"
              alt="Enzo, gérant de La Clean Compagny, lustre une moto BMW sur pont"
              fill
              sizes="(max-width: 800px) 90vw, 360px"
            />
          </div>
          <div className={styles.motoBody}>
            <h3>{MOTO_PRICING.name}</h3>
            <div className={styles.price}>
              <span className={styles.priceFrom}>à partir de</span>
              <span className={styles.priceValue}>{MOTO_PRICING.fromPrice} €</span>
            </div>
            <p className={styles.tagline}>{MOTO_PRICING.description}</p>
            <Link href="/devis?vehicule=moto" className="btn btn-cta btn-block">
              Demander un devis moto
              <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : isPrestige ? (
        <div className={styles.prestigeNote}>
          Véhicule Prestige / Collection sélectionné : chaque prestation est établie sur devis
          après inspection, pour s&apos;adapter aux matériaux et à l&apos;état de votre véhicule.{' '}
          <Link href="/prestations#prestige">Voir notre offre Prestige &amp; Collection</Link>
        </div>
      ) : (
        <div className={styles.cards}>
          {FORMULAS_PRICING.map((formula) => (
            <div className={styles.card} key={formula.id}>
              <h3>{formula.name}</h3>
              <div className={styles.price}>
                <span className={styles.priceFrom}>à partir de</span>
                <span className={styles.priceValue}>{formula.prices[tierId]} €</span>
              </div>
              <p className={styles.tagline}>{formula.tagline}</p>
              <Link
                href={`/devis?formule=${formula.id}&vehicule=${TIER_TO_VEHICLE_ID[tierId]}`}
                className="btn btn-cta btn-block"
              >
                Choisir ma formule
                <IconArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
