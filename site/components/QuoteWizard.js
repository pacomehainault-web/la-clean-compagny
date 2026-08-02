'use client'

import { useMemo, useState } from 'react'
import styles from './QuoteWizard.module.css'
import { VEHICLE_ICONS, IconCheck, IconArrowRight, IconWhatsapp, IconMail } from './Icons'
import { VEHICLE_TYPES, getVehicleType } from '@/lib/data/vehicles'
import { FORMULAS, COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT } from '@/lib/data/services'
import { whatsappLink, mailtoLink, CONTACT } from '@/lib/constants'

const EXTRA_SERVICES = [...COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT]

const STEPS = [
  { id: 1, label: 'Véhicule' },
  { id: 2, label: 'Prestations' },
  { id: 3, label: 'Coordonnées' },
]

export default function QuoteWizard({ initialVehicleId, initialFormulaId }) {
  const [step, setStep] = useState(1)
  const [vehicleId, setVehicleId] = useState(initialVehicleId || '')
  const [formulaId, setFormulaId] = useState(initialFormulaId || '')
  const [extraIds, setExtraIds] = useState(new Set())
  const [contact, setContact] = useState({ name: '', phone: '', email: '', date: '', message: '' })
  const [error, setError] = useState('')
  const [emailStatus, setEmailStatus] = useState('idle') // idle | sending | sent | error

  const vehicle = getVehicleType(vehicleId)
  const formula = FORMULAS.find((f) => f.id === formulaId)
  const extras = EXTRA_SERVICES.filter((s) => extraIds.has(s.id))
  const selectedServices = [formula, ...extras].filter(Boolean)

  const multiplier = vehicle?.priceMultiplier || 1
  const subtotal = selectedServices.reduce((sum, s) => sum + s.basePrice, 0)
  const estimateLow = Math.round(subtotal * multiplier * 0.92)
  const estimateHigh = Math.round(subtotal * multiplier * 1.18)

  function toggleExtra(id) {
    setExtraIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function goNext() {
    if (step === 1 && !vehicleId) {
      setError('Merci de sélectionner un type de véhicule.')
      return
    }
    if (step === 2 && !formula && extras.length === 0) {
      setError('Merci de sélectionner au moins une prestation.')
      return
    }
    setError('')
    setStep((s) => Math.min(3, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setError('')
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const message = useMemo(() => {
    const lines = [
      'Bonjour La Clean Compagny,',
      '',
      'Je souhaite obtenir un devis pour :',
      `- Véhicule : ${vehicle ? vehicle.label : 'non précisé'}`,
      `- Prestations : ${selectedServices.length ? selectedServices.map((s) => s.name).join(', ') : 'non précisées'}`,
      selectedServices.length ? `- Estimation indicative : ${estimateLow} € – ${estimateHigh} €` : null,
      '',
      'Mes coordonnées :',
      `Nom : ${contact.name || '—'}`,
      contact.phone ? `Téléphone : ${contact.phone}` : null,
      contact.email ? `Email : ${contact.email}` : null,
      contact.date ? `Date souhaitée : ${contact.date}` : null,
      contact.message ? `Message : ${contact.message}` : null,
    ]
    return lines.filter((l) => l !== null).join('\n')
  }, [vehicle, selectedServices, estimateLow, estimateHigh, contact])

  function handleWhatsapp() {
    if (!contact.name || !contact.phone) {
      setError('Merci de renseigner au moins votre nom et votre téléphone.')
      return
    }
    setError('')
    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer')
  }

  async function handleEmailSubmit() {
    if (!contact.name || !contact.phone) {
      setError('Merci de renseigner au moins votre nom et votre téléphone.')
      return
    }
    setError('')
    setEmailStatus('sending')
    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contact.name, phone: contact.phone, email: contact.email, message }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 503) {
          // Envoi serveur non configuré : on bascule sur le client de messagerie local.
          window.location.href = mailtoLink({ subject: 'Demande de devis — La Clean Compagny', body: message })
          setEmailStatus('idle')
          return
        }
        throw new Error(data.error || 'Envoi impossible')
      }
      setEmailStatus('sent')
    } catch {
      setEmailStatus('error')
    }
  }

  return (
    <div>
      <div className={styles.steps}>
        {STEPS.map((s, index) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: index < STEPS.length - 1 ? 1 : 'none' }}>
            <div
              className={`${styles.stepDot} ${step === s.id ? styles.stepDotActive : ''} ${step > s.id ? styles.stepDotDone : ''}`}
            >
              <span className={styles.stepCircle}>{step > s.id ? <IconCheck size={16} /> : s.id}</span>
              <span className={styles.stepLabel}>{s.label}</span>
            </div>
            {index < STEPS.length - 1 && <span className={styles.stepLine} />}
          </div>
        ))}
      </div>

      <div className={styles.wrap}>
        <div className={styles.panel}>
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Quel est votre véhicule ?</h2>
              <p className="lead" style={{ marginBottom: 28 }}>
                Le tarif final dépend du gabarit de votre véhicule.
              </p>
              <div className={styles.vehicleGrid}>
                {VEHICLE_TYPES.map((v) => {
                  const Icon = VEHICLE_ICONS[v.id]
                  const active = v.id === vehicleId
                  return (
                    <button
                      type="button"
                      key={v.id}
                      className={`${styles.vehicleCard} ${active ? styles.vehicleCardActive : ''}`}
                      onClick={() => {
                        setVehicleId(v.id)
                        setError('')
                      }}
                    >
                      <Icon />
                      <span className={styles.vehicleName}>{v.label}</span>
                      <span className={styles.vehicleExamples}>{v.examples}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Quelles prestations ?</h2>
              <p className="lead" style={{ marginBottom: 8 }}>
                Choisissez une formule habitacle et/ou des prestations complémentaires.
              </p>

              <div className={styles.blockTitle}>Formule habitacle (au choix)</div>
              <div className={styles.formulaOptions}>
                {FORMULAS.map((f) => {
                  const active = f.id === formulaId
                  return (
                    <div
                      key={f.id}
                      className={`${styles.optionCard} ${active ? styles.optionCardActive : ''}`}
                      onClick={() => {
                        setFormulaId(active ? '' : f.id)
                        setError('')
                      }}
                      role="radio"
                      aria-checked={active}
                      tabIndex={0}
                    >
                      <span className={`${styles.optionControl} ${active ? styles.optionControlActive : ''}`}>
                        {active && <IconCheck size={12} />}
                      </span>
                      <div className={styles.optionBody}>
                        <div className={styles.optionName}>
                          <span>{f.name}</span>
                          <span className={styles.optionPrice}>dès {f.basePrice} €</span>
                        </div>
                        <p className={styles.optionDesc}>{f.tagline}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={styles.blockTitle}>Prestations complémentaires (optionnel)</div>
              <div className={styles.formulaOptions}>
                {EXTRA_SERVICES.map((s) => {
                  const active = extraIds.has(s.id)
                  return (
                    <div
                      key={s.id}
                      className={`${styles.optionCard} ${active ? styles.optionCardActive : ''}`}
                      onClick={() => {
                        toggleExtra(s.id)
                        setError('')
                      }}
                      role="checkbox"
                      aria-checked={active}
                      tabIndex={0}
                    >
                      <span className={`${styles.optionControl} ${styles.optionControlCheckbox} ${active ? styles.optionControlActive : ''}`}>
                        {active && <IconCheck size={12} />}
                      </span>
                      <div className={styles.optionBody}>
                        <div className={styles.optionName}>
                          <span>{s.name}</span>
                          <span className={styles.optionPrice}>dès {s.basePrice} €</span>
                        </div>
                        <p className={styles.optionDesc}>{s.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Vos coordonnées</h2>
              <p className="lead" style={{ marginBottom: 28 }}>
                Nous vous recontactons rapidement pour confirmer votre devis définitif.
              </p>
              <div className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="name">Nom &amp; prénom *</label>
                  <input
                    id="name"
                    type="text"
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone">Téléphone *</label>
                  <input
                    id="phone"
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    autoComplete="tel"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">Email (optionnel)</label>
                  <input
                    id="email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="date">Date souhaitée (optionnel)</label>
                  <input
                    id="date"
                    type="date"
                    value={contact.date}
                    onChange={(e) => setContact({ ...contact, date: e.target.value })}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="message">Message (optionnel)</label>
                  <textarea
                    id="message"
                    rows={4}
                    value={contact.message}
                    onChange={(e) => setContact({ ...contact, message: e.target.value })}
                    placeholder="Précisez tout élément utile : état du véhicule, accès, disponibilités…"
                  />
                </div>
              </div>

              <div className={styles.submitActions}>
                <button type="button" className="btn btn-cta btn-block" onClick={handleWhatsapp}>
                  <IconWhatsapp size={18} />
                  Envoyer ma demande par WhatsApp
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={handleEmailSubmit}
                  disabled={emailStatus === 'sending' || emailStatus === 'sent'}
                >
                  <IconMail size={18} />
                  {emailStatus === 'sending'
                    ? 'Envoi en cours…'
                    : emailStatus === 'sent'
                      ? 'Demande envoyée ✓'
                      : 'Envoyer ma demande par email'}
                </button>
                {emailStatus === 'sent' && (
                  <p className={styles.submitNote}>
                    Votre demande a bien été envoyée à La Clean Compagny — nous revenons vers vous
                    rapidement.
                  </p>
                )}
                {emailStatus === 'error' && (
                  <p className={styles.errorText}>
                    L&apos;envoi a échoué. Réessayez, ou contactez-nous directement par téléphone
                    au {CONTACT.phoneDisplay}.
                  </p>
                )}
                {emailStatus === 'idle' && (
                  <p className={styles.submitNote}>
                    WhatsApp ouvre votre application avec un message pré-rempli à envoyer.
                    L&apos;email, lui, part directement depuis le site, sans rien ouvrir sur votre
                    appareil.
                  </p>
                )}
              </div>
            </div>
          )}

          {error && <p className={styles.errorText}>{error}</p>}

          {step < 3 && (
            <div className={styles.actions}>
              {step > 1 ? (
                <button type="button" className="btn btn-ghost" onClick={goBack}>
                  Retour
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="btn btn-cta" onClick={goNext}>
                Continuer
                <IconArrowRight size={18} />
              </button>
            </div>
          )}
          {step === 3 && (
            <div className={styles.actions}>
              <button type="button" className="btn btn-ghost" onClick={goBack}>
                Retour
              </button>
              <span />
            </div>
          )}
        </div>

        <aside className={styles.summary}>
          <div className={styles.summaryTitle}>Récapitulatif</div>

          {vehicle && (
            <div className={styles.summaryRow}>
              <span>Véhicule</span>
              <strong>{vehicle.label}</strong>
            </div>
          )}

          {selectedServices.length === 0 && !vehicle && (
            <p className={styles.summaryEmpty}>Votre sélection apparaîtra ici.</p>
          )}

          {selectedServices.map((s) => (
            <div className={styles.summaryRow} key={s.id}>
              <span>{s.name}</span>
              <strong>{s.basePrice} €</strong>
            </div>
          ))}

          {selectedServices.length > 0 && (
            <div className={styles.summaryTotal}>
              <div className={styles.summaryTotalLabel}>Estimation indicative</div>
              <div className={styles.summaryTotalValue}>
                {estimateLow} € – {estimateHigh} €
              </div>
            </div>
          )}

          <p className={styles.summaryDisclaimer}>
            Estimation indicative non contractuelle, calculée selon le gabarit du véhicule. Le
            devis définitif est établi avant toute intervention.
          </p>
        </aside>
      </div>
    </div>
  )
}
