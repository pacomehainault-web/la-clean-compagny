'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './admin.module.css'
import { getSupabase } from '@/lib/supabaseClient'
import { BASE_PATH, CLIENT_STATUSES, STATUS_LABEL, addDays, clientFromLead, docTotal, toCsv, toDateInput, taskGroup, formatDayLabel, formatTime, defaultMinutes, stockCategory, setTravelBuffer, setReferralGoal } from './_lib/crm'
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
import QuickAdd from './_components/QuickAdd'
import Tasks from './_components/Tasks'
import Cash from './_components/Cash'
import { CompleteRdv, MoveRdv, GoRdv, AskReview } from './_components/RdvActions'
import Visit from './_components/Visit'
import Fidelite from './_components/Fidelite'
import Partners from './_components/Partners'
import Stock, { lowStock } from './_components/Stock'
import Content from './_components/Content'
import { useForecast } from './_lib/geo'
import { Icon } from './_components/Icon'
import { pushState, syncPush } from './_lib/push'
import { compressImage } from './_lib/media'

// Espace équipe La Clean Compagny : prospects, planning, devis/factures, avis,
// statistiques (site + Google) et réglages. Connexion par mot de passe commun
// (compte Supabase equipe@lacleancompagny.com, créé dans le tableau de bord
// Supabase) ; l'accès aux données est verrouillé par les règles RLS (table team).

const TEAM_EMAIL = 'equipe@lacleancompagny.com'

