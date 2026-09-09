'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import styles from './QuoteWizard.module.css'
import { VEHICLE_ICONS, IconCheck, IconArrowRight, IconWhatsapp, IconMail, IconUpload, IconClose } from './Icons'
import { VEHICLE_TYPES } from '@/lib/data/vehicles'
import { FORMULAS, COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT } from '@/lib/data/services'
import { VEHICLE_TYPE_TO_TIER, MOTO_PRICING, hasPriceGrid, getExactPrice } from '@/lib/data/pricing'
import { whatsappLink } from '@/lib/constants'
import { sanitizeField, sanitizeMessage, isValidEmail } from '@/lib/sanitize'

// Ces identifiants (service/template/clé publique EmailJS, cloud name/preset
// Cloudinary) ne sont PAS des secrets — EmailJS et Cloudinary les conçoivent
// pour vivre dans le bundle client (la vraie protection est côté tableau de
// bord : origines autorisées sur EmailJS, restrictions du preset d'upload non
// signé sur Cloudinary — voir README). Ils sont néanmoins lus depuis des
// variables d'environnement plutôt que codés en dur, pour pouvoir changer de
// compte par environnement (dev/prod) sans toucher au code. Les valeurs de
// repli ci-dessous reproduisent la configuration actuelle : le site continue
// de fonctionner tel quel si les variables ne sont pas encore définies.
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_ugnog14'
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_655hkaq'
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'SebLXFPtUd5Uj5qLX'

// ⚠️ Le nom du preset contient des espaces — vérifie qu'il correspond exactement
// (espaces et majuscules compris) à celui créé dans Cloudinary → Settings → Upload.
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'yn3d3ee9'
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'La clean compagny'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

const MIN_PHOTOS = 3
const MAX_PHOTOS = 5
const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 Mo par photo, contre la saturation de stockage
const ALLOWED_PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const EXTRA_SERVICES = [...COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT]

// Prestations complémentaires requises par d'autres prestations actives
// (ex : le lustrage classique impose le lavage extérieur). Générique : fonctionne
// avec n'importe quelle prestation qui déclare un champ `requires`.
function getRequiredIds(activeIds) {
  const required = new Set()
  EXTRA_SERVICES.forEach((s) => {
    if (activeIds.has(s.id) && s.requires) {
      s.requires.forEach((reqId) => required.add(reqId))
    }
  })
  return required
}

function getLockingServiceNames(id, activeIds) {
  return EXTRA_SERVICES.filter((s) => activeIds.has(s.id) && s.requires?.includes(id)).map((s) => s.name)
}

// Prix d'une prestation pour un véhicule donné, résolu STRICTEMENT depuis
// lib/data/pricing.js — même source que le sélecteur de la page d'accueil et la
// matrice de /prestations, pour ne plus jamais désynchroniser le formulaire.
// `price: undefined` = aucun prix connu → "Sur devis".
function resolveItemPrice(item, tierId, isPro) {
  if (isPro || item.priceOnRequest) return { price: undefined }

  const refId = item.pricingRef || item.id
  if (hasPriceGrid(refId)) {
    return { price: getExactPrice(refId, tierId) }
  }

  if (item.basePrice !== undefined) return { price: item.basePrice }
  return { price: undefined }
}

// Règle absolue du site : aucun prix de prestation complémentaire ne doit
// apparaître comme définitif (le tarif final dépend aussi de l'état du
// véhicule, pas seulement de son gabarit) — toujours préfixé par "dès".
function formatItemPrice(item, tierId, isPro) {
  const { price } = resolveItemPrice(item, tierId, isPro)
  if (price === undefined) return 'Sur devis'
  return `dès ${price} €`
}

const STEPS = [
  { id: 1, label: 'Véhicule' },
  { id: 2, label: 'Prestations' },
  { id: 3, label: 'Coordonnées' },
]

const EMPTY_CONTACT = {
  name: '',
  phone: '',
  email: '',
  date: '',
  message: '',
  fleetSize: '',
  maintenanceFrequency: '',
}

