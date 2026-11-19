'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './admin.module.css'
import { getSupabase } from '@/lib/supabaseClient'
import { CONTACT } from '@/lib/constants'

// Mini-dashboard des prospects (v1) : tous les formulaires du site arrivent
// ici, classés par statut, avec les actions en un geste (appeler, WhatsApp,
// SMS, email, demander l'avis). Accès réservé aux emails de la table `team`.

const STATUSES = [
  { id: 'nouveau', label: 'Nouveau' },
  { id: 'contacte', label: 'Contacté' },
  { id: 'devis_envoye', label: 'Devis envoyé' },
  { id: 'reserve', label: 'Réservé' },
  { id: 'fait', label: 'Fait' },
  { id: 'avis_demande', label: 'Avis demandé' },
  { id: 'avis_recu', label: 'Avis reçu' },
  { id: 'perdu', label: 'Perdu' },
]
const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]))
const TO_HANDLE = ['nouveau', 'contacte', 'devis_envoye']

const FILTERS = [
  { id: 'todo', label: 'À traiter', match: (l) => TO_HANDLE.includes(l.status) },
  { id: 'reserve', label: 'Réservés', match: (l) => l.status === 'reserve' },
  { id: 'avis', label: 'Avis à demander', match: (l) => l.status === 'fait' },
  { id: 'all', label: 'Tous', match: () => true },
]

const SOURCE_LABEL = {
  'accueil-haut': 'Accueil (haut)',
  'accueil-bas': 'Accueil (bas)',
  'devis-en-ligne': 'Devis en ligne',
  'devis-en-ligne-pro': 'Devis en ligne (pro)',
}

function intlPhone(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  if (digits.startsWith('33')) return digits
  if (digits.startsWith('0')) return `33${digits.slice(1)}`
  return digits
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
  if (diff < 3600) return rtf.format(-Math.max(1, Math.round(diff / 60)), 'minute')
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour')
  return rtf.format(-Math.round(diff / 86400), 'day')
}

function firstMessage(lead) {
  const what = lead.service ? ` pour un ${lead.service.toLowerCase()}` : ''
  const where = lead.city ? ` à ${lead.city}` : ''
  return `Bonjour ${lead.first_name}, c'est Enzo de La Clean Compagny. Vous avez demandé à être rappelé${what}${where} : quand êtes-vous disponible pour en parler ?`
}

function reviewMessage(lead) {
  return `Bonjour ${lead.first_name}, merci pour votre confiance ! Si le résultat vous a plu, un petit avis Google nous aiderait énormément (30 secondes) : ${CONTACT.googleReviewUrl} Merci ! Enzo – La Clean Compagny`
}

