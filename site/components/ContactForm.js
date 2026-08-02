'use client'

import { useState } from 'react'
import styles from './ContactForm.module.css'
import { IconWhatsapp, IconMail } from './Icons'
import { whatsappLink, mailtoLink, CONTACT } from '@/lib/constants'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [error, setError] = useState('')
  const [emailStatus, setEmailStatus] = useState('idle') // idle | sending | sent | error

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  function buildMessage() {
    return [
      'Bonjour La Clean Compagny,',
      '',
      form.message || 'Je souhaite obtenir plus d’informations.',
      '',
      `Nom : ${form.name || '—'}`,
      form.phone ? `Téléphone : ${form.phone}` : null,
      form.email ? `Email : ${form.email}` : null,
    ]
      .filter((l) => l !== null)
      .join('\n')
  }

  function handleWhatsapp() {
    if (!form.name || (!form.phone && !form.email)) {
      setError('Merci de renseigner votre nom, et un téléphone ou un email.')
      return
    }
    setError('')
    window.open(whatsappLink(buildMessage()), '_blank', 'noopener,noreferrer')
  }

  async function handleEmailSubmit() {
    if (!form.name || (!form.phone && !form.email)) {
      setError('Merci de renseigner votre nom, et un téléphone ou un email.')
      return
    }
    setError('')
    setEmailStatus('sending')
    const message = buildMessage()
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, message }),
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
      <div className={styles.field}>
        <label htmlFor="c-name">Nom &amp; prénom *</label>
        <input id="c-name" type="text" value={form.name} onChange={set('name')} autoComplete="name" />
      </div>
      <div className={styles.field}>
        <label htmlFor="c-phone">Téléphone</label>
        <input id="c-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
      </div>
      <div className={styles.field}>
        <label htmlFor="c-email">Email</label>
        <input id="c-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
      </div>
      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label htmlFor="c-message">Message</label>
        <textarea id="c-message" rows={5} value={form.message} onChange={set('message')} placeholder="Votre message…" />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
      {emailStatus === 'sent' && (
        <p className={styles.errorText} style={{ color: '#8be9a8' }}>
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
