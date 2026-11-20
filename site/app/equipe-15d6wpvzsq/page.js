'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './admin.module.css'
import { getSupabase } from '@/lib/supabaseClient'
import { BASE_PATH, CLIENT_STATUSES, STATUS_LABEL, addDays, clientFromLead, docTotal, toCsv, toDateInput } from './_lib/crm'
import Overview from './_components/Overview'
import Pipeline from './_components/Pipeline'
import Planning from './_components/Planning'
import Clients from './_components/Clients'
import Documents from './_components/Documents'
import Reviews from './_components/Reviews'
import Stats from './_components/Stats'
import Settings from './_components/Settings'
import LeadSheet from './_components/LeadSheet'
import AddLead from './_components/AddLead'
import { Icon } from './_components/Icon'
import { pushState, syncPush } from './_lib/push'

// Espace équipe La Clean Compagny : prospects, planning, devis/factures, avis,
// statistiques (site + Google) et réglages. Connexion par mot de passe commun
// (compte Supabase equipe@lacleancompagny.com, créé dans le tableau de bord
// Supabase) ; l'accès aux données est verrouillé par les règles RLS (table team).

const TEAM_EMAIL = 'equipe@lacleancompagny.com'

const VIEWS = [
  { id: 'accueil', label: 'Accueil', icon: 'home' },
  { id: 'prospects', label: 'Prospects', icon: 'users' },
  { id: 'planning', label: 'Planning', icon: 'calendar' },
  { id: 'documents', label: 'Devis & factures', short: 'Factures', icon: 'file' },
  { id: 'clients', label: 'Clients', icon: 'star' },
  { id: 'avis', label: 'Avis Google', icon: 'message' },
  { id: 'stats', label: 'Statistiques', icon: 'chart' },
  { id: 'reglages', label: 'Réglages', icon: 'settings' },
]
const MOBILE_MAIN = ['accueil', 'prospects', 'planning', 'documents']