function gmailLink(lead) {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: lead.email,
    su: 'Votre demande – La Clean Compagny',
    body: `${firstMessage(lead)}\n\nEnzo\nLa Clean Compagny – ${CONTACT.phoneDisplay}`,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

export default function AdminPage() {
  const supabase = useMemo(() => getSupabase(), [])
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [allowed, setAllowed] = useState(null) // null = vérification en cours
  const [email, setEmail] = useState('')
  const [loginState, setLoginState] = useState('idle') // idle | sending | sent | error
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('todo')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [supabase])

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    setLoading(false)
    if (err) {
      setError('Impossible de charger les prospects.')
      return
    }
    setError('')
    setLeads(data || [])
  }, [supabase])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    supabase
      .from('team')
      .select('name')
      .then(({ data }) => {
        if (cancelled) return
        const ok = Boolean(data && data.length)
        setAllowed(ok)
        if (ok) load()
      })
    return () => {
      cancelled = true
    }
  }, [session, supabase, load])

  // Rafraîchissement automatique toutes les minutes.
  useEffect(() => {
    if (!allowed) return
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [allowed, load])

  async function sendLink(e) {
    e.preventDefault()
    setLoginState('sending')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    })
    setLoginState(err ? 'error' : 'sent')
  }

  async function update(lead, changes) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...changes } : l)))
    const { error: err } = await supabase.from('leads').update(changes).eq('id', lead.id)
    if (err) {
      setError("La modification n'a pas été enregistrée. Rechargez la page.")
      load()
    }
  }

  // ---------- Écrans de connexion ----------
  if (!authReady) {
    return <div className={styles.screen}><p className={styles.center}>Chargement…</p></div>
  }

  if (!session) {
    return (
      <div className={styles.screen}>
        <form className={styles.login} onSubmit={sendLink}>
          <h1>Dashboard La Clean</h1>
          <p>Recevez un lien de connexion par email (réservé à l&apos;équipe).</p>
          <label htmlFor="admin-email">Votre email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@gmail.com"
          />
          <button type="submit" className={styles.primary} disabled={loginState === 'sending'}>
            {loginState === 'sending' ? 'Envoi…' : 'Recevoir le lien'}
          </button>
          {loginState === 'sent' && <p className={styles.ok}>Lien envoyé : ouvrez l&apos;email sur cet appareil.</p>}
          {loginState === 'error' && <p className={styles.err}>Envoi impossible, réessayez dans quelques minutes.</p>}
        </form>
      </div>
    )
  }

  if (allowed === false) {
    return (
      <div className={styles.screen}>
        <div className={styles.login}>
          <h1>Accès refusé</h1>
          <p>{session.user.email} ne fait pas partie de l&apos;équipe.</p>
          <button type="button" className={styles.secondary} onClick={() => supabase.auth.signOut()}>
            Se déconnecter
          </button>
        </div>
      </div>
    )
  }

  // ---------- Dashboard ----------
  const counts = Object.fromEntries(FILTERS.map((f) => [f.id, leads.filter(f.match).length]))
  const current = FILTERS.find((f) => f.id === filter) || FILTERS[0]
  const shown = leads.filter(current.match)
  const newCount = leads.filter((l) => l.status === 'nouveau').length

  return (
    <div className={styles.screen}>
      <header className={styles.top}>
        <div>
          <h1>Prospects</h1>
          <p>
            {newCount > 0 ? `${newCount} nouveau${newCount > 1 ? 'x' : ''} à rappeler` : 'Aucun nouveau prospect'}
          </p>
        </div>
        <div className={styles.topActions}>
          <button type="button" className={styles.secondary} onClick={load} disabled={loading}>
            {loading ? '…' : 'Actualiser'}
          </button>
          <button type="button" className={styles.ghost} onClick={() => supabase.auth.signOut()}>
            Déconnexion
          </button>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Filtres">
        {FILTERS.map((f) => (
          <button
            type="button"
            key={f.id}
            className={`${styles.tab} ${filter === f.id ? styles.tabOn : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label} <span>{counts[f.id]}</span>
          </button>
        ))}
      </nav>

      {error && <p className={styles.err}>{error}</p>}

      <ul className={styles.list}>
        {shown.length === 0 && <li className={styles.empty}>Rien ici pour l&apos;instant.</li>}
        {shown.map((lead) => {
          const open = openId === lead.id
          const wa = `https://wa.me/${intlPhone(lead.phone)}?text=${encodeURIComponent(firstMessage(lead))}`
          const waReview = `https://wa.me/${intlPhone(lead.phone)}?text=${encodeURIComponent(reviewMessage(lead))}`
          const sms = `sms:${lead.phone.replace(/\s/g, '')}?&body=${encodeURIComponent(firstMessage(lead))}`
          return (
            <li key={lead.id} className={`${styles.card} ${lead.status === 'nouveau' ? styles.cardNew : ''}`}>
              <button type="button" className={styles.cardHead} onClick={() => setOpenId(open ? null : lead.id)} aria-expanded={open}>
                <span className={styles.name}>
                  {lead.first_name}
                  <span className={`${styles.badge} ${styles[`s_${lead.status}`] || ''}`}>{STATUS_LABEL[lead.status]}</span>
                </span>
                <span className={styles.meta}>
                  {[lead.service, lead.city].filter(Boolean).join(' · ') || 'Demande de rappel'}
                </span>
                <span className={styles.when}>
                  {timeAgo(lead.created_at)} · {SOURCE_LABEL[lead.source] || lead.source.replace(/^prestation-/, 'Page ').replace(/-bas$/, ' (bas)')}
                </span>
              </button>

              <div className={styles.actions}>
                <a className={styles.primary} href={`tel:${lead.phone.replace(/\s/g, '')}`} onClick={() => lead.status === 'nouveau' && update(lead, { status: 'contacte' })}>
                  Appeler
                </a>
                <a className={styles.whatsapp} href={wa} target="_blank" rel="noopener noreferrer" onClick={() => lead.status === 'nouveau' && update(lead, { status: 'contacte' })}>
                  WhatsApp
                </a>
                <a className={styles.secondary} href={sms}>
                  SMS
                </a>
                {lead.email && (
                  <a className={styles.secondary} href={gmailLink(lead)} target="_blank" rel="noopener noreferrer">
                    Gmail
                  </a>
                )}
                {lead.status === 'fait' && (
                  <a className={styles.review} href={waReview} target="_blank" rel="noopener noreferrer" onClick={() => update(lead, { status: 'avis_demande' })}>
                    Demander l&apos;avis
                  </a>
                )}
              </div>

              {open && (
                <div className={styles.details}>
                  <dl>
                    <dt>Téléphone</dt>
                    <dd>{lead.phone}</dd>
                    {lead.email && (
                      <>
                        <dt>Email</dt>
                        <dd>{lead.email}</dd>
                      </>
                    )}
                    {lead.vehicle && (
                      <>
                        <dt>Véhicule</dt>
                        <dd>{lead.vehicle}</dd>
                      </>
                    )}
                    <dt>Reçu le</dt>
                    <dd>{new Date(lead.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                    <dt>Relances</dt>
                    <dd>{lead.consent_relance ? 'Accepte rappel d’entretien et demande d’avis' : 'Pas de consentement aux relances'}</dd>
                  </dl>
                  {lead.message && <pre className={styles.message}>{lead.message}</pre>}
                  <label className={styles.field}>
                    Statut
                    <select value={lead.status} onChange={(e) => update(lead, { status: e.target.value })}>
                      {STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    Notes
                    <textarea
                      rows={3}
                      defaultValue={lead.notes || ''}
                      placeholder="Prix proposé, créneau, état du véhicule…"
                      onBlur={(e) => {
                        const v = e.target.value.trim() || null
                        if (v !== (lead.notes || null)) update(lead, { notes: v })
                      }}
                    />
                  </label>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
