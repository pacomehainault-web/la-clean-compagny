'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import styles from './LeadForm.module.css'
import { submitLead, isValidPhone } from '@/lib/leads'
import { CONTACT, telLink } from '@/lib/constants'

const SERVICES = [
  'Nettoyage intérieur',
  'Intérieur + extérieur',
  'Lavage extérieur',
  'Lustrage / polissage',
  'Rénovation des phares',
  'Traitement céramique',
  'Canapé, matelas, tapis',
  'Autre / je ne sais pas',
]

// Formulaire court « Être rappelé » : prénom + téléphone suffisent. Le
// prospect part dans la base du dashboard et Enzo reçoit un email.
// variant="hero" (fond blanc) ou "dark" (fond sombre, fin de page).
export default function LeadForm({ variant = 'hero', source = 'accueil', title, subtitle, withVehicle = false }) {
  const id = useId()
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')
  const [firstName, setFirstName] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (data.get('website')) {
      setStatus('sent') // pot de miel : un robot a rempli le champ caché
      return
    }
    const prenom = String(data.get('prenom') || '').trim()
    const tel = String(data.get('tel') || '').trim()
    if (!prenom) return setError('Indiquez votre prénom.')
    if (!isValidPhone(tel)) return setError('Indiquez un numéro de téléphone valide (ex. 06 12 34 56 78).')

    setError('')
    setStatus('sending')
    try {
      await submitLead({
        firstName: prenom,
        phone: tel,
        service: data.get('prestation'),
        city: data.get('ville'),
        vehicle: data.get('vehicule'),
        consentRelance: data.get('relance') === 'on',
        source,
      })
      setFirstName(prenom)
      setStatus('sent')
    } catch {
      setStatus('error')
      setError(`L'envoi n'a pas fonctionné. Appelez-nous directement au ${CONTACT.phoneDisplay}.`)
    }
  }

  const cls = `${styles.form} ${variant === 'dark' ? styles.dark : ''}`

  if (status === 'sent') {
    return (
      <div className={cls} role="status">
        <p className={styles.title}>Merci{firstName ? ` ${firstName}` : ''} !</p>
        <p className={styles.subtitle}>
          Votre demande est bien arrivée. Enzo vous rappelle sous 24h ouvrées avec un prix précis.
        </p>
        <a href={telLink()} className={`btn btn-outline ${styles.submit}`}>
          Pressé ? Appelez le {CONTACT.phoneDisplay}
        </a>
      </div>
    )
  }

  return (
    <form className={cls} onSubmit={onSubmit} noValidate>
      <div>
        <p className={styles.title}>{title || 'Être rappelé gratuitement'}</p>
        <p className={styles.subtitle}>{subtitle || 'Enzo vous rappelle sous 24h ouvrées avec un prix précis.'}</p>
      </div>

      <label className={styles.label} htmlFor={`${id}-prenom`}>
        Prénom
        <input id={`${id}-prenom`} className={styles.field} name="prenom" type="text" autoComplete="given-name" placeholder="Votre prénom" required />
      </label>
      <label className={styles.label} htmlFor={`${id}-tel`}>
        Téléphone
        <input id={`${id}-tel`} className={styles.field} name="tel" type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" required />
      </label>
      {withVehicle ? (
        <label className={styles.label} htmlFor={`${id}-vehicule`}>
          Votre véhicule
          <input id={`${id}-vehicule`} className={styles.field} name="vehicule" type="text" placeholder="Ex. Peugeot 3008, intérieur sale" />
        </label>
      ) : (
        <>
          <label className={styles.label} htmlFor={`${id}-prestation`}>
            Prestation souhaitée
            <select id={`${id}-prestation`} className={styles.field} name="prestation" defaultValue={SERVICES[0]}>
              {SERVICES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className={styles.label} htmlFor={`${id}-ville`}>
            Ville
            <input id={`${id}-ville`} className={styles.field} name="ville" type="text" autoComplete="address-level2" placeholder="Angers, Trélazé, Avrillé…" />
          </label>
        </>
      )}

      {/* Champ piège invisible pour les robots */}
      <input className={styles.honeypot} name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <label className={styles.consent}>
        <input type="checkbox" name="relance" />
        <span>J&apos;accepte de recevoir un rappel d&apos;entretien et une demande d&apos;avis après la prestation.</span>
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={`btn btn-cta ${styles.submit}`} disabled={status === 'sending'}>
        {status === 'sending' ? 'Envoi…' : 'Être rappelé'}
      </button>
      <p className={styles.legal}>
        Vos coordonnées servent uniquement à vous recontacter.{' '}
        <Link href="/politique-de-confidentialite">Confidentialité</Link> · ou{' '}
        <Link href="/devis">composez votre devis en ligne</Link>
      </p>
    </form>
  )
}
