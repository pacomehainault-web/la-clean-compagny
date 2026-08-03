'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import styles from './QuoteWizard.module.css'
import { VEHICLE_ICONS, IconCheck, IconArrowRight, IconWhatsapp, IconMail, IconUpload, IconClose } from './Icons'
import { VEHICLE_TYPES, getVehicleType } from '@/lib/data/vehicles'
import { FORMULAS, COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT } from '@/lib/data/services'
import { whatsappLink, CONTACT } from '@/lib/constants'

const EMAILJS_SERVICE_ID = 'service_ugnog14'
const EMAILJS_TEMPLATE_ID = 'template_655hkaq'
const EMAILJS_PUBLIC_KEY = 'SebLXFPtUd5Uj5qLX'

// ⚠️ Le nom du preset contient des espaces — vérifie qu'il correspond exactement
// (espaces et majuscules compris) à celui créé dans Cloudinary → Settings → Upload.
const CLOUDINARY_CLOUD_NAME = 'yn3d3ee9'
const CLOUDINARY_UPLOAD_PRESET = 'La clean compagny'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

const MIN_PHOTOS = 2
const MAX_PHOTOS = 6

const EXTRA_SERVICES = [...COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT]

const STEPS = [
  { id: 1, label: 'Véhicule' },
  { id: 2, label: 'Prestations' },
  { id: 3, label: 'Coordonnées' },
]

const EMPTY_CONTACT = { name: '', phone: '', email: '', date: '', message: '' }

// Upload une photo vers Cloudinary et renvoie son secure_url.
// Logue chaque étape dans la console pour pouvoir déboguer facilement (F12 → Console).
async function uploadPhotoToCloudinary(file, index) {
  console.log(`[Cloudinary] Envoi de la photo ${index + 1} (${file.name}, ${Math.round(file.size / 1024)} Ko)…`)

  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data })
  const json = await res.json().catch(() => null)

  if (!res.ok || !json) {
    const detail = json?.error?.message || `HTTP ${res.status}`
    console.error(`[Cloudinary] Échec pour la photo ${index + 1} :`, detail, json)
    throw new Error(`Photo ${index + 1} refusée par Cloudinary : ${detail}`)
  }

  if (!json.secure_url) {
    console.error(`[Cloudinary] Réponse sans secure_url pour la photo ${index + 1} :`, json)
    throw new Error(`Photo ${index + 1} : Cloudinary n'a renvoyé aucune URL.`)
  }

  console.log(`[Cloudinary] Photo ${index + 1} envoyée avec succès →`, json.secure_url)
  return json.secure_url
}

