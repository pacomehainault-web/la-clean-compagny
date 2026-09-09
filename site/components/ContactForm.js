'use client'

import { useState } from 'react'
import styles from './ContactForm.module.css'
import { IconWhatsapp, IconMail } from './Icons'
import { whatsappLink, mailtoLink, CONTACT } from '@/lib/constants'
import { sanitizeField, sanitizeMessage, isValidEmail } from '@/lib/sanitize'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  // Honeypot anti-spam : champ invisible pour un humain (CSS), que seuls les
  // bots naïfs remplissent automatiquement.
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [emailStatus, setEmailStatus] = useState('idle') // idle | sending | sent | error

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  // Version nettoyée de la saisie (balises/scripts et caractères de contrôle
  // retirés), calculée au moment de l'envoi — les champs de saisie eux-mêmes
  // restent liés à `form` (brut) pour ne pas perturber la frappe de l'utilisateur.
  function getSanitizedForm() {
    return {
      name: sanitizeField(form.name),
      phone: sanitizeField(form.phone, 40),
      email: sanitizeField(form.email, 254),
      message: sanitizeMessage(form.message),
    }
  }

  function buildMessage(clean) {
    return [
      'Bonjour La Clean Compagny,',
      '',
      clean.message || 'Je souhaite obtenir plus d’informations.',
      '',
      `Nom : ${clean.name || '—'}`,
      clean.phone ? `Téléphone : ${clean.phone}` : null,
      clean.email ? `Email : ${clean.email}` : null,
    ]
      .filter((l) => l !== null)
      .join('\n')
  }

  function handleWhatsapp() {
    // Bot piégé par le honeypot : faux succès silencieux, rien n'est envoyé.
    if (honeypot) {
      setError('')
      return
    }
    const clean = getSanitizedForm()
    if (!clean.name || !clean.email || !isValidEmail(clean.email)) {
      setError('Merci de renseigner votre nom et une adresse email valide.')
      return
    }
    setError('')
    window.open(whatsappLink(buildMessage(clean)), '_blank', 'noopener,noreferrer')
  }

  async function handleEmailSubmit() {
    // Bot piégé par le honeypot : faux succès silencieux, rien n'est envoyé.
    if (honeypot) {
      setError('')
      setEmailStatus('sent')
      return
    }
    const clean = getSanitizedForm()
    if (!clean.name || !clean.email || !isValidEmail(clean.email)) {
      setError('Merci de renseigner votre nom et une adresse email valide.')
      return
    }
    setError('')
    setEmailStatus('sending')
    const message = buildMessage(clean)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean.name, phone: clean.phone, email: clean.email, message, honeypot }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 503) {
          window.location.href = mailtoLink({ subject: 'Message depuis le site — La Clean Compagny', body: message })
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
    <div className={styles.form}>
      {/* Honeypot anti-spam : invisible pour un humain, souvent rempli par les
          bots naïfs qui remplissent tous les champs d'un formulaire. */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
      >
        <label htmlFor="c-societe">Société</label>
        <input
          id="c-societe"
          name="societe"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="c-name">Nom &amp; prénom *</label>
        <input id="c-name" type="text" value={form.name} onChange={set('name')} autoComplete="name" required />
      </div>
      <div className={styles.field}>
        <label htmlFor="c-phone">Téléphone</label>
        <input id="c-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
      </div>
      <div className={styles.field}>
        <label htmlFor="c-email">Email *</label>
        <input id="c-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
      </div>
      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label htmlFor="c-message">Message</label>
        <textarea id="c-message" rows={5} value={form.message} onChange={set('message')} placeholder="Votre message…" />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
      {emailStatus === 'sent' && (
        <p className={styles.errorText} style={{ color: 'var(--color-success)' }}>
          Votre message a bien été envoyé — merci, nous revenons vers vous rapidement.
        </p>
      )}
      {emailStatus === 'error' && (
        <p className={styles.errorText}>
          L&apos;envoi a échoué. Réessayez, ou appelez-nous au {CONTACT.phoneDisplay}.
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className="btn btn-cta" onClick={handleWhatsapp}>
          <IconWhatsapp size={18} />
          Envoyer par WhatsApp
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleEmailSubmit}
          disabled={emailStatus === 'sending' || emailStatus === 'sent'}
        >
          <IconMail size={18} />
          {emailStatus === 'sending' ? 'Envoi en cours…' : emailStatus === 'sent' ? 'Envoyé ✓' : 'Envoyer par email'}
        </button>
      </div>
    </div>
  )
}
