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

// Demande d'avis : la photo « après » part avec le message (WhatsApp, Messages…) via le menu
// de partage du téléphone. La photo est préparée à l'avance, pour que le partage s'ouvre au toucher.
export default function ReviewSend({ lead, photo, onSent, compact = false }) {
  const [prepared, setPrepared] = useState({ url: '', file: null, can: false })
  const [note, setNote] = useState('')
  const url = photo ? photoUrl(photo.path) : ''
  const file = prepared.url === url ? prepared.file : null
  const canShare = prepared.url === url && prepared.can

  useEffect(() => {
    let alive = true
    if (!url || typeof navigator === 'undefined' || !navigator.canShare) return
    fetch(url)
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

  const text = reviewText(lead, !!photo)
  // Sans partage de fichier (ordinateur) : le lien de la photo est ajouté au message.
  const textWithLink = photo ? `${text}\n\nLa photo : ${url}` : text

  async function shareWithPhoto() {
    // Copie de secours : si l'appli n'affiche pas le texte, il suffit de le coller.
    navigator.clipboard?.writeText(text).catch(() => {})
    try {
      await navigator.share({ files: [file], text })
      onSent?.('partage')
      setNote('Si le message n’apparaît pas sous la photo, collez-le : il est copié.')
    } catch (e) {
      if (e?.name !== 'AbortError') setNote('Partage impossible : utilisez WhatsApp ou SMS ci-dessous.')
    }
  }

  return (
    <div>
      {photo && (
        <div className={v2.reviewPhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Photo après" />
          <span>{canShare ? 'La photo « après » part avec le message.' : 'Le lien de la photo « après » est ajouté au message.'}</span>
        </div>
      )}
      {canShare && file ? (
        <>
          <button type="button" className={`${styles.actWa} ${styles.btnBlock}`} onClick={shareWithPhoto}>
            <Icon name="camera" size={18} /> Envoyer avec la photo
          </button>
          <p className={styles.hint}>Choisissez WhatsApp ou Messages, puis {lead.first_name || 'le client'}.</p>
          {note && <p className={styles.hint}>{note}</p>}
          {!compact && (
            <div className={v2.inlineLinks}>
              <a className={styles.linkBtn} href={whatsappHref(lead, text)} target="_blank" rel="noopener noreferrer" onClick={() => onSent?.('whatsapp')}>
                <Icon name="whatsapp" size={15} /> Texte seul (WhatsApp)
              </a>
              <a className={styles.linkBtn} href={smsHref(lead, text)} onClick={() => onSent?.('sms')}>
                <Icon name="sms" size={15} /> Texte seul (SMS)
              </a>
            </div>
          )}
        </>
      ) : (
        <div className={styles.doneActions}>
          <a className={styles.actWa} href={whatsappHref(lead, textWithLink)} target="_blank" rel="noopener noreferrer" onClick={() => onSent?.('whatsapp')}>
            <Icon name="whatsapp" size={18} /> WhatsApp
          </a>
          <a className={styles.btnSecondary} href={smsHref(lead, textWithLink)} onClick={() => onSent?.('sms')}>
            <Icon name="sms" size={18} /> SMS
          </a>
        </div>
      )}
    </div>
  )
}
