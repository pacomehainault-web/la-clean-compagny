'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './PricingSelector.module.css'
import { IconArrowRight } from './Icons'
import { VEHICLE_TIERS, FORMULAS_PRICING } from '@/lib/data/pricing'

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

export default function PricingSelector() {
  const [tierId, setTierId] = useState(DEFAULT_TIER_ID)
  const isPrestige = tierId === 'prestige'

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Choisissez le gabarit de votre véhicule">
        {VEHICLE_TIERS.map((tier) => {
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

      {isPrestige ? (
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
