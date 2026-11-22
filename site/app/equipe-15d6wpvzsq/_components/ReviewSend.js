'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { reviewText, whatsappHref, smsHref } from '../_lib/crm'
import { photoUrl } from '../_lib/media'
import { useMailReady, authHeader } from '../_lib/mail'
import { getSupabase } from '@/lib/supabaseClient'

// Dernière photo « après » d'un client (celle prise à la fin de la prestation).
export function lastAfterPhoto(photos, leadId) {
  return (
    photos
      .filter((p) => p.lead_id === leadId && p.kind === 'apres')
      .sort((a, b) => (a.taken_on === b.taken_on ? (a.created_at < b.created_at ? 1 : -1) : a.taken_on < b.taken_on ? 1 : -1))[0] || null
  )
}

// Photos avant / après de la dernière prestation du client (3 de chaque au maximum).
export function reviewPhotos(photos, leadId) {
  const mine = (photos || []).filter((p) => p.lead_id === leadId && ['avant', 'apres'].includes(p.kind))
  const last = mine.reduce((m, p) => (p.taken_on > m ? p.taken_on : m), '')
  const day = mine.filter((p) => p.taken_on === last).sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
  return [...day.filter((p) => p.kind === 'avant').slice(0, 3), ...day.filter((p) => p.kind === 'apres').slice(0, 3)]
}

const slug = (s) =>
  String(s || 'voiture')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// Demande d'avis (ou relance) avec les photos avant / après.
// - Par mail (dès que le Gmail d'Enzo est branché) : photos dans le mail + bouton pour les enregistrer.
// - Sur téléphone : les vraies photos partent avec le message, via le menu de partage (WhatsApp, Messages, Mail…).
//   Un lien wa.me ne peut PAS joindre de photo.
// - En secours (texte seul) : le lien de la page client est placé en premier, WhatsApp affiche alors
//   la photo « après » en aperçu (image de partage de la page /suivi).
export default function ReviewSend({ lead, photo, photos = null, onSent, compact = false, relance = false }) {
  const list = useMemo(() => {
    const all = photos ? reviewPhotos(photos, lead.id) : []
    if (all.length) return all
    return photo ? [photo] : []
  }, [photos, photo, lead.id])
  const key = list.map((p) => p.path).join('|')
  const [prepared, setPrepared] = useState({ key: '', files: [], can: false })
  const [note, setNote] = useState('')
  const [shared, setShared] = useState(false)
  const [mailState, setMailState] = useState('')
  const [to, setTo] = useState(lead.email || '')
  const mailReady = useMailReady()
  const files = prepared.key === key ? prepared.files : []
  const canShare = prepared.key === key && prepared.can && files.length > 0
  const hasPhoto = list.length > 0

  useEffect(() => {
    let alive = true
    if (!key || typeof navigator === 'undefined' || !navigator.canShare) return
    const items = key.split('|')
    Promise.all(
      list.map((p, i) =>
        fetch(photoUrl(p.path), { mode: 'cors' })
          .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('photo'))))
          .then((blob) => new File([blob], `la-clean-compagny-${slug(lead.first_name)}-${p.kind}-${i + 1}.jpg`, { type: blob.type || 'image/jpeg' }))
      )
    )
      .then((fs) => {
        if (!alive || items.join('|') !== key) return
        setPrepared({ key, files: fs, can: navigator.canShare({ files: fs }) })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, lead.first_name])

  const text = reviewText(lead, hasPhoto, { relance })
  // Texte seul : lien de la page client en premier → aperçu WhatsApp = photo « après ».
  const textOnly = reviewText(lead, hasPhoto, { relance, linkFirst: hasPhoto })

  async function shareWithPhotos() {
    // Copie de secours : si l'appli n'affiche pas le texte sous les photos, il suffit de le coller.
    navigator.clipboard?.writeText(text).catch(() => {})
    try {
      await navigator.share({ files, text })
      setShared(true)
      onSent?.('partage')
      setNote('Photos envoyées. Si le texte n’est pas parti avec, collez-le (il est copié) ou utilisez « Envoyer le texte ».')
    } catch (e) {
      if (e?.name !== 'AbortError') setNote('Partage impossible : utilisez WhatsApp ci-dessous (la photo s’affiche en aperçu du lien).')
    }
  }

  async function sendMail() {
    setMailState('envoi')
    try {
      const r = await fetch('/api/review-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeader(getSupabase())) },
        body: JSON.stringify({ lead_id: lead.id, to: to.trim() }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok) {
        setMailState(`✅ Mail envoyé à ${to.trim()} avec ${j.photos || 0} photo${j.photos > 1 ? 's' : ''} (copie dans la boîte d’Enzo).`)
        onSent?.('email')
      } else setMailState(j.error === 'email' ? 'Adresse email invalide.' : 'Le mail n’est pas parti. Réessayez.')
    } catch {
      setMailState('Pas de connexion : le mail n’est pas parti.')
    }
  }

  return (
    <div className={v2.reviewSend}>
      {hasPhoto && (
        <div className={v2.reviewPhoto}>
          <span className={v2.reviewThumbs}>
            {list.slice(0, 6).map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.path} src={photoUrl(p.path)} alt={p.kind === 'avant' ? 'Avant' : 'Après'} />
            ))}
          </span>
          <span>
            {canShare
              ? `${list.length} photo${list.length > 1 ? 's' : ''} avant / après parte${list.length > 1 ? 'nt' : ''} avec le message.`
              : 'La photo « après » s’affiche en aperçu du lien dans WhatsApp.'}
          </span>
        </div>
      )}

      {mailReady && (
        <div className={v2.reviewMail}>
          <input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Email du client" aria-label="Email du client" />
          <button type="button" className={styles.btnPrimary} onClick={sendMail} disabled={!to.trim() || mailState === 'envoi'}>
            <Icon name="mail" size={17} /> {mailState === 'envoi' ? 'Envoi…' : 'Par mail avec les photos'}
          </button>
          {mailState && mailState !== 'envoi' && <p className={styles.hint}>{mailState}</p>}
        </div>
      )}

      {canShare ? (
        <>
          <button type="button" className={`${styles.actWa} ${styles.btnBlock}`} onClick={shareWithPhotos}>
            <Icon name="camera" size={18} /> {shared ? 'Renvoyer avec les photos' : `Envoyer avec ${files.length > 1 ? 'les photos' : 'la photo'}`}
          </button>
          {!shared && <p className={styles.hint}>Choisissez WhatsApp, Messages ou Mail, puis {lead.first_name || 'le client'}.</p>}
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