const in3Days = () => {
  const d = addDays(new Date(), 3)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

export default function TeamDashboard() {
  const supabase = useMemo(() => getSupabase(), [])
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [allowed, setAllowed] = useState(null)
  const [memberName, setMemberName] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loginState, setLoginState] = useState('idle')

  const [leads, setLeads] = useState([])
  const [jobs, setJobs] = useState([])
  const [docs, setDocs] = useState([])
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState([])
  const [views, setViews] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [lastSync, setLastSync] = useState(null)

  const [view, setView] = useState('accueil')
  const [statsTab, setStatsTab] = useState('activite')
  const [moreOpen, setMoreOpen] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [openDocId, setOpenDocId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [hideTests, setHideTests] = useState(true)
  const [pushNudge, setPushNudge] = useState(false)

  // ---------- Authentification ----------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [supabase])

  const load = useCallback(async () => {
    setLoading(true)
    const since = toDateInput(addDays(new Date(), -120).toISOString())
    const [l, j, d, r, st, pv, se] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(2000),
      supabase.from('jobs').select('*').order('done_at', { ascending: false }).limit(5000),
      supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(2000),
      supabase.from('google_reviews').select('*').limit(1000),
      supabase.from('stats_daily').select('*').gte('day', since).limit(20000),
      supabase.from('page_views').select('*').gte('day', since).limit(20000),
      supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
    ])
    setLoading(false)
    if (l.error || j.error) {
      setError('Impossible de charger les données. Vérifiez la connexion.')
      return
    }
    setError('')
    setLeads(l.data || [])
    setJobs(j.data || [])
    setDocs(d.data || [])
    setReviews(r.data || [])
    setStats(st.data || [])
    setViews(pv.data || [])
    setSettings(se.data || null)
    setLastSync(new Date())
  }, [supabase])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    supabase
      .from('team')
      .select('name, email')
      .then(({ data }) => {
        if (cancelled) return
        const ok = Boolean(data && data.length)
        setAllowed(ok)
        if (ok) {
          const me = data.find((m) => m.email === session.user.email) || data[0]
          setMemberName(me.name === 'Équipe' ? '' : me.name)
          load()
        }
      })
    return () => {
      cancelled = true
    }
  }, [session, supabase, load])

  useEffect(() => {
    if (!allowed) return
    const t = setInterval(load, 60000)
    const onFocus = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [allowed, load])

  // Notifications natives : garde l'abonnement de l'appareil à jour et propose de l'activer s'il ne l'est pas.
  useEffect(() => {
    if (allowed) syncPush(supabase)
  }, [allowed, supabase])

  useEffect(() => {
    if (!allowed || view !== 'accueil') return
    let cancelled = false
    pushState().then((s) => {
      let dismissed = false
      try {
        dismissed = localStorage.getItem('lcc-push-nudge') === 'off'
      } catch {}
      if (!cancelled) setPushNudge(!dismissed && (s === 'ready' || s === 'ios-browser'))
    })
    return () => {
      cancelled = true
    }
  }, [allowed, view])

  function hidePushNudge() {
    setPushNudge(false)
    try {
      localStorage.setItem('lcc-push-nudge', 'off')
    } catch {}
  }

  useEffect(() => {
    const n = leads.filter((l) => l.status === 'nouveau' && l.source !== 'test').length
    document.title = n ? `(${n}) Espace équipe` : 'Espace équipe'
  }, [leads])

  function flash(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  function goTo(v, sub) {
    if (v === 'stats' && sub) setStatsTab(sub)
    setView(v)
    setMoreOpen(false)
    window.scrollTo({ top: 0 })
  }

  async function login(e) {
    e.preventDefault()
    setLoginState('sending')
    const { error: err } = await supabase.auth.signInWithPassword({ email: TEAM_EMAIL, password })
    setPassword('')
    setLoginState(err ? 'error' : 'idle')
  }

  // ---------- Opérations : prospects ----------
  const author = session?.user?.email || null

  const logActivity = useCallback(
    async (leadId, kind, content) => {
      await supabase.from('activities').insert({ lead_id: leadId, kind, content, author })
    },
    [supabase, author]
  )

  const updateLead = useCallback(
    async (lead, changes, { silent = false } = {}) => {
      const next = { ...changes }
      // Relances programmées automatiquement selon l'étape.
      if (next.status && next.status !== lead.status) {
        if (next.status === 'devis_envoye' && !('next_followup_at' in next) && !lead.next_followup_at) next.next_followup_at = in3Days()
        if (['reserve', 'perdu', 'fait', 'avis_recu'].includes(next.status) && !('next_followup_at' in next)) next.next_followup_at = null
      }
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...next, updated_at: new Date().toISOString() } : l)))
      const { error: err } = await supabase.from('leads').update(next).eq('id', lead.id)
      if (err) {
        setError("La modification n'a pas été enregistrée. Actualisez la page.")
        load()
        return false
      }
      if (next.status && next.status !== lead.status) {
        await logActivity(lead.id, 'statut', `${STATUS_LABEL[lead.status]} → ${STATUS_LABEL[next.status]}`)
        if (next.next_followup_at && next.status === 'devis_envoye') flash('Relance programmée dans 3 jours')
        else if (!silent) flash('Enregistré')
      } else if (!silent) flash('Enregistré')
      return true
    },
    [supabase, load, logActivity]
  )

  const addLead = useCallback(
    async (data) => {
      const { data: row, error: err } = await supabase.from('leads').insert(data).select().single()
      if (err) {
        setError("Le prospect n'a pas pu être ajouté.")
        return null
      }
      await logActivity(row.id, 'creation', `Ajouté à la main (${data.source})`)
      setLeads((prev) => [row, ...prev])
      flash('Prospect ajouté')
      return row
    },
    [supabase, logActivity]
  )

  const addJob = useCallback(
    async (lead, job) => {
      const { data: row, error: err } = await supabase.from('jobs').insert({ ...job, lead_id: lead.id }).select().single()
      if (err) {
        setError("La prestation n'a pas pu être enregistrée.")
        return false
      }
      setJobs((prev) => [row, ...prev])
      await logActivity(lead.id, 'prestation', `${job.service} – ${job.amount} €`)
      if (!CLIENT_STATUSES.includes(lead.status)) {
        await updateLead(lead, { status: 'fait', next_followup_at: null }, { silent: true })
      }
      flash('Prestation enregistrée')
      return true
    },
    [supabase, logActivity, updateLead]
  )

  const deleteJob = useCallback(
    async (job) => {
      setJobs((prev) => prev.filter((j) => j.id !== job.id))
      const { error: err } = await supabase.from('jobs').delete().eq('id', job.id)
      if (err) {
        setError("La prestation n'a pas pu être supprimée.")
        load()
      }
    },
    [supabase, load]
  )

  const deleteLead = useCallback(
    async (lead) => {
      setLeads((prev) => prev.filter((l) => l.id !== lead.id))
      setJobs((prev) => prev.filter((j) => j.lead_id !== lead.id))
      setOpenId(null)
      const { error: err } = await supabase.from('leads').delete().eq('id', lead.id)
      if (err) {
        setError("La fiche n'a pas pu être supprimée.")
        load()
      } else flash('Fiche supprimée')
    },
    [supabase, load]
  )

  // ---------- Opérations : devis et factures ----------
  const createDoc = useCallback(
    async (kind, lead, base = null) => {
      const { data: number, error: numErr } = await supabase.rpc('next_document_number', { p_kind: kind })
      if (numErr) {
        setError('Numéro de document indisponible, réessayez.')
        return null
      }
      const today = toDateInput(new Date().toISOString())
      const lines =
        base?.lines ||
        (lead?.service ? [{ label: lead.service, qty: 1, unit_price: Number(lead.quoted_price) || 0 }] : [{ label: '', qty: 1, unit_price: 0 }])
      const row = {
        kind,
        number,
        lead_id: lead?.id || base?.lead_id || null,
        client: base?.client || clientFromLead(lead),
        lines,
        total: docTotal(lines),
        issued_at: today,
        due_at: kind === 'devis' ? toDateInput(addDays(new Date(), 30).toISOString()) : today,
        notes: base?.notes || null,
        source_id: base?.id || null,
      }
      const { data, error: err } = await supabase.from('documents').insert(row).select().single()
      if (err) {
        setError("Le document n'a pas pu être créé.")
        return null
      }
      setDocs((prev) => [data, ...prev])
      flash(`${kind === 'devis' ? 'Devis' : 'Facture'} ${number} créé${kind === 'facture' ? 'e' : ''}`)
      return data
    },
    [supabase]
  )

  const updateDoc = useCallback(
    async (doc, changes, { silent = false } = {}) => {
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, ...changes } : d)))
      const { error: err } = await supabase.from('documents').update(changes).eq('id', doc.id)
      if (err) {
        setError("Le document n'a pas été enregistré.")
        load()
        return false
      }
      // Le devis fait avancer la fiche du prospect.
      const lead = doc.lead_id ? leads.find((l) => l.id === doc.lead_id) : null
      if (lead && changes.status && doc.kind === 'devis') {
        const total = changes.total ?? doc.total
        if (changes.status === 'envoye' && ['nouveau', 'contacte'].includes(lead.status))
          await updateLead(lead, { status: 'devis_envoye', quoted_price: total }, { silent: true })
        if (changes.status === 'accepte' && ['nouveau', 'contacte', 'devis_envoye'].includes(lead.status))
          await updateLead(lead, { status: 'reserve', quoted_price: total }, { silent: true })
        if (changes.status === 'refuse' && !CLIENT_STATUSES.includes(lead.status))
          await updateLead(lead, { status: 'perdu', lost_reason: 'Devis refusé' }, { silent: true })
      }
      if (lead && changes.status) await logActivity(lead.id, 'note', `${doc.kind === 'devis' ? 'Devis' : 'Facture'} ${doc.number} : ${changes.status}`)
      if (!silent) flash('Enregistré')
      return true
    },
    [supabase, load, leads, updateLead, logActivity]
  )

  const deleteDoc = useCallback(
    async (doc) => {
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
      setOpenDocId(null)
      const { error: err } = await supabase.from('documents').delete().eq('id', doc.id)
      if (err) {
        setError("Le document n'a pas pu être supprimé.")
        load()
      } else flash('Document supprimé')
    },
    [supabase, load]
  )

  const convertDoc = useCallback(
    async (devis) => {
      if (devis.status !== 'accepte') await updateDoc(devis, { status: 'accepte' }, { silent: true })
      const lead = devis.lead_id ? leads.find((l) => l.id === devis.lead_id) : null
      const facture = await createDoc('facture', lead, devis)
      if (facture) setOpenDocId(facture.id)
    },
    [updateDoc, createDoc, leads]
  )

  const markPaid = useCallback(
    async (doc) => {
      const today = toDateInput(new Date().toISOString())
      const ok = await updateDoc(doc, { status: 'paye', paid_at: today }, { silent: true })
      if (!ok) return
      const lead = doc.lead_id ? leads.find((l) => l.id === doc.lead_id) : null
      // Le paiement compte dans le CA : on enregistre la prestation si elle ne l'est pas déjà.
      if (lead && !jobs.some((j) => j.lead_id === lead.id && Number(j.amount) === Number(doc.total))) {
        await addJob(lead, { done_at: today, service: doc.lines?.[0]?.label || 'Prestation', amount: Number(doc.total), notes: `Facture ${doc.number}` })
      } else flash('Facture payée')
    },
    [updateDoc, leads, jobs, addJob]
  )

  // ---------- Avis, réglages ----------
  const updateReview = useCallback(
    async (review, changes, { silent = false } = {}) => {
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, ...changes } : r)))
      const { error: err } = await supabase.from('google_reviews').update(changes).eq('id', review.id)
      if (err) setError("L'avis n'a pas été mis à jour.")
      else if (!silent) flash('Enregistré')
    },
    [supabase]
  )

  const saveSettings = useCallback(
    async (changes) => {
      setSettings((s) => ({ ...s, ...changes }))
      const { error: err } = await supabase
        .from('settings')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', 1)
      if (err) {
        setError("Les réglages n'ont pas été enregistrés.")
        return false
      }
      flash('Réglages enregistrés')
      return true
    },
    [supabase]
  )

  async function rpcFlash(name, msg) {
    const { error: err } = await supabase.rpc(name)
    flash(err ? 'Envoi impossible' : msg)
  }

  function exportCsv() {
    const blob = new Blob([toCsv(leads, jobs)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `la-clean-prospects-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---------- Écran de connexion ----------
  if (!authReady) {
    return (
      <div className={styles.screen}>
        <p className={styles.center}>Chargement…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className={`${styles.screen} ${styles.loginScreen}`}>
        <form className={styles.login} onSubmit={login}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/logo-new.png" alt="La Clean Compagny" className={styles.loginLogo} />
          <h1>Espace équipe</h1>
          <p>Prospects, planning, factures et suivi Google.</p>
          <label htmlFor="team-password">Mot de passe</label>
          <div className={styles.pwdRow}>
            <input
              id="team-password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className={styles.iconBtn} onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
              <Icon name="eye" />
            </button>
          </div>
          <button type="submit" className={styles.btnPrimary} disabled={loginState === 'sending'}>
            {loginState === 'sending' ? 'Connexion…' : 'Entrer'}
          </button>
          {loginState === 'error' && <p className={styles.errText}>Mot de passe incorrect.</p>}
        </form>
      </div>
    )
  }

  if (allowed === false) {
    return (
      <div className={styles.screen}>
        <div className={styles.login}>
          <h1>Accès refusé</h1>
          <p>Ce compte ne fait pas partie de l&apos;équipe.</p>
          <button type="button" className={styles.btnSecondary} onClick={() => supabase.auth.signOut()}>
            Se déconnecter
          </button>
        </div>
      </div>
    )
  }

  if (allowed === null) {
    return (
      <div className={styles.screen}>
        <p className={styles.center}>Vérification de l&apos;accès…</p>
      </div>
    )
  }

  // ---------- Dashboard ----------
  const visibleLeads = hideTests ? leads.filter((l) => l.source !== 'test') : leads
  const openLead = leads.find((l) => l.id === openId) || null
  const newCount = visibleLeads.filter((l) => l.status === 'nouveau').length
  const unreplied = reviews.filter((r) => !r.replied).length
  const shared = { leads: visibleLeads, jobs, onOpen: setOpenId, updateLead, logActivity }
  const badge = (id) => (id === 'prospects' ? newCount : id === 'avis' ? unreplied : 0)
  const current = VIEWS.find((v) => v.id === view)

  return (
    <div className={styles.screen}>
      <div className={styles.app}>
        <aside className={styles.side}>
          <div className={styles.sideBrand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/logo-new.png" alt="La Clean Compagny" className={styles.sideLogo} />
            <span className={styles.sideHello}>Espace équipe</span>
          </div>
          <nav className={styles.sideNav} aria-label="Sections">
            {VIEWS.map((v) => (
              <button type="button" key={v.id} className={`${styles.navItem} ${view === v.id ? styles.navOn : ''}`} onClick={() => goTo(v.id)}>
                <Icon name={v.icon} />
                {v.label}
                {badge(v.id) > 0 && <span className={styles.navBadge}>{badge(v.id)}</span>}
              </button>
            ))}
          </nav>
          <div className={styles.sideFoot}>
            <span>
              {loading
                ? 'Synchronisation…'
                : lastSync
                  ? `Données à jour à ${lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                  : ''}
            </span>
            <button type="button" className={styles.sideLink} onClick={() => supabase.auth.signOut()}>
              <Icon name="lock" size={16} /> Se déconnecter
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <header className={`${styles.topbar} ${view === 'accueil' ? styles.topbarHome : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/logo-new.png" alt="La Clean Compagny" className={styles.topLogo} />
            <h1 className={styles.pageTitle}>{view === 'accueil' ? 'Aujourd’hui' : current?.label}</h1>
            <div className={styles.topActions}>
              <button type="button" className={`${styles.iconBtn} ${loading ? styles.spinning : ''}`} onClick={load} aria-label="Actualiser les données">
                <Icon name="refresh" />
              </button>
              <button type="button" className={styles.btnPrimary} onClick={() => setAdding(true)}>
                <Icon name="plus" /> <span className={styles.hideXs}>Nouveau prospect</span>
              </button>
            </div>
          </header>

          {error && (
            <p className={styles.errBar} role="alert">
              {error}
              <button type="button" onClick={() => setError('')} aria-label="Fermer">
                ×
              </button>
            </p>
          )}

          {view === 'accueil' && pushNudge && (
            <div className={styles.pushNudge}>
              <Icon name="bell" size={18} />
              <p>Recevez les nouveaux prospects en notification sur ce téléphone, même verrouillé.</p>
              <button type="button" className={styles.btnPrimary} onClick={() => goTo('reglages')}>
                Activer
              </button>
              <button type="button" className={styles.pushNudgeClose} onClick={hidePushNudge} aria-label="Masquer">
                ×
              </button>
            </div>
          )}
          {view === 'accueil' && (
            <Overview {...shared} who={memberName} docs={docs} reviews={reviews} stats={stats} views={views} settings={settings} goTo={goTo} />
          )}
          {view === 'prospects' && <Pipeline {...shared} />}
          {view === 'planning' && <Planning {...shared} />}
          {view === 'documents' && (
            <Documents
              docs={docs}
              leads={leads}
              basePath={BASE_PATH}
              onCreate={createDoc}
              onUpdate={updateDoc}
              onDelete={deleteDoc}
              onConvert={convertDoc}
              onPaid={markPaid}
              onOpenLead={(id) => {
                setOpenDocId(null)
                setOpenId(id)
              }}
              openDocId={openDocId}
              setOpenDocId={setOpenDocId}
            />
          )}
          {view === 'clients' && <Clients {...shared} />}
          {view === 'avis' && <Reviews {...shared} reviews={reviews} stats={stats} onUpdateReview={updateReview} flash={flash} />}
          {view === 'stats' && <Stats key={statsTab} leads={visibleLeads} jobs={jobs} stats={stats} views={views} initialTab={statsTab} />}
          {view === 'reglages' && settings && (
            <Settings
              supabase={supabase}
              flash={flash}
              settings={settings}
              onSave={saveSettings}
              onTestAlert={() => rpcFlash('test_alert', 'Test envoyé : regardez le téléphone')}
              onDigestNow={() => rpcFlash('send_digest_now', 'Récap envoyé')}
              onLogout={() => supabase.auth.signOut()}
              exportCsv={exportCsv}
              hideTests={hideTests}
              setHideTests={setHideTests}
            />
          )}
        </main>
      </div>

      <nav className={styles.bottomNav} aria-label="Sections">
        {VIEWS.filter((v) => MOBILE_MAIN.includes(v.id)).map((v) => (
          <button type="button" key={v.id} className={view === v.id ? styles.bottomOn : ''} onClick={() => goTo(v.id)}>
            <Icon name={v.icon} />
            <span>{v.short || v.label}</span>
            {badge(v.id) > 0 && <em>{badge(v.id)}</em>}
          </button>
        ))}
        <button
          type="button"
          className={!MOBILE_MAIN.includes(view) ? styles.bottomOn : ''}
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
        >
          <Icon name="more" />
          <span>Plus</span>
          {unreplied > 0 && <em>{unreplied}</em>}
        </button>
      </nav>

      {moreOpen && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Plus de sections">
          <button type="button" className={styles.backdrop} onClick={() => setMoreOpen(false)} aria-label="Fermer" />
          <div className={`${styles.sheet} ${styles.sheetSmall}`}>
            <div className={styles.moreGrid}>
              {VIEWS.filter((v) => !MOBILE_MAIN.includes(v.id)).map((v) => (
                <button type="button" key={v.id} className={styles.moreItem} onClick={() => goTo(v.id)}>
                  <Icon name={v.icon} size={22} />
                  <span>{v.label}</span>
                  {badge(v.id) > 0 && <em>{badge(v.id)}</em>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {openLead && (
        <LeadSheet
          key={openLead.id}
          lead={openLead}
          jobs={jobs.filter((j) => j.lead_id === openLead.id)}
          docs={docs.filter((d) => d.lead_id === openLead.id)}
          supabase={supabase}
          onClose={() => setOpenId(null)}
          updateLead={updateLead}
          logActivity={logActivity}
          addJob={addJob}
          deleteJob={deleteJob}
          deleteLead={deleteLead}
          onCreateDoc={async (kind, lead) => {
            const doc = await createDoc(kind, lead)
            if (doc) {
              setOpenId(null)
              setOpenDocId(doc.id)
              goTo('documents')
            }
          }}
          onOpenDoc={(id) => {
            setOpenId(null)
            setOpenDocId(id)
            goTo('documents')
          }}
        />
      )}

      {adding && (
        <AddLead
          onClose={() => setAdding(false)}
          onSave={async (data) => {
            const row = await addLead(data)
            if (row) {
              setAdding(false)
              setOpenId(row.id)
            }
          }}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