const MAINTENANCE_FREQUENCY_OPTIONS = [
  { value: 'ponctuel', label: 'Ponctuel' },
  { value: 'regulier', label: 'Régulier' },
  { value: 'contrat-annuel', label: 'Contrat annuel' },
]

// Lit les premiers octets du fichier et vérifie sa "signature magique" — les
// quelques octets fixes que chaque format d'image place en tête de fichier.
// Contrairement à l'extension ou à file.type (déclarés par le client, donc
// falsifiables), ces octets sont écrits par l'outil qui a produit le fichier :
// renommer un script malveillant en "photo.jpg" ne les change pas.
async function matchesImageSignature(file) {
  const buffer = await file.slice(0, 12).arrayBuffer()
  const b = new Uint8Array(buffer)

  const isJpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
  const isPng =
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  // WebP : conteneur RIFF (octets 0-3 "RIFF") dont la sous-forme est "WEBP" (octets 8-11).
  const isWebp =
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50

  return isJpeg || isPng || isWebp
}

// Validation stricte d'une photo avant qu'elle n'entre dans le formulaire :
// extension autorisée, type MIME réel déclaré par le navigateur, poids
// maximum, puis signature binaire — les quatre doivent concorder. Renvoie un
// message d'erreur, ou null si le fichier est accepté.
async function validatePhotoFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !ALLOWED_PHOTO_EXTENSIONS.includes(extension)) {
    return `« ${file.name} » : format non autorisé (jpg, jpeg, png ou webp uniquement).`
  }
  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type)) {
    return `« ${file.name} » : ce fichier n'est pas reconnu comme une image valide.`
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return `« ${file.name} » : fichier trop volumineux (5 Mo maximum par photo).`
  }
  const signatureOk = await matchesImageSignature(file)
  if (!signatureOk) {
    return `« ${file.name} » : le contenu du fichier ne correspond pas à une image valide.`
  }
  return null
}

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