export default function QuoteWizard({ initialVehicleId, initialFormulaId, initialExtraId }) {
  const form = useRef(null)
  const [step, setStep] = useState(1)
  const [vehicleId, setVehicleId] = useState(initialVehicleId || '')
  const [formulaId, setFormulaId] = useState(initialFormulaId || '')
  const [extraIds, setExtraIds] = useState(
    () => new Set(initialExtraId && EXTRA_SERVICES.some((s) => s.id === initialExtraId) ? [initialExtraId] : [])
  )
  const [contact, setContact] = useState(EMPTY_CONTACT)
  const [photos, setPhotos] = useState([])
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [emailStatus, setEmailStatus] = useState('idle') // idle | uploading | sending | sent | error

  const vehicle = getVehicleType(vehicleId)
  const formula = FORMULAS.find((f) => f.id === formulaId)
  const extras = EXTRA_SERVICES.filter((s) => extraIds.has(s.id))
  const selectedServices = [formula, ...extras].filter(Boolean)

  const multiplier = vehicle?.priceMultiplier || 1
  const pricedServices = selectedServices.filter((s) => !s.priceOnRequest)
  const hasQuoteOnlyServices = selectedServices.some((s) => s.priceOnRequest)
  const subtotal = pricedServices.reduce((sum, s) => sum + s.basePrice, 0)
  const estimateLow = Math.round(subtotal * multiplier * 0.92)
  const estimateHigh = Math.round(subtotal * multiplier * 1.18)

  const vehicleLabel = vehicle ? vehicle.label : 'Non précisé'
  const formulaLabel = formula ? formula.name : 'Aucune formule sélectionnée'
  const extrasLabel = extras.length ? extras.map((s) => s.name).join(', ') : 'Aucune'
  const estimationLabel = pricedServices.length
    ? `${estimateLow} € – ${estimateHigh} €${hasQuoteOnlyServices ? ' + prestations sur devis' : ''}`
    : hasQuoteOnlyServices
      ? 'Sur devis'
      : 'Non estimé'

  // Aperçus locaux des photos sélectionnées (avant upload), révoqués à chaque changement
  const previewUrls = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos])
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url))
  }, [previewUrls])

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

  function handlePhotosChange(e) {
    const picked = Array.from(e.target.files || [])
    e.target.value = '' // permet de resélectionner le(s) même(s) fichier(s) ensuite
    if (!picked.length) return

    setError('')
    setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS))
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // Récapitulatif complet en un seul champ (recapitulatif_complet),
  // pratique pour un template EmailJS minimal avec un seul placeholder.
  const recap = useMemo(() => {
    const lines = [
      'Nouvelle demande de devis — La Clean Compagny',
      '',
      `Véhicule : ${vehicleLabel}`,
      `Formule habitacle : ${formulaLabel}`,
      `Prestations complémentaires : ${extrasLabel}`,
      `Estimation indicative : ${estimationLabel}`,
      `Photos jointes : ${photos.length}`,
      '',
      'Coordonnées :',
      `Nom : ${contact.name || '—'}`,
      contact.phone ? `Téléphone : ${contact.phone}` : null,
      contact.email ? `Email : ${contact.email}` : null,
      contact.date ? `Date souhaitée : ${contact.date}` : null,
      contact.message ? `Message : ${contact.message}` : null,
    ]
    return lines.filter((l) => l !== null).join('\n')
  }, [vehicleLabel, formulaLabel, extrasLabel, estimationLabel, photos.length, contact])

  function handleWhatsapp() {
    if (!contact.name || !contact.phone) {
      setError('Merci de renseigner au moins votre nom et votre téléphone.')
      return
    }
    setError('')
    window.open(whatsappLink(recap), '_blank', 'noopener,noreferrer')
  }

  function resetWizard() {
    setContact(EMPTY_CONTACT)
    setVehicleId('')
    setFormulaId('')
    setExtraIds(new Set())
    setPhotos([])
    setStep(1)
    setEmailStatus('idle')
    setSubmitError('')
  }

  const envoyerEmail = async (e) => {
    e.preventDefault()

    if (!contact.name || !contact.phone) {
      setError('Merci de renseigner au moins votre nom et votre téléphone.')
      return
    }

    if (photos.length < MIN_PHOTOS) {
      setError(`Merci d'ajouter au moins ${MIN_PHOTOS} photos de votre véhicule avant d'envoyer votre demande.`)
      return
    }

    setError('')
    setSubmitError('')
    setEmailStatus('uploading')

    // --- 1. Upload des photos vers Cloudinary -----------------------------
    let photoUrls = []
    try {
      photoUrls = await Promise.all(photos.map((file, i) => uploadPhotoToCloudinary(file, i)))
      console.log('[Cloudinary] Toutes les photos sont en ligne :', photoUrls)
    } catch (err) {
      console.error('[Cloudinary] Upload interrompu :', err)
      setEmailStatus('error')
      setSubmitError('❌ Une erreur est survenue lors de l’envoi de votre demande. Veuillez vérifier votre connexion ou réessayer.')
      return
    }

    // --- 2. Construction des variables photos, au format Design Editor ------
    // Le Design Editor EmailJS traite chaque variable comme du texte brut : un bloc
    // "Image" doit donc être lié individuellement à une variable (photo_url_1,
    // photo_url_2…) plutôt que de recevoir un bloc HTML tout fait dans une variable.
    const photosLiens = photoUrls.map((url, i) => `Photo ${i + 1} : ${url}`).join('\n')
    const recapAvecPhotos = `${recap}\n\nLiens des photos :\n${photosLiens}`

    const templateParams = {
      type_vehicule: vehicleLabel,
      formule_habitacle: formulaLabel,
      prestations_complementaires: extrasLabel,
      estimation_prix: estimationLabel,
      recapitulatif_complet: recapAvecPhotos,
      nom_complet: contact.name,
      telephone: contact.phone,
      email: contact.email,
      date_souhaitee: contact.date,
      message: contact.message,
      nombre_photos: String(photoUrls.length),
      // Repli garanti : liste de liens texte (fonctionne dans un simple bloc Texte).
      photos_liens: photosLiens,
    }
    // Variables individuelles pour lier chaque photo à un bloc "Image" du Design Editor.
    for (let i = 0; i < MAX_PHOTOS; i += 1) {
      templateParams[`photo_url_${i + 1}`] = photoUrls[i] || ''
    }

    console.log('[EmailJS] Paramètres envoyés :', templateParams)

    // --- 3. Envoi EmailJS ---------------------------------------------------
    setEmailStatus('sending')

    try {
      const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
      console.log('[EmailJS] Succès !', result.status, result.text)
      setEmailStatus('sent')
    } catch (err) {
      console.error('[EmailJS] Échec de l’envoi :', err)
      setEmailStatus('error')
      setSubmitError('❌ Une erreur est survenue lors de l’envoi de votre demande. Veuillez vérifier votre connexion ou réessayer.')
    }
  }

  const isBusy = emailStatus === 'uploading' || emailStatus === 'sending'

  return (
    <form ref={form} onSubmit={envoyerEmail}>
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

      {emailStatus === 'sent' ? (
        <div className={styles.wrap}>
          <div className={styles.successPanel}>
            <div className={styles.successIcon} aria-hidden="true">
              ✅
            </div>
            <h2>Merci ! Votre demande a bien été envoyée</h2>
            <p>
              Nous avons bien reçu votre demande avec vos photos. Nous l&apos;étudierons et vous
              recontacterons très rapidement.
            </p>
            <button type="button" className="btn btn-cta" style={{ marginTop: 28 }} onClick={resetWizard}>
              Faire une nouvelle demande
            </button>
          </div>
        </div>
      ) : (
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
                            <span className={styles.optionPrice}>
                              {s.priceOnRequest ? 'Sur devis' : `dès ${s.basePrice} €`}
                            </span>
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
                      name="nom_complet"
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
                      name="telephone"
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
                      name="email"
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
                      name="date_souhaitee"
                      type="date"
                      value={contact.date}
                      onChange={(e) => setContact({ ...contact, date: e.target.value })}
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label htmlFor="message">Message (optionnel)</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={contact.message}
                      onChange={(e) => setContact({ ...contact, message: e.target.value })}
                      placeholder="Précisez tout élément utile : état du véhicule, accès, disponibilités…"
                    />
                  </div>
                </div>

                <div className={styles.photoField}>
                  <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    Photos de votre véhicule * ({MIN_PHOTOS} minimum)
                  </p>

                  <label
                    htmlFor="photos"
                    className={`${styles.photoDropzone} ${photos.length >= MAX_PHOTOS ? styles.photoDropzoneDisabled : ''}`}
                  >
                    <IconUpload size={18} />
                    {photos.length >= MAX_PHOTOS
                      ? `Maximum ${MAX_PHOTOS} photos atteint`
                      : 'Ajouter des photos (extérieur, intérieur, points particuliers…)'}
                  </label>
                  <input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosChange}
                    disabled={photos.length >= MAX_PHOTOS}
                    style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                  />

                  <p className={`${styles.photoHint} ${photos.length > 0 && photos.length < MIN_PHOTOS ? styles.photoHintError : ''}`}>
                    {photos.length} / {MAX_PHOTOS} photo{photos.length > 1 ? 's' : ''} sélectionnée
                    {photos.length > 1 ? 's' : ''}
                    {photos.length < MIN_PHOTOS ? ` — ${MIN_PHOTOS} minimum requis` : ''}
                  </p>

                  {photos.length > 0 && (
                    <div className={styles.photoGrid}>
                      {photos.map((file, index) => (
                        <div className={styles.photoThumb} key={`${file.name}-${index}`}>
                          <img src={previewUrls[index]} alt={`Aperçu photo ${index + 1}`} />
                          <button
                            type="button"
                            className={styles.photoRemove}
                            onClick={() => removePhoto(index)}
                            aria-label={`Retirer la photo ${index + 1}`}
                          >
                            <IconClose size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.submitActions}>
                  <button type="button" className="btn btn-cta btn-block" onClick={handleWhatsapp} disabled={isBusy}>
                    <IconWhatsapp size={18} />
                    Envoyer ma demande par WhatsApp
                  </button>
                  <button type="submit" className="btn btn-outline btn-block" disabled={isBusy}>
                    <IconMail size={18} />
                    {emailStatus === 'uploading'
                      ? 'Envoi des photos en cours…'
                      : emailStatus === 'sending'
                        ? 'Envoi en cours…'
                        : 'Envoyer ma demande par email'}
                  </button>

                  {submitError && <div className={styles.errorBanner}>{submitError}</div>}

                  {!submitError && emailStatus === 'idle' && (
                    <p className={styles.submitNote}>
                      WhatsApp ouvre votre application avec un message pré-rempli à envoyer.
                      L&apos;email, lui, part directement depuis le site, avec vos photos, sans rien
                      ouvrir sur votre appareil.
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
                <button type="button" className="btn btn-ghost" onClick={goBack} disabled={isBusy}>
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
                <strong>{s.priceOnRequest ? 'Sur devis' : `${s.basePrice} €`}</strong>
              </div>
            ))}

            {pricedServices.length > 0 && (
              <div className={styles.summaryTotal}>
                <div className={styles.summaryTotalLabel}>Estimation indicative</div>
                <div className={styles.summaryTotalValue}>
                  {estimateLow} € – {estimateHigh} €
                </div>
                {hasQuoteOnlyServices && (
                  <div className={styles.summaryTotalLabel} style={{ marginTop: 6 }}>
                    + prestations sur devis
                  </div>
                )}
              </div>
            )}

            {!pricedServices.length && hasQuoteOnlyServices && (
              <div className={styles.summaryTotal}>
                <div className={styles.summaryTotalLabel}>Tarif</div>
                <div className={styles.summaryTotalValue}>Sur devis</div>
              </div>
            )}

            <p className={styles.summaryDisclaimer}>
              Estimation indicative non contractuelle, calculée selon le gabarit du véhicule. Le
              devis définitif est établi avant toute intervention.
            </p>
          </aside>
        </div>
      )}
    </form>
  )
}
