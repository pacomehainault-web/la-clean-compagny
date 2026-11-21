'use client'

import { useEffect, useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { reviewText, whatsappHref, smsHref } from '../_lib/crm'
import { photoUrl } from '../_lib/media'

// Dernière photo « après » d'un client (celle prise à la fin de la prestation).
export function lastAfterPhoto(photos, leadId) {
  return (
    photos
      .filter((p) => p.lead_id === leadId && p.kind === 'apres')
      .sort((a, b) => (a.taken_on === b.taken_on ? (a.created_at < b.created_at ? 1 : -1) : a.taken_on < b.taken_on ? 1 : -1))[0] || null
  )
}

// Demande d'avis (ou relance) avec la photo « après ».
// - Sur téléphone : la vraie photo part avec le message, via le menu de partage (WhatsApp, Messages…).
//   Un lien wa.me ne peut PAS joindre de photo : c'est pour ça que le bouton WhatsApp simple n'en mettait pas.
// - En secours (texte seul) : le lien de la page client est placé en premier, WhatsApp affiche alors
//   la photo « après » en aperçu (image de partage de la page /suivi).
export default function ReviewSend({ lead, photo, onSent, compact = false, relance = false }) {
  const [prepared, setPrepared] = useState({ url: '', file: null, can: false })
  const [note, setNote] = useState('')
  const [shared, setShared] = useState(false)
  const url = photo ? photoUrl(photo.path) : ''
  const file = prepared.url === url ? prepared.file : null
  const canShare = prepared.url === url && prepared.can

  useEffect(() => {
    let alive = true
    if (!url || typeof navigator === 'undefined' || !navigator.canShare) return
    fetch(url, { mode: 'cors' })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('photo'))))
      .then((blob) => {
        if (!alive) return
        const name = `la-clean-compagny-${(lead.first_name || 'voiture').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`
        const f = new File([blob], name, { type: blob.type || 'image/jpeg' })
        setPrepared({ url, file: f, can: navigator.canShare({ files: [f] }) })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [url, lead.first_name])

  const text = reviewText(lead, !!photo, { relance })
  // Texte seul : lien de la page client en premier → aperçu WhatsApp = photo « après ».
  const textOnly = reviewText(lead, !!photo, { relance, linkFirst: !!photo })

  async function shareWithPhoto() {
    // Copie de secours : si l'appli n'affiche pas le texte sous la photo, il suffit de le coller.
    navigator.clipboard?.writeText(text).catch(() => {})
    try {
      await navigator.share({ files: [file], text })
      setShared(true)
      onSent?.('partage')
      setNote('Photo envoyée. Si le texte n’est pas parti avec, collez-le (il est copié) ou utilisez « Envoyer le texte ».')
    } catch (e) {
      if (e?.name !== 'AbortError') setNote('Partage impossible : utilisez WhatsApp ci-dessous (la photo s’affiche en aperçu du lien).')
    }
  }

  return (
    <div className={v2.reviewSend}>
      {photo && (
        <div className={v2.reviewPhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Photo après" />
          <span>{canShare ? 'La photo « après » part avec le message.' : 'La photo « après » s’affiche en aperçu du lien dans WhatsApp.'}</span>
        </div>
      )}
      {canShare && file ? (
        <>
          <button type="button" className={`${styles.actWa} ${styles.btnBlock}`} onClick={shareWithPhoto}>
            <Icon name="camera" size={18} /> {shared ? 'Renvoyer avec la photo' : 'Envoyer avec la photo'}
          </button>
          {!shared && <p className={styles.hint}>Choisissez WhatsApp ou Messages, puis {lead.first_name || 'le client'}.</p>}
          {note && <p className={styles.hint}>{note}</p>}
          {(shared || !compact) && (
            <div className={v2.inlineLinks}>
              <a className={styles.linkBtn} href={whatsappHref(lead, textOnly)} target="_blank" rel="noopener noreferrer" onClick={() => onSent?.('whatsapp')}>
                <Icon name="whatsapp" size={15} /> {shared ? 'Envoyer le texte' : 'Texte seul (WhatsApp)'}
              </a>
              <a className={styles.linkBtn} href={smsHref(lead, textOnly)} onClick={() => onSent?.('sms')}>
                <Icon name="sms" size={15} /> SMS
              </a>
            </div>
          )}
        </>
      ) : (
        <div className={styles.doneActions}>
          <a className={styles.actWa} href={whatsappHref(lead, textOnly)} target="_blank" rel="noopener noreferrer" onClick={() => onSent?.('whatsapp')}>
            <Icon name="whatsapp" size={18} /> WhatsApp
          </a>
          <a className={styles.btnSecondary} href={smsHref(lead, textOnly)} onClick={() => onSent?.('sms')}>
            <Icon name="sms" size={18} /> SMS
          </a>
        </div>
      )}
    </div>
  )
}
