'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './admin.module.css'
import { getSupabase } from '@/lib/supabaseClient'
import { CLIENT_STATUSES, STATUS_LABEL, toCsv } from './_lib/crm'
import Overview from './_components/Overview'
import Pipeline from './_components/Pipeline'
import Agenda from './_components/Agenda'
import Clients from './_components/Clients'
import Stats from './_components/Stats'
import LeadSheet from './_components/LeadSheet'
import AddLead from './_components/AddLead'
import { Icon } from './_components/Icon'

// Dashboard La Clean Compagny (/admin) — prospects, agenda, clients,
// relances et statistiques. Accès réservé aux emails de la table `team`
// (règles RLS de la base) ; connexion par lien reçu par email.

const VIEWS = [
  { id: 'accueil', label: 'Accueil', icon: 'home' },
  { id: 'prospects', label: 'Prospects', icon: 'users' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar' },
  { id: 'clients', label: 'Clients', icon: 'star' },
  { id: 'stats', label: 'Stats', icon: 'chart' },
]

export default function AdminPage() {
  const supabase = useMemo(() => getSupabase(), [])
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [allowed, setAllowed] = useState(null)
  const [memberName, setMemberName] = useState('')
  const [email, setEmail] = useState('')
  const [loginState, setLoginState] = useState('idle')

  const [leads, setLeads] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [lastSync, setLastSync] = useState(null)

  const [view, setView] = useState('accueil')
  const [openId, setOpenId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [hideTests, setHideTests] = useState(true)

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
    const [l, j] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(2000),
      supabase.from('jobs').select('*').order('done_at', { ascending: false }).limit(5000),
    ])
    setLoading(false)
    if (l.error || j.error) {
      setError('Impossible de charger les données. Vérifiez la connexion puis actualisez.')
      return
    }
    setError('')
    setLeads(l.data || [])
    setJobs(j.data || [])
    setLastSync(new Date())
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
        if (ok) {
          setMemberName(data[0].name)
          load()
        }
      })
    return () => {
      cancelled = true
    }
  }, [session, supabase, load])

  // Rafraîchissement automatique (toutes les minutes + au retour sur l'onglet).
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

  // Titre de l'onglet = nombre de prospects à rappeler.
  useEffect(() => {
    const n = leads.filter((l) => l.status === 'nouveau' && l.source !== 'test').length
    document.title = n ? `(${n}) Dashboard La Clean` : 'Dashboard La Clean'
  }, [leads])

  function flash(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  // ---------- Opérations ----------
  const author = session?.user?.email || null

  const logActivity = useCallback(
    async (leadId, kind, content) => {
      await supabase.from('activities').insert({ lead_id: leadId, kind, content, author })
    },
    [supabase, author]
  )

  const updateLead = useCallback(
    async (lead, changes, { silent = false } = {}) => {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...changes, updated_at: new Date().toISOString() } : l)))
      const { error: err } = await supabase.from('leads').update(changes).eq('id', lead.id)
      if (err) {
        setError("La modification n'a pas été enregistrée. Actualisez la page.")
        load()
        return false
      }
      if (changes.status && changes.status !== lead.status) {
        await logActivity(lead.id, 'statut', `${STATUS_LABEL[lead.status]} → ${STATUS_LABEL[changes.status]}`)
      }
      if (!silent) flash('Enregistré')
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
      const { data: row, error: err } = await supabase
        .from('jobs')
        .insert({ ...job, lead_id: lead.id })
        .select()
        .single()
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

  function exportCsv() {
    const blob = new Blob([toCsv(leads, jobs)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `la-clean-prospects-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function sendLink(e) {
    e.preventDefault()
    setLoginState('sending')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    })
    setLoginState(err ? 'error' : 'sent')
  }

  // ---------- Écrans de connexion ----------
  if (!authReady) {
    return (
      <div className={styles.screen}>
        <p className={styles.center}>Chargement…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className={styles.screen}>
        <form className={styles.login} onSubmit={sendLink}>
          <span className={styles.brandMark}>La Clean Compagny</span>
          <h1>Dashboard</h1>
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
          <button type="submit" className={styles.btnPrimary} disabled={loginState === 'sending'}>
            {loginState === 'sending' ? 'Envoi…' : 'Recevoir le lien'}
          </button>
          {loginState === 'sent' && <p className={styles.okText}>Lien envoyé : ouvrez l&apos;email sur cet appareil.</p>}
          {loginState === 'error' && <p className={styles.errText}>Envoi impossible, réessayez dans quelques minutes.</p>}
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
  const shared = { leads: visibleLeads, jobs, onOpen: setOpenId, updateLead, logActivity }

  return (
    <div className={styles.screen}>
      <div className={styles.app}>
        <aside className={styles.side}>
          <div className={styles.sideBrand}>
            <span className={styles.brandMark}>La Clean</span>
            <span className={styles.sideHello}>Salut {memberName} 👋</span>
          </div>
          <nav className={styles.sideNav} aria-label="Sections">
            {VIEWS.map((v) => (
              <button
                type="button"
                key={v.id}
                className={`${styles.navItem} ${view === v.id ? styles.navOn : ''}`}
                onClick={() => setView(v.id)}
              >
                <Icon name={v.icon} />
                {v.label}
                {v.id === 'prospects' && newCount > 0 && <span className={styles.navBadge}>{newCount}</span>}
              </button>
            ))}
          </nav>
          <div className={styles.sideFoot}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={hideTests} onChange={(e) => setHideTests(e.target.checked)} />
              Masquer les tests
            </label>
            <button type="button" className={styles.linkBtn} onClick={exportCsv}>
              Exporter (Excel)
            </button>
            <button type="button" className={styles.linkBtn} onClick={() => supabase.auth.signOut()}>
              Déconnexion
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <header className={styles.topbar}>
            <h1>{VIEWS.find((v) => v.id === view)?.label}</h1>
            <div className={styles.topActions}>
              <span className={styles.sync}>
                {loading
                  ? 'Synchronisation…'
                  : lastSync
                    ? `À jour ${lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                    : ''}
              </span>
              <button type="button" className={styles.iconBtn} onClick={load} aria-label="Actualiser">
                <Icon name="refresh" />
              </button>
              <button type="button" className={styles.btnPrimary} onClick={() => setAdding(true)}>
                <Icon name="plus" /> Ajouter
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

          {view === 'accueil' && <Overview {...shared} goTo={setView} />}
          {view === 'prospects' && <Pipeline {...shared} />}
          {view === 'agenda' && <Agenda {...shared} />}
          {view === 'clients' && <Clients {...shared} />}
          {view === 'stats' && <Stats {...shared} />}

          <div className={styles.mobileTools}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={hideTests} onChange={(e) => setHideTests(e.target.checked)} />
              Masquer les tests
            </label>
            <button type="button" className={styles.linkBtn} onClick={exportCsv}>
              Exporter (Excel)
            </button>
            <button type="button" className={styles.linkBtn} onClick={() => supabase.auth.signOut()}>
              Déconnexion
            </button>
          </div>
        </main>
      </div>

      <nav className={styles.bottomNav} aria-label="Sections">
        {VIEWS.map((v) => (
          <button type="button" key={v.id} className={view === v.id ? styles.bottomOn : ''} onClick={() => setView(v.id)}>
            <Icon name={v.icon} />
            <span>{v.label}</span>
            {v.id === 'prospects' && newCount > 0 && <em>{newCount}</em>}
          </button>
        ))}
      </nav>

      {openLead && (
        <LeadSheet
          key={openLead.id}
          lead={openLead}
          jobs={jobs.filter((j) => j.lead_id === openLead.id)}
          supabase={supabase}
          onClose={() => setOpenId(null)}
          updateLead={updateLead}
          logActivity={logActivity}
          addJob={addJob}
          deleteJob={deleteJob}
          deleteLead={deleteLead}
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