const VIEWS = [
  { id: 'accueil', label: 'Accueil', icon: 'home' },
  { id: 'prospects', label: 'Prospects', icon: 'users' },
  { id: 'planning', label: 'Planning', icon: 'calendar' },
  { id: 'taches', label: 'Tâches', icon: 'check' },
  { id: 'caisse', label: 'Caisse', icon: 'euro' },
  { id: 'fidelite', label: 'Fidélité', icon: 'gift' },
  { id: 'contenu', label: 'Contenu Insta / Google', short: 'Contenu', icon: 'spark' },
  { id: 'partenaires', label: 'Garages partenaires', short: 'Garages', icon: 'building' },
  { id: 'stock', label: 'Stock produits', short: 'Stock', icon: 'box' },
  { id: 'documents', label: 'Devis & factures', short: 'Factures', icon: 'file' },
  { id: 'clients', label: 'Clients', icon: 'star' },
  { id: 'avis', label: 'Avis Google', icon: 'message' },
  { id: 'stats', label: 'Statistiques', icon: 'chart' },
  { id: 'reglages', label: 'Réglages', icon: 'settings' },
]
const MOBILE_MAIN = ['accueil', 'planning', 'prospects']
const MOBILE_LEFT = ['accueil', 'planning']

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
  const [syncInfo, setSyncInfo] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [views, setViews] = useState([])
  const [settings, setSettings] = useState(null)
  const [tasks, setTasks] = useState([])
  const [expenses, setExpenses] = useState([])
  const [photos, setPhotos] = useState([])
  const [products, setProducts] = useState([])
  const [subs, setSubs] = useState([])
  const [cars, setCars] = useState([])
  const [going, setGoing] = useState(null)
  const [visitingId, setVisitingId] = useState(null)
  const fc = useForecast()
  const [quick, setQuick] = useState(null)
  const [completing, setCompleting] = useState(null)
  const [moving, setMoving] = useState(null)
  const [reviewingId, setReviewingId] = useState(null)
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
    const [l, j, d, r, st, pv, se, tk, ex, ph, pr, sb, sl, gc] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(2000),
      supabase.from('jobs').select('*').order('done_at', { ascending: false }).limit(5000),
      supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(2000),
      supabase.from('google_reviews').select('*').limit(1000),
      supabase.from('stats_daily').select('*').gte('day', since).limit(20000),
      supabase.from('page_views').select('*').gte('day', since).limit(20000),
      supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('expenses').select('*').order('spent_on', { ascending: false }).limit(5000),
      supabase.from('photos').select('*').order('created_at', { ascending: true }).limit(5000),
      supabase.from('products').select('*').order('name').limit(500),
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('sync_log').select('*').order('at', { ascending: false }).limit(1),
      supabase.from('garage_cars').select('*').order('done_on', { ascending: false }).limit(10000),
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
    setTasks(tk.data || [])
    setExpenses(ex.data || [])
    setPhotos(ph.data || [])
    setProducts(pr.data || [])
    setSubs(sb.data || [])
    setSyncInfo(sl.data?.[0] || null)
    setCars(gc.data || [])
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
    if (v === 'planning' && sub) {
      try {
        localStorage.setItem('lcc-planning', sub)
      } catch {}
    }
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
      if (next.status === 'avis_recu') next.review_done = true
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

  // ---------- Opérations : rendez-vous ----------
  const createRdv = useCallback(
    async ({ lead: existing, first_name, phone, notes, ...fields }) => {
      const when = `${formatDayLabel(fields.appointment_at).toLowerCase()} à ${formatTime(fields.appointment_at)}`
      if (existing) {
        const changes = { ...fields, status: 'reserve', next_followup_at: null, track_stage: null, eta_at: null }
        if (notes) changes.notes = [existing.notes, notes].filter(Boolean).join('\n')
        const ok = await updateLead(existing, changes, { silent: true })
        if (!ok) return null
        await logActivity(existing.id, 'note', `RDV ajouté : ${when}`)
        flash('RDV ajouté')
        return { ...existing, ...changes }
      }
      const { data: row, error: err } = await supabase
        .from('leads')
        .insert({ first_name, phone, notes, ...fields, source: fields.partner ? 'partenaire' : 'autre', status: 'reserve' })
        .select()
        .single()
      if (err) {
        setError("Le RDV n'a pas pu être ajouté. Vérifiez le nom et le téléphone.")
        return null
      }
      await logActivity(row.id, 'creation', `RDV ajouté directement : ${when}`)
      setLeads((prev) => [row, ...prev])
      flash('RDV ajouté')
      return row
    },
    [supabase, updateLead, logActivity]
  )

  const askedReview = useCallback(
    async (lead) => {
      const cur = leads.find((l) => l.id === lead.id) || lead
      if (cur.review_done) return
      await updateLead(cur, { status: 'avis_demande', review_requested_at: new Date().toISOString() }, { silent: true })
    },
    [leads, updateLead]
  )

  const moveRdv = useCallback(
    async (lead, changes) => {
      const ok = await updateLead(lead, changes, { silent: true })
      if (ok) {
        await logActivity(lead.id, 'note', `RDV déplacé : ${formatDayLabel(changes.appointment_at).toLowerCase()} à ${formatTime(changes.appointment_at)}`)
        flash('RDV déplacé')
      }
      return ok
    },
    [updateLead, logActivity]
  )

  const updateJob = useCallback(
    async (job, changes) => {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, ...changes } : j)))
      const { error: err } = await supabase.from('jobs').update(changes).eq('id', job.id)
      if (err) {
        setError("L'encaissement n'a pas été enregistré.")
        load()
      } else flash('Enregistré')
    },
    [supabase, load]
  )

  // ---------- Opérations : tâches et dépenses ----------
  const addTask = useCallback(
    async (task) => {
      const { data: row, error: err } = await supabase.from('tasks').insert({ ...task, author }).select().single()
      if (err) {
        setError("La tâche n'a pas pu être ajoutée.")
        return false
      }
      setTasks((prev) => [row, ...prev])
      flash('Tâche ajoutée')
      return true
    },
    [supabase, author]
  )

  const toggleTask = useCallback(
    async (task) => {
      const changes = { done: !task.done, done_at: task.done ? null : new Date().toISOString() }
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...changes } : t)))
      const { error: err } = await supabase.from('tasks').update(changes).eq('id', task.id)
      if (err) {
        setError("La tâche n'a pas été mise à jour.")
        load()
      }
    },
    [supabase, load]
  )

  const deleteTask = useCallback(
    async (task) => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      const { error: err } = await supabase.from('tasks').delete().eq('id', task.id)
      if (err) {
        setError("La tâche n'a pas pu être supprimée.")
        load()
      }
    },
    [supabase, load]
  )

  const addExpense = useCallback(
    async (exp) => {
      const { data: row, error: err } = await supabase.from('expenses').insert(exp).select().single()
      if (err) {
        setError("La dépense n'a pas pu être ajoutée.")
        return false
      }
      setExpenses((prev) => [row, ...prev])
      flash('Dépense ajoutée')
      return true
    },
    [supabase]
  )

  const deleteExpense = useCallback(
    async (exp) => {
      if (!window.confirm(`Supprimer la dépense « ${exp.label} » ?`)) return
      setExpenses((prev) => prev.filter((e) => e.id !== exp.id))
      const { error: err } = await supabase.from('expenses').delete().eq('id', exp.id)
      if (err) {
        setError("La dépense n'a pas pu être supprimée.")
        load()
      } else flash('Dépense supprimée')
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
      setCars((prev) => prev.map((c) => (c.doc_id === doc.id ? { ...c, doc_id: null } : c)))
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

  const syncGoogle = useCallback(async () => {
    setSyncing(true)
    const { error: err } = await supabase.functions.invoke('google-sync', { body: {} })
    setSyncing(false)
    if (err) setError("Le relevé Google n'a pas pu être lancé.")
    else flash('Relevé Google terminé')
    load()
  }, [supabase, load])

  // ---------- Garages partenaires : voitures scannées ----------
  const addCar = useCallback(
    async (row, file) => {
      let photo_path = null
      if (file) {
        try {
          const blob = await compressImage(file, 1400, 0.8)
          const slug = row.partner.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'garage'
          const rand = (crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2)).replace(/-/g, '')
          const path = `garages/${slug}/${row.done_on}/${rand}.jpg`
          const up = await supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg', upsert: false })
          if (!up.error) photo_path = path
        } catch {}
      }
      const { data, error: err } = await supabase
        .from('garage_cars')
        .insert({ ...row, photo_path, author })
        .select()
        .single()
      if (err) {
        setError("La voiture n'a pas pu être enregistrée. Réessayez.")
        return null
      }
      setCars((prev) => [data, ...prev])
      return data
    },
    [supabase, author]
  )

  const updateCar = useCallback(
    async (car, changes) => {
      const { data, error: err } = await supabase.from('garage_cars').update(changes).eq('id', car.id).select().single()
      if (err) {
        setError("La modification n'a pas été enregistrée.")
        return false
      }
      setCars((prev) => prev.map((c) => (c.id === car.id ? data : c)))
      flash('Enregistré')
      return true
    },
    [supabase]
  )

  const deleteCar = useCallback(
    async (car) => {
      const { error: err } = await supabase.from('garage_cars').delete().eq('id', car.id)
      if (err) {
        setError("La voiture n'a pas pu être supprimée.")
        return false
      }
      if (car.photo_path) supabase.storage.from('photos').remove([car.photo_path]).then(() => {})
      setCars((prev) => prev.filter((c) => c.id !== car.id))
      flash('Voiture supprimée')
      return true
    },
    [supabase]
  )

  // Devis ou facture d'un garage à partir des voitures de la période (la facture marque les voitures comme facturées).
  const makeGarageDoc = useCallback(
    async (kind, partner, list, lines, notes) => {
      const doc = await createDoc(kind, null, { lines, client: { name: partner }, notes })
      if (!doc) return
      if (kind === 'facture') {
        const ids = list.map((c) => c.id)
        const { error: err } = await supabase.from('garage_cars').update({ doc_id: doc.id }).in('id', ids)
        if (!err) setCars((prev) => prev.map((c) => (ids.includes(c.id) ? { ...c, doc_id: doc.id } : c)))
      }
      setOpenDocId(doc.id)
      setView('documents')
      window.scrollTo({ top: 0 })
    },
    [createDoc, supabase]
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

  const completeRdv = useCallback(
    async (lead, { amount, payment_method, discount = 0, invoice = true, plate = null }) => {
      const done_at = toDateInput(lead.appointment_at || new Date().toISOString())
      const service = lead.service || 'Prestation'
      const { data: row, error: err } = await supabase
        .from('jobs')
        .insert({
          lead_id: lead.id,
          done_at,
          service,
          amount,
          payment_method,
          minutes: Number(lead.duration_min) || defaultMinutes(lead.service),
          partner: lead.partner || null,
          plate: plate || lead.plate || null,
          discount: discount || 0,
        })
        .select()
        .single()
      if (err) {
        setError("La prestation n'a pas pu être enregistrée.")
        return null
      }
      setJobs((prev) => [row, ...prev])
      // RDV garage : la voiture rejoint la liste du garage (facture groupée).
      if (lead.partner) {
        const { data: car } = await supabase
          .from('garage_cars')
          .insert({ partner: lead.partner, plate: plate || lead.plate || 'SANS PLAQUE', model: lead.vehicle || null, prep: 'autre', price: Number(amount) || 0, done_on: done_at, notes: service, author })
          .select()
          .single()
        if (car) setCars((prev) => [car, ...prev])
      }
      await logActivity(lead.id, 'prestation', `${row.service} – ${amount} €${discount ? ` (remise fidélité ${discount} €)` : ''}`)
      const leadChanges = { status: lead.review_done ? 'avis_recu' : 'fait', track_stage: 'termine', eta_at: null }
      if (plate && plate !== lead.plate) leadChanges.plate = plate
      await updateLead(lead, leadChanges, { silent: true })

      // Facture automatique (les garages partenaires ont leur facture mensuelle groupée).
      let invoiceNumber = null
      if (invoice && amount > 0 && !lead.partner) {
        const lines = [{ label: `${service}${lead.vehicle ? ` – ${lead.vehicle}` : ''}`, qty: 1, unit_price: Number(amount) + Number(discount || 0) }]
        if (discount) lines.push({ label: 'Remise fidélité', qty: 1, unit_price: -Number(discount) })
        const doc = await createDoc('facture', { ...lead, ...leadChanges }, { lines, client: clientFromLead(lead), notes: null })
        if (doc) {
          invoiceNumber = doc.number
          const paid = payment_method !== 'a_encaisser'
          await updateDoc(doc, paid ? { status: 'paye', paid_at: done_at } : { status: 'envoye' }, { silent: true })
        }
      }

      // Stock : consommation de la prestation.
      const cat = stockCategory(service)
      const used = products.filter(
        (p) => Number(p.per_job) > 0 && (p.applies_to === 'tout' || p.applies_to === cat || (cat === 'complet' && ['interieur', 'exterieur'].includes(p.applies_to)))
      )
      const stockAlerts = []
      for (const p of used) {
        const stock = Math.round((Number(p.stock) - Number(p.per_job)) * 100) / 100
        await supabase.from('products').update({ stock }).eq('id', p.id)
        if (Number(p.alert_at) > 0 && stock <= Number(p.alert_at)) stockAlerts.push(p.name)
      }
      if (used.length) setProducts((prev) => prev.map((p) => (used.some((u) => u.id === p.id) ? { ...p, stock: Math.round((Number(p.stock) - Number(p.per_job)) * 100) / 100 } : p)))

      // Formule d'entretien : prochain passage.
      const sub = subs.find((x) => x.lead_id === lead.id && x.active)
      if (sub) {
        const next_on = toDateInput(addDays(new Date(`${done_at}T12:00:00`), sub.every_days).toISOString())
        setSubs((prev) => prev.map((x) => (x.id === sub.id ? { ...x, next_on } : x)))
        await supabase.from('subscriptions').update({ next_on }).eq('id', sub.id)
      }
      flash('Prestation enregistrée')
      return { lead: { ...lead, ...leadChanges }, invoiceNumber, stockAlerts }
    },
    [supabase, logActivity, updateLead, createDoc, updateDoc, products, subs, author]
  )

  // « Je pars » / « Sur place » : met à jour la page de suivi du client.
  const setStage = useCallback(
    async (lead, stage, eta) => {
      const ok = await updateLead(lead, { track_stage: stage, eta_at: eta }, { silent: true })
      if (ok) {
        await logActivity(lead.id, 'note', stage === 'en_route' ? `En route, arrivée prévue ${formatTime(eta)}` : 'Arrivé sur place')
        flash(stage === 'en_route' ? 'Le client voit votre arrivée' : 'Le client voit « nettoyage en cours »')
      }
      return ok
    },
    [updateLead, logActivity]
  )

  const saveCoords = useCallback(
    (lead, coords) => {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...coords } : l)))
      supabase.from('leads').update(coords).eq('id', lead.id).then(() => {})
    },
    [supabase]
  )

  const onPhotos = useCallback(({ add, remove }) => {
    if (add) setPhotos((prev) => [...prev, ...add])
    if (remove) setPhotos((prev) => prev.filter((p) => p.id !== remove))
  }, [])

  // ---------- Opérations : formules, stock, duel ----------
  const addSub = useCallback(
    async (row) => {
      const { data, error: err } = await supabase.from('subscriptions').insert(row).select().single()
      if (err) {
        setError("La formule n'a pas pu être créée.")
        return false
      }
      setSubs((prev) => [data, ...prev])
      await logActivity(row.lead_id, 'note', `Formule « ${row.label} » créée (${row.price} € tous les ${row.every_days} j)`)
      flash('Formule créée')
      return true
    },
    [supabase, logActivity]
  )

  const updateSub = useCallback(
    async (sub, changes) => {
      setSubs((prev) => prev.map((x) => (x.id === sub.id ? { ...x, ...changes } : x)))
      const { error: err } = await supabase.from('subscriptions').update(changes).eq('id', sub.id)
      if (err) {
        setError("La formule n'a pas été mise à jour.")
        load()
      } else flash('Enregistré')
    },
    [supabase, load]
  )

  const deleteSub = useCallback(
    async (sub) => {
      setSubs((prev) => prev.filter((x) => x.id !== sub.id))
      const { error: err } = await supabase.from('subscriptions').delete().eq('id', sub.id)
      if (err) {
        setError("La formule n'a pas pu être supprimée.")
        load()
      }
    },
    [supabase, load]
  )

  const addProduct = useCallback(
    async (row) => {
      const { data, error: err } = await supabase.from('products').insert(row).select().single()
      if (err) {
        setError("Le produit n'a pas pu être ajouté.")
        return false
      }
      setProducts((prev) => [...prev, data])
      flash('Produit ajouté')
      return true
    },
    [supabase]
  )

  const updateProduct = useCallback(
    async (prod, changes) => {
      setProducts((prev) => prev.map((x) => (x.id === prod.id ? { ...x, ...changes } : x)))
      const { error: err } = await supabase.from('products').update(changes).eq('id', prod.id)
      if (err) {
        setError("Le produit n'a pas été mis à jour.")
        load()
        return false
      }
      return true
    },
    [supabase, load]
  )

  const deleteProduct = useCallback(
    async (prod) => {
      setProducts((prev) => prev.filter((x) => x.id !== prod.id))
      const { error: err } = await supabase.from('products').delete().eq('id', prod.id)
      if (err) {
        setError("Le produit n'a pas pu être supprimé.")
        load()
      }
    },
    [supabase, load]
  )

  const saveStats = useCallback(
    async (rows) => {
      const { error: err } = await supabase.from('stats_daily').upsert(rows, { onConflict: 'day,source,metric' })
      if (err) {
        setError("Le relevé n'a pas été enregistré.")
        return false
      }
      setStats((prev) => [...prev.filter((x) => !rows.some((r) => r.day === x.day && r.source === x.source && r.metric === x.metric)), ...rows])
      flash('Relevé enregistré')
      return true
    },
    [supabase]
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
  setTravelBuffer(settings?.business?.travel_buffer_min ?? 30)
  setReferralGoal(settings?.business?.referral_goal ?? 10)
  const visibleLeads = hideTests ? leads.filter((l) => l.source !== 'test') : leads
  const visiting = leads.find((l) => l.id === visitingId) || null
  const lowCount = lowStock(products).length
  const openLead = leads.find((l) => l.id === openId) || null
  const newCount = visibleLeads.filter((l) => l.status === 'nouveau').length
  const unreplied = reviews.filter((r) => !r.replied).length
  const tasksDue = tasks.filter((t) => ['late', 'today'].includes(taskGroup(t))).length
  const openQuick = (opts = {}) => setQuick(opts)
  const shared = { leads: visibleLeads, jobs, onOpen: setOpenId, updateLead, logActivity, onReview: (l) => setReviewingId(l.id) }
  const badge = (id) => (id === 'prospects' ? newCount : id === 'avis' ? unreplied : id === 'taches' ? tasksDue : id === 'stock' ? lowCount : 0)
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
              <button type="button" className={styles.btnPrimary} onClick={() => openQuick()}>
                <Icon name="plus" /> <span className={styles.hideXs}>Ajouter</span>
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
            <Overview
              {...shared}
              cars={cars}
              who={memberName}
              docs={docs}
              reviews={reviews}
              stats={stats}
              views={views}
              tasks={tasks}
              subs={subs}
              products={products}
              fc={fc}
              settings={settings}
              goTo={goTo}
              onAdd={openQuick}
              onComplete={setCompleting}
              onToggleTask={toggleTask}
              onStage={setStage}
              onVisit={(l) => setVisitingId(l.id)}
            />
          )}
          {view === 'prospects' && <Pipeline {...shared} />}
          {view === 'planning' && (
            <Planning
              {...shared}
              fc={fc}
              settings={settings}
              saveCoords={saveCoords}
              onAdd={(day, time, lead) => openQuick({ day, time, lead })}
              onComplete={setCompleting}
              onMove={setMoving}
              onGo={(l, min) => setGoing({ lead: l, min })}
              onVisit={(l) => setVisitingId(l.id)}
            />
          )}
          {view === 'taches' && <Tasks tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} onOpenLead={setOpenId} />}
          {view === 'caisse' && (
            <Cash
              jobs={jobs}
              cars={cars}
              onOpenGarages={() => goTo('partenaires')}
              leads={leads}
              expenses={expenses}
              docs={docs}
              products={products}
              settings={settings}
              onSaveSettings={saveSettings}
              onUpdateJob={updateJob}
              onDeleteExpense={deleteExpense}
              onNewExpense={() => openQuick({ mode: 'depense' })}
              onOpenLead={setOpenId}
            />
          )}
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
          {view === 'fidelite' && (
            <Fidelite
              leads={visibleLeads}
              jobs={jobs}
              subs={subs}
              settings={settings}
              onOpen={setOpenId}
              onAddSub={addSub}
              onUpdateSub={updateSub}
              onDeleteSub={deleteSub}
              onPlanRdv={(lead) => openQuick({ lead })}
              logActivity={logActivity}
            />
          )}
          {view === 'contenu' && <Content leads={leads} jobs={jobs} photos={photos} settings={settings} onSaveSettings={saveSettings} flash={flash} />}
          {view === 'partenaires' && (
            <Partners
              leads={leads}
              docs={docs}
              cars={cars}
              settings={settings}
              onSaveSettings={saveSettings}
              onAddCar={addCar}
              onUpdateCar={updateCar}
              onDeleteCar={deleteCar}
              onMakeDoc={makeGarageDoc}
              onOpenDoc={(id) => {
                setOpenDocId(id)
                goTo('documents')
              }}
              flash={flash}
            />
          )}
          {view === 'stock' && (
            <Stock
              products={products}
              onAdd={addProduct}
              onUpdate={updateProduct}
              onDelete={deleteProduct}
              onTask={(title) => addTask({ title, due_on: toDateInput(new Date().toISOString()) })}
            />
          )}
          {view === 'clients' && <Clients {...shared} />}
          {view === 'avis' && <Reviews {...shared} reviews={reviews} stats={stats} onUpdateReview={updateReview} flash={flash} onSaveStats={saveStats} />}
          {view === 'stats' && <Stats key={statsTab} leads={visibleLeads} jobs={jobs} expenses={expenses} stats={stats} views={views} sync={syncInfo} onSync={syncGoogle} syncing={syncing} initialTab={statsTab} />}
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
        {VIEWS.filter((v) => MOBILE_LEFT.includes(v.id)).map((v) => (
          <button type="button" key={v.id} className={view === v.id ? styles.bottomOn : ''} onClick={() => goTo(v.id)}>
            <Icon name={v.icon} />
            <span>{v.short || v.label}</span>
            {badge(v.id) > 0 && <em>{badge(v.id)}</em>}
          </button>
        ))}
        <button type="button" className={styles.fab} onClick={() => openQuick()} aria-label="Ajouter un RDV, une tâche ou une dépense">
          <span className={styles.fabIn}>
            <Icon name="plus" size={26} />
          </span>
          <span>Ajouter</span>
        </button>
        {VIEWS.filter((v) => MOBILE_MAIN.includes(v.id) && !MOBILE_LEFT.includes(v.id)).map((v) => (
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
          {unreplied + tasksDue > 0 && <em>{unreplied + tasksDue}</em>}
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
          allJobs={jobs}
          docs={docs.filter((d) => d.lead_id === openLead.id)}
          allLeads={leads}
          photos={photos.filter((p) => p.lead_id === openLead.id).slice().reverse()}
          subscription={subs.find((x) => x.lead_id === openLead.id) || null}
          settings={settings}
          onVisit={(l) => {
            setOpenId(null)
            setVisitingId(l.id)
          }}
          onAddSub={addSub}
          onUpdateSub={updateSub}
          onGo={(l) => setGoing({ lead: l })}
          onComplete={setCompleting}
          onPhotos={onPhotos}
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
          onPlanRdv={(lead) => {
            setOpenId(null)
            setQuick({ lead })
          }}
        />
      )}

      {quick && (
        <QuickAdd
          leads={leads}
          settings={settings}
          initial={quick}
          onClose={() => setQuick(null)}
          onCreateRdv={createRdv}
          onAddTask={addTask}
          onAddExpense={addExpense}
          onNewProspect={() => {
            setQuick(null)
            setAdding(true)
          }}
          onOpenLead={(id) => {
            setQuick(null)
            setOpenId(id)
          }}
        />
      )}

      {completing && (
        <CompleteRdv
          lead={leads.find((l) => l.id === completing.id) || completing}
          visits={jobs.filter((j) => j.lead_id === completing.id).length}
          settings={settings}
          subscription={subs.find((x) => x.lead_id === completing.id && x.active) || null}
          photos={photos}
          supabase={supabase}
          onPhotos={onPhotos}
          onClose={() => setCompleting(null)}
          onComplete={completeRdv}
          onAskedReview={askedReview}
          onOpenVisit={(l) => {
            setCompleting(null)
            setVisitingId(l.id)
          }}
          onAddSubscription={addSub}
          logActivity={logActivity}
        />
      )}

      {going && (
        <GoRdv
          key={going.lead.id}
          lead={leads.find((l) => l.id === going.lead.id) || going.lead}
          driveMin={going.min || null}
          onClose={() => setGoing(null)}
          onStage={setStage}
          logActivity={logActivity}
        />
      )}

      {visiting && (
        <Visit
          key={visiting.id}
          lead={visiting}
          photos={photos}
          supabase={supabase}
          fc={fc}
          onClose={() => setVisitingId(null)}
          updateLead={updateLead}
          onPhotos={onPhotos}
          onGo={(l) => setGoing({ lead: l })}
          onComplete={(l) => {
            setVisitingId(null)
            setCompleting(l)
          }}
          flash={flash}
          logActivity={logActivity}
        />
      )}

      {reviewingId && leads.find((l) => l.id === reviewingId) && (
        <AskReview
          lead={leads.find((l) => l.id === reviewingId)}
          photos={photos}
          supabase={supabase}
          onPhotos={onPhotos}
          onClose={() => setReviewingId(null)}
          onSent={(ch) => {
            const l = leads.find((x) => x.id === reviewingId)
            askedReview(l)
            logActivity(l.id, ch === 'partage' ? 'whatsapp' : ch, 'Demande d’avis envoyée')
          }}
        />
      )}

      {moving && <MoveRdv lead={moving} leads={leads} onClose={() => setMoving(null)} onMove={moveRdv} />}

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