export default function QuoteWizard({ initialVehicleId, initialFormulaId, initialExtraId, isPro = false }) {
  const form = useRef(null)
  const [step, setStep] = useState(1)
  const [vehicleId, setVehicleId] = useState(initialVehicleId || '')
  const [formulaId, setFormulaId] = useState(initialFormulaId || '')
  const [extraIds, setExtraIds] = useState(
    () => new Set(initialExtraId && EXTRA_SERVICES.some((s) => s.id === initialExtraId) ? [initialExtraId] : [])
  )
  const [contact, setContact] = useState(EMPTY_CONTACT)
  // Honeypot anti-spam : champ invisible pour un humain (CSS), que seuls les
  // bots naïfs remplissent automatiquement. S'il contient quoi que ce soit,
  // on fait semblant d'envoyer sans jamais réellement contacter EmailJS/WhatsApp.
  const [honeypot, setHoneypot] = useState('')
  const [photos, setPhotos] = useState([])
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [emailStatus, setEmailStatus] = useState('idle') // idle | uploading | sending | sent | error

  // La Moto est une exclusivité Espace Particulier : invisible côté Pro, quel
  // que soit l'état déjà sélectionné (bascule pro=1 en cours de route incluse).
  const vehicleOptions = isPro ? VEHICLE_TYPES.filter((v) => v.id !== 'moto') : VEHICLE_TYPES

  // Recherché dans vehicleOptions (pas VEHICLE_TYPES) : si l'URL forçait
  // vehicule=moto côté Pro (?pro=1&vehicule=moto), la Moto reste introuvable et
  // ne peut apparaître nulle part dans l'interface, résumé inclus.
  const vehicle = vehicleOptions.find((v) => v.id === vehicleId)
  const tierId = VEHICLE_TYPE_TO_TIER[vehicleId]
  const isMoto = vehicleId === 'moto'
  const formula = FORMULAS.find((f) => f.id === formulaId)
  const extras = EXTRA_SERVICES.filter((s) => extraIds.has(s.id))
  const selectedServices = [formula, ...extras].filter(Boolean)
  // Prestations offertes par la formule active (ex. lavage extérieur avec
  // Sortie de Concession) : verrouillées à l'état coché, et jamais facturées
  // en plus — cf. FORMULAS[...].includedExtraIds dans lib/data/services.js.
  const formulaIncludedIds = useMemo(() => new Set(formula?.includedExtraIds || []), [formula])
  const lockedExtraIds = useMemo(() => {
    const combined = getRequiredIds(extraIds)
    formulaIncludedIds.forEach((id) => combined.add(id))
    return combined
  }, [extraIds, formulaIncludedIds])

  // Total EXACT (plus d'estimation à la louche par multiplicateur) : chaque
  // prestation sélectionnée est résolue individuellement via resolveItemPrice,
  // qui interroge la même grille tarifaire que la page d'accueil. Les
  // prestations offertes par la formule (formulaIncludedIds) ne sont jamais
  // ajoutées au total : leur coût est déjà dans le prix de la formule.
  const pricedLines = selectedServices.map((s) =>
    formulaIncludedIds.has(s.id) ? { price: 0 } : resolveItemPrice(s, tierId, isPro)
  )
  const knownPriceLines = pricedLines.filter((l) => l.price !== undefined)
  const hasQuoteOnlyServices = pricedLines.some((l) => l.price === undefined)
  const total = knownPriceLines.reduce((sum, l) => sum + l.price, 0)

  const vehicleLabel = vehicle ? vehicle.label : 'Non précisé'
  const formulaLabel = formula ? formula.name : 'Aucune formule sélectionnée'
  const extrasLabel = extras.length ? extras.map((s) => s.name).join(', ') : 'Aucune'
  const estimationLabel = knownPriceLines.length
    ? `à partir de ${total} €${hasQuoteOnlyServices ? ' + prestations sur devis' : ''}`
    : isMoto
      ? `à partir de ${MOTO_PRICING.fromPrice} €`
      : hasQuoteOnlyServices || selectedServices.length
        ? 'Sur devis'
        : 'Non estimé'

  // Aperçus locaux des photos sélectionnées (avant upload), révoqués à chaque changement
  const previewUrls = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos])
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url))
  }, [previewUrls])

  function toggleExtra(id) {
    setExtraIds((prev) => {
      // Une prestation requise par une autre prestation active ne peut pas être décochée.
      if (prev.has(id) && getRequiredIds(prev).has(id)) return prev

      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)

      // Coche automatiquement les prestations requises par la sélection active.
      getRequiredIds(next).forEach((reqId) => next.add(reqId))

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

  async function handlePhotosChange(e) {
    const picked = Array.from(e.target.files || [])
    e.target.value = '' // permet de resélectionner le(s) même(s) fichier(s) ensuite
    if (!picked.length) return

    setError('')

    // Chaque fichier est validé (extension, MIME réel, poids, signature binaire)
    // avant d'entrer dans le formulaire — les fichiers rejetés ne sont jamais
    // ajoutés à `photos` et ne partiront donc jamais vers Cloudinary.
    const accepted = []
    const rejectionReasons = []
    for (const file of picked) {
      const reason = await validatePhotoFile(file)
      if (reason) rejectionReasons.push(reason)
      else accepted.push(file)
    }

    if (rejectionReasons.length) {
      setError(rejectionReasons.join(' '))
    }
    if (accepted.length) {
      setPhotos((prev) => [...prev, ...accepted].slice(0, MAX_PHOTOS))
    }
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // Récapitulatif complet en un seul champ (recapitulatif_complet),
  // pratique pour un template EmailJS minimal avec un seul placeholder.
  const maintenanceFrequencyLabel = MAINTENANCE_FREQUENCY_OPTIONS.find(
    (o) => o.value === contact.maintenanceFrequency
  )?.label

  // Version nettoyée des coordonnées (balises/scripts et caractères de contrôle
  // retirés), utilisée pour TOUT ce qui part réellement du formulaire (récapitulatif,
  // EmailJS, WhatsApp). Les champs de saisie eux-mêmes restent liés à `contact`
  // (brut) pour ne jamais perturber l'utilisateur pendant qu'il tape.
  const sanitizedContact = useMemo(
    () => ({
      name: sanitizeField(contact.name),
      phone: sanitizeField(contact.phone, 40),
      email: sanitizeField(contact.email, 254),
      date: sanitizeField(contact.date, 20),
      message: sanitizeMessage(contact.message),
      fleetSize: sanitizeField(contact.fleetSize, 10),
    }),
    [contact]
  )

  const recap = useMemo(() => {
    const lines = [
      isPro ? 'Nouvelle demande de devis flotte — La Clean Compagny' : 'Nouvelle demande de devis — La Clean Compagny',
      '',
      `Véhicule : ${vehicleLabel}`,
      `Formule habitacle : ${formulaLabel}`,
      `Prestations complémentaires : ${extrasLabel}`,
      isPro ? null : `Estimation indicative : ${estimationLabel}`,
      `Photos jointes : ${photos.length}`,
      isPro && sanitizedContact.fleetSize ? `Taille de la flotte : ${sanitizedContact.fleetSize} véhicule(s)` : null,
      isPro && maintenanceFrequencyLabel ? `Fréquence d'entretien souhaitée : ${maintenanceFrequencyLabel}` : null,
      '',
      'Coordonnées :',
      `Nom : ${sanitizedContact.name || '—'}`,
      sanitizedContact.phone ? `Téléphone : ${sanitizedContact.phone}` : null,
      sanitizedContact.email ? `Email : ${sanitizedContact.email}` : null,
      sanitizedContact.date ? `Date souhaitée : ${sanitizedContact.date}` : null,
      sanitizedContact.message ? `Message : ${sanitizedContact.message}` : null,
    ]
    return lines.filter((l) => l !== null).join('\n')
  }, [isPro, vehicleLabel, formulaLabel, extrasLabel, estimationLabel, photos.length, sanitizedContact, maintenanceFrequencyLabel])

  // Validation partagée entre l'envoi par email et l'envoi par WhatsApp : coordonnées
  // complètes (dont l'email, obligatoire et de format valide) et un nombre de photos
  // compris entre MIN_PHOTOS et MAX_PHOTOS. Renvoie un message d'erreur, ou null si
  // tout est valide. S'appuie sur sanitizedContact : un champ rempli uniquement de
  // balises/caractères de contrôle est donc traité comme vide, pas comme valide.
  function validateContactAndPhotos() {
    if (!sanitizedContact.name || !sanitizedContact.phone || !sanitizedContact.email) {
      return 'Merci de renseigner votre nom, votre téléphone et votre email.'
    }
    if (!isValidEmail(sanitizedContact.email)) {
      return 'Merci de renseigner une adresse email valide.'
    }
    if (isPro && (!sanitizedContact.fleetSize || !contact.maintenanceFrequency)) {
      return 'Merci de renseigner la taille de votre flotte et la fréquence d’entretien souhaitée.'
    }
    if (photos.length < MIN_PHOTOS) {
      return `Merci d'ajouter au moins ${MIN_PHOTOS} photos de votre véhicule (${MIN_PHOTOS} à ${MAX_PHOTOS} photos).`
    }
    if (photos.length > MAX_PHOTOS) {
      return `Vous ne pouvez pas joindre plus de ${MAX_PHOTOS} photos.`
    }
    return null
  }

  function handleWhatsapp() {
    // Bot piégé par le honeypot : on fait semblant que tout s'est bien passé,
    // sans jamais ouvrir WhatsApp ni révéler que la soumission a été bloquée.
    if (honeypot) {
      setError('')
      return
    }
    const validationError = validateContactAndPhotos()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    window.open(whatsappLink(recap), '_blank', 'noopener,noreferrer')
  }

  function resetWizard() {
    setContact(EMPTY_CONTACT)
    setHoneypot('')
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

    // Bot piégé par le honeypot : on affiche un faux succès sans jamais
    // appeler Cloudinary ni EmailJS, pour ne pas gaspiller de quota/vider la
    // boîte mail — et sans indice qui permettrait au bot d'ajuster son script.
    if (honeypot) {
      setEmailStatus('sent')
      return
    }

    const validationError = validateContactAndPhotos()
    if (validationError) {
      setError(validationError)
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
      nom_complet: sanitizedContact.name,
      telephone: sanitizedContact.phone,
      email: sanitizedContact.email,
      date_souhaitee: sanitizedContact.date,
      message: sanitizedContact.message,
      nombre_photos: String(photoUrls.length),
      // Repli garanti : liste de liens texte (fonctionne dans un simple bloc Texte).
      photos_liens: photosLiens,
      taille_flotte: isPro ? sanitizedContact.fleetSize : '',
      frequence_entretien: isPro ? maintenanceFrequencyLabel || '' : '',
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
                <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }}>
                  {isPro ? 'Quel est le gabarit principal de votre flotte ?' : 'Quel est votre véhicule ?'}
                </h2>
                <p className="lead" style={{ marginBottom: 28 }}>
                  {isPro
                    ? 'Sélectionnez le type de véhicule dominant : vous pourrez préciser la composition exacte de votre flotte à l’étape suivante.'
                    : 'Le tarif final dépend du gabarit de votre véhicule.'}
                </p>
                <div className={styles.vehicleGrid}>
                  {vehicleOptions.map((v) => {
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

                {isMoto && (
                  <div className={styles.motoNote}>
                    🏍️ Prestation moto : à partir de {MOTO_PRICING.fromPrice} €. Les formules
                    ci-dessous sont pensées pour l&apos;habitacle d&apos;une voiture — sélectionnez
                    plutôt les soins souhaités, nous affinons le tarif exact avec vous selon le
                    modèle.
                  </div>
                )}

                <div className={styles.blockTitle}>Formule habitacle (au choix)</div>
                <div className={styles.formulaOptions}>
                  {FORMULAS.map((f) => {
                    const active = f.id === formulaId
                    return (
                      <div
                        key={f.id}
                        className={`${styles.optionCard} ${active ? styles.optionCardActive : ''}`}
                        onClick={() => {
                          const nextId = active ? '' : f.id
                          setFormulaId(nextId)
                          setError('')
                          // Coche automatiquement les prestations offertes par
                          // cette formule (ex. lavage extérieur avec Sortie de
                          // Concession) — jamais décochées automatiquement en
                          // changeant de formule, l'utilisateur reste libre de
                          // les retirer lui-même une fois déverrouillées.
                          const nextIncluded = FORMULAS.find((form) => form.id === nextId)?.includedExtraIds
                          if (nextIncluded?.length) {
                            setExtraIds((prev) => {
                              const next = new Set(prev)
                              nextIncluded.forEach((extraId) => next.add(extraId))
                              return next
                            })
                          }
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
                            <span className={styles.optionPrice}>{formatItemPrice(f, tierId, isPro)}</span>
                          </div>
                          <p className={styles.optionDesc}>{f.tagline}</p>
                          {f.promo && <span className={styles.optionPromo}>🎁 {f.promo}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className={styles.blockTitle}>Prestations complémentaires (optionnel)</div>
                <div className={styles.formulaOptions}>
                  {EXTRA_SERVICES.map((s) => {
                    const active = extraIds.has(s.id)
                    const locked = active && lockedExtraIds.has(s.id)
                    const includedByFormula = formulaIncludedIds.has(s.id)
                    const lockingNames = locked
                      ? [...getLockingServiceNames(s.id, extraIds), ...(includedByFormula ? [formula.name] : [])]
                      : []
                    return (
                      <div
                        key={s.id}
                        className={`${styles.optionCard} ${active ? styles.optionCardActive : ''} ${locked ? styles.optionCardLocked : ''}`}
                        onClick={() => {
                          if (locked) return
                          toggleExtra(s.id)
                          setError('')
                        }}
                        role="checkbox"
                        aria-checked={active}
                        aria-disabled={locked || undefined}
                        tabIndex={locked ? -1 : 0}
                      >
                        <span className={`${styles.optionControl} ${styles.optionControlCheckbox} ${active ? styles.optionControlActive : ''}`}>
                          {active && <IconCheck size={12} />}
                        </span>
                        <div className={styles.optionBody}>
                          <div className={styles.optionName}>
                            <span>{s.name}</span>
                            <span className={styles.optionPrice}>
                              {includedByFormula ? '🎁 Offert' : formatItemPrice(s, tierId, isPro)}
                            </span>
                          </div>
                          <p className={styles.optionDesc}>{s.description}</p>
                          {locked && (
                            <p className={styles.optionLockedNote}>
                              🔒 Inclus automatiquement avec {lockingNames.join(', ')}
                            </p>
                          )}
                          {active && s.requiresNote && (
                            <p className={styles.optionInfoNote}>{s.requiresNote}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }}>
                  {isPro ? 'Vos coordonnées et votre flotte' : 'Vos coordonnées'}
                </h2>
                <p className="lead" style={{ marginBottom: 28 }}>
                  {isPro
                    ? 'Nous vous recontactons rapidement pour établir votre devis flotte, sur-mesure selon votre volume.'
                    : 'Nous vous recontactons rapidement pour confirmer votre devis définitif.'}
                </p>
                <div className={styles.form}>
                  {/* Honeypot anti-spam : invisible pour un humain, souvent rempli par les
                      bots naïfs qui remplissent tous les champs d'un formulaire. */}
                  <div
                    aria-hidden="true"
                    style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
                  >
                    <label htmlFor="societe">Société</label>
                    <input
                      id="societe"
                      name="societe"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>
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
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      autoComplete="email"
                      required
                    />
                  </div>
                  {isPro && (
                    <div className={styles.field}>
                      <label htmlFor="fleetSize">Taille de la flotte (nombre de véhicules) *</label>
                      <input
                        id="fleetSize"
                        name="taille_flotte"
                        type="number"
                        min="1"
                        step="1"
                        value={contact.fleetSize}
                        onChange={(e) => setContact({ ...contact, fleetSize: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  {isPro && (
                    <div className={styles.field}>
                      <label htmlFor="maintenanceFrequency">Fréquence d&apos;entretien souhaitée *</label>
                      <select
                        id="maintenanceFrequency"
                        name="frequence_entretien"
                        value={contact.maintenanceFrequency}
                        onChange={(e) => setContact({ ...contact, maintenanceFrequency: e.target.value })}
                        required
                      >
                        <option value="" disabled>
                          Choisissez une fréquence
                        </option>
                        {MAINTENANCE_FREQUENCY_OPTIONS.map((o) => (
                          <option value={o.value} key={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                      placeholder={
                        isPro
                          ? 'Précisez la composition de votre flotte, vos contraintes de planning, vos sites…'
                          : 'Précisez tout élément utile : état du véhicule, accès, disponibilités…'
                      }
                    />
                  </div>
                </div>

                <div className={styles.photoField}>
                  <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    Photos de votre véhicule * ({MIN_PHOTOS} à {MAX_PHOTOS} photos, jpg/png/webp, 5 Mo max chacune)
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
                    accept="image/jpeg,image/png,image/webp"
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

            {selectedServices.length > 0 && (
              <p className={styles.summaryText}>
                Vous avez sélectionné : {selectedServices.map((s) => s.name).join(' + ')}
              </p>
            )}

            {!isPro && (selectedServices.length > 0 || isMoto) && (
              <div className={styles.summaryRow}>
                <span>Estimation</span>
                <strong>{estimationLabel}</strong>
              </div>
            )}

            <p className={styles.summaryDisclaimer}>
              Récapitulatif indicatif de votre sélection, sans engagement. Le devis chiffré
              définitif vous est communiqué par nos soins avant toute intervention.
            </p>
          </aside>
        </div>
      )}
    </form>
  )
}
