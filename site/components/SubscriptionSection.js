'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './SubscriptionSection.module.css'
import { IconCheck, IconWhatsapp } from './Icons'
import { PASS_TIERS, PASS_6_MOIS, PASS_3_MOIS } from '@/lib/data/pricing'
import { whatsappLink } from '@/lib/constants'

const PASSES = [PASS_6_MOIS, PASS_3_MOIS]
const PRESTIGE_ID = 'prestige'

// Rythme en un coup d'œil : le nombre de passages en grand, puis la fréquence.
// Les deux viennent du même objet que le texte, donc ils ne peuvent pas diverger.
function PassRhythm({ pass }) {
  return (
    <div className={styles.rhythm}>
      <span className={styles.rhythmNumber}>{pass.passagesPerYear}</span>
      <div className={styles.rhythmText}>
        <strong>passages par an</strong>
        <span>un passage tous les {pass.everyMonths} mois</span>
      </div>
    </div>
  )
}

function IncludesList({ items }) {
  return (
    <ul className={styles.includes}>
      {items.map((item) => (
        <li key={item}>
          <IconCheck size={16} />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function SubscriptionSection() {
  // Présentation mobile uniquement : rythme et véhicule choisis par le visiteur.
  const [passId, setPassId] = useState(PASS_6_MOIS.id)
  const [tierId, setTierId] = useState(PASS_TIERS[0].id)

  const mobilePass = PASSES.find((p) => p.id === passId)
  const mobileIsPrestige = tierId === PRESTIGE_ID
  const mobileTier = PASS_TIERS.find((t) => t.id === tierId)
  const mobilePrice = mobileIsPrestige ? null : mobilePass.prices[tierId]
  const mobileMessage = mobileIsPrestige
    ? `Bonjour, je suis intéressé(e) par la formule « ${mobilePass.name} » (${mobilePass.passagesPerYear} passages par an) pour un véhicule de prestige ou de collection. Pouvez-vous m'en dire plus ?`
    : `Bonjour, je suis intéressé(e) par la formule « ${mobilePass.name} » (${mobilePass.passagesPerYear} passages par an) pour mon véhicule : ${mobileTier.label}. Pouvez-vous m'en dire plus ?`

  return (
    <section className="section section-alt">
      <div className="container">
        <div className={styles.sectionHead}>
          <span className="eyebrow">Abonnements</span>
          <h2 style={{ marginTop: 14 }}>Entretenir votre véhicule toute l’année</h2>
          <p className="lead" style={{ marginTop: 14, maxWidth: 620 }}>
            Un abonnement de 12 mois : nous revenons à intervalles réguliers, et votre véhicule reste
            propre sans que vous ayez à y repenser.
          </p>
        </div>

        {/* ---------- Ordinateur : deux formules comparées côte à côte ---------- */}
        <div className={styles.desktopOnly}>
          <div className={styles.grid}>
            {PASSES.map((pass, index) => {
              const message = `Bonjour, je suis intéressé(e) par la formule « ${pass.name} » (${pass.passagesPerYear} passages par an). Pouvez-vous m'en dire plus ?`
              const featured = index === 1

              return (
                <article className={`${styles.card} ${featured ? styles.cardFeatured : ''}`} key={pass.id}>
                  <h3>{pass.name}</h3>
                  <p className={styles.summary}>{pass.summary}</p>
                  <PassRhythm pass={pass} />
                  <p className={styles.description}>{pass.description}</p>

                  <div className={styles.includesBlock}>
                    <span className={styles.includesTitle}>Inclus dans le Pass</span>
                    <IncludesList items={pass.includes} />
                  </div>

                  <div className={styles.actions}>
                    <a
                      href={whatsappLink(message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-cta btn-block"
                    >
                      <IconWhatsapp size={18} />
                      Souscrire à « {pass.name} »
                    </a>
                    <Link href="/contact" className="btn btn-outline btn-block">
                      Être recontacté(e)
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          <div className={styles.compare}>
            <h3 className={styles.compareTitle}>Prix par an, selon votre véhicule</h3>
            <div className={styles.tableWrap}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th scope="col">Votre véhicule</th>
                    {PASSES.map((pass) => (
                      <th scope="col" key={pass.id}>
                        {pass.name}
                        <span className={styles.thSub}>{pass.passagesPerYear} passages / an</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PASS_TIERS.map((tier) => (
                    <tr key={tier.id}>
                      <th scope="row">{tier.label}</th>
                      {PASSES.map((pass) => (
                        <td key={pass.id}>{pass.prices[tier.id]} €</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Prestige / Collection</th>
                    <td colSpan={2} className={styles.onQuote}>Sur devis, après inspection</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.compareNote}>
              Contrat de 12 mois, pour un seul véhicule. Non cessible et non cumulable avec d’autres offres.
            </p>
          </div>
        </div>

        {/* ---------- Mobile : un rythme et un véhicule à la fois ---------- */}
        <div className={styles.mobileOnly}>
          <div className={styles.segmented} role="group" aria-label="Choisir le rythme de passage">
            {PASSES.map((pass) => (
              <button
                type="button"
                key={pass.id}
                className={styles.segment}
                aria-pressed={pass.id === passId}
                onClick={() => setPassId(pass.id)}
              >
                <strong>{pass.passagesPerYear} passages / an</strong>
                <span>{pass.segmentLabel}</span>
              </button>
            ))}
          </div>

          <div className={styles.mobilePanel}>
            <p className={styles.summary}>{mobilePass.summary}</p>
            <PassRhythm pass={mobilePass} />

            <label htmlFor="pass-vehicle" className={styles.fieldLabel}>Votre véhicule</label>
            <select
              id="pass-vehicle"
              className={styles.select}
              value={tierId}
              onChange={(e) => setTierId(e.target.value)}
            >
              {PASS_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.label}
                </option>
              ))}
              <option value={PRESTIGE_ID}>Prestige / Collection</option>
            </select>

            <div className={styles.bigPrice}>
              {mobileIsPrestige ? (
                <strong>Sur devis</strong>
              ) : (
                <>
                  <strong>{mobilePrice} €</strong>
                  <span> / an</span>
                </>
              )}
            </div>
            <p className={styles.priceNote}>
              {mobileIsPrestige
                ? 'Véhicules de prestige et de collection : devis établi après inspection.'
                : `Contrat de 12 mois, soit ${mobilePass.passagesPerYear} passages pour votre véhicule.`}
            </p>

            <div className={styles.includesBlock}>
              <span className={styles.includesTitle}>Inclus dans le Pass</span>
              <IncludesList items={mobilePass.includes} />
            </div>

            <div className={styles.actions}>
              <a
                href={whatsappLink(mobileMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-cta btn-block"
              >
                <IconWhatsapp size={18} />
                Souscrire à « {mobilePass.name} »
              </a>
              <Link href="/contact" className="btn btn-outline btn-block">
                Être recontacté(e)
              </Link>
            </div>
          </div>
        </div>

        <p className={styles.b2bNote}>
          Vous gérez une flotte de véhicules ? <Link href="/pro">Découvrez notre espace Pro</Link>{' '}
          pour une offre entreprise sur-mesure.
        </p>
      </div>
    </section>
  )
}
