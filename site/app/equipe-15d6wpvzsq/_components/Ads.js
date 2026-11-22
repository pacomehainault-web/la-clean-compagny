'use client'

import { useMemo, useState } from 'react'
import styles from '../admin.module.css'
import a from './ads.module.css'
import { CLIENT_STATUSES, euros, leadChannel, channelLabel, addDays } from '../_lib/crm'
import { SITE } from '@/lib/constants'

// Onglet « Pubs & clients » : combien de demandes et de clients chaque canal
// apporte, ce qu'ils ont rapporté et ce qu'ils ont coûté. La dépense pub vient
// de Caisse → Dépenses (catégories « Pub Meta » et « Pub Google Ads »).

const PAID = { meta_ads: 'pub_meta', google_ads: 'pub_google' }

const PERIODS = [
  { id: '30', label: '30 jours' },
  { id: 'month', label: 'Ce mois' },
  { id: 'prev', label: 'Mois dernier' },
  { id: 'all', label: 'Depuis le début' },
]

function periodRange(id, now = new Date()) {
  if (id === '30') return { from: addDays(now, -30), to: now }
  if (id === 'month') return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
  if (id === 'prev') return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1) }
  return { from: new Date(2000, 0, 1), to: now }
}

const isClient = (l, jobsByLead) => CLIENT_STATUSES.includes(l.status) || (jobsByLead.get(l.id) || 0) > 0
const isBooked = (l) => l.status === 'reserve' || CLIENT_STATUSES.includes(l.status)

function money(v) {
  return v === null || !Number.isFinite(v) ? '—' : euros(v)
}

export function adsReport({ leads, jobs, expenses, from, to }) {
  const inRange = (d) => {
    const t = new Date(d)
    return t >= from && t < to
  }
  const jobsByLead = new Map()
  for (const j of jobs) if (j.lead_id) jobsByLead.set(j.lead_id, (jobsByLead.get(j.lead_id) || 0) + Number(j.amount || 0))
  const real = leads.filter((l) => l.source !== 'test' && inRange(l.created_at))
  const rows = new Map()
  const row = (ch) => {
    if (!rows.has(ch)) rows.set(ch, { channel: ch, leads: 0, booked: 0, clients: 0, ca: 0, spend: 0 })
    return rows.get(ch)
  }
  for (const l of real) {
    const r = row(leadChannel(l))
    r.leads += 1
    if (isBooked(l)) r.booked += 1
    if (isClient(l, jobsByLead)) r.clients += 1
    r.ca += jobsByLead.get(l.id) || 0
  }
  for (const e of expenses) {
    if (!inRange(`${e.spent_on}T12:00:00`)) continue
    const ch = Object.keys(PAID).find((k) => PAID[k] === e.category)
    if (ch) row(ch).spend += Number(e.amount || 0)
  }
  const list = [...rows.values()].sort((x, y) => y.leads - x.leads || y.spend - x.spend)
  const paid = list.filter((r) => PAID[r.channel])
  const tot = (arr, k) => arr.reduce((s, r) => s + r[k], 0)
  const p = { leads: tot(paid, 'leads'), clients: tot(paid, 'clients'), ca: tot(paid, 'ca'), spend: tot(paid, 'spend') }
  return {
    list,
    paid: {
      ...p,
      cpl: p.leads ? p.spend / p.leads : null,
      cpa: p.clients ? p.spend / p.clients : null,
      roas: p.spend ? p.ca / p.spend : null,
    },
    total: { leads: real.length, clients: tot(list, 'clients'), ca: tot(list, 'ca') },
  }
}

function monthly(leads, jobs, expenses, months = 6, now = new Date()) {
  const out = []
  for (let i = months - 1; i >= 0; i -= 1) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const r = adsReport({ leads, jobs, expenses, from, to })
    out.push({ label: from.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), ...r.total, paidLeads: r.paid.leads, spend: r.paid.spend })
  }
  return out
}

function CopyLink({ label, url }) {
  const [done, setDone] = useState(false)
  return (
    <li className={a.linkRow}>
      <div>
        <strong>{label}</strong>
        <code>{url}</code>
      </div>
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={() => {
          navigator.clipboard?.writeText(url)
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        }}
      >
        {done ? 'Copié' : 'Copier'}
      </button>
    </li>
  )
}

export default function Ads({ leads, jobs, expenses = [] }) {
  const [period, setPeriod] = useState('30')
  const report = useMemo(() => {
    const { from, to } = periodRange(period)
    return adsReport({ leads, jobs, expenses, from, to })
  }, [leads, jobs, expenses, period])
  const months = useMemo(() => monthly(leads, jobs, expenses), [leads, jobs, expenses])
  const p = report.paid
  const base = SITE.url

  return (
    <div className={styles.stack}>
      <div className={styles.segment} role="tablist" aria-label="Période">
        {PERIODS.map((x) => (
          <button type="button" role="tab" key={x.id} aria-selected={period === x.id} className={period === x.id ? styles.segOn : ''} onClick={() => setPeriod(x.id)}>
            {x.label}
          </button>
        ))}
      </div>

      <section className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Dépense pub</span>
          <strong>{euros(p.spend)}</strong>
          <em>Meta + Google Ads</em>
        </div>
        <div className={styles.kpi}>
          <span>Demandes venues des pubs</span>
          <strong>{p.leads}</strong>
          <em>coût par demande : {money(p.cpl)}</em>
        </div>
        <div className={styles.kpi}>
          <span>Clients venus des pubs</span>
          <strong>{p.clients}</strong>
          <em>coût par client : {money(p.cpa)}</em>
        </div>
        <div className={styles.kpi}>
          <span>CA rapporté par les pubs</span>
          <strong>{euros(p.ca)}</strong>
          <em>{p.roas === null ? 'pas encore de dépense saisie' : `${p.roas.toFixed(1).replace('.', ',')} € gagnés pour 1 € dépensé`}</em>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Par canal</h2>
        </div>
        {report.list.length === 0 ? (
          <p className={styles.emptySmall}>Pas encore de demande sur cette période.</p>
        ) : (
          <div className={a.scroll}>
            <table className={a.grid}>
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Demandes</th>
                  <th>Réservés</th>
                  <th>Clients</th>
                  <th>CA</th>
                  <th>Dépense</th>
                  <th>Coût / demande</th>
                  <th>Coût / client</th>
                </tr>
              </thead>
              <tbody>
                {report.list.map((r) => (
                  <tr key={r.channel} className={PAID[r.channel] ? a.paidRow : ''}>
                    <td>{channelLabel(r.channel)}</td>
                    <td>{r.leads}</td>
                    <td>{r.booked}</td>
                    <td>{r.clients}</td>
                    <td>{euros(r.ca)}</td>
                    <td>{PAID[r.channel] ? euros(r.spend) : '—'}</td>
                    <td>{PAID[r.channel] ? money(r.leads ? r.spend / r.leads : null) : '—'}</td>
                    <td>{PAID[r.channel] ? money(r.clients ? r.spend / r.clients : null) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className={styles.hint}>
          Les demandes reçues avant la mise en place du suivi d&apos;origine apparaissent en « Site – origine inconnue ». La dépense se saisit chaque semaine dans Caisse → Dépenses, catégorie « Pub Meta » ou « Pub Google Ads ».
        </p>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Mois par mois (point de départ inclus)</h2>
        </div>
        <div className={a.scroll}>
          <table className={a.grid}>
            <thead>
              <tr>
                <th>Mois</th>
                <th>Demandes</th>
                <th>dont pubs</th>
                <th>Clients</th>
                <th>CA</th>
                <th>Dépense pub</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.label}>
                  <td>{m.label}</td>
                  <td>{m.leads}</td>
                  <td>{m.paidLeads}</td>
                  <td>{m.clients}</td>
                  <td>{euros(m.ca)}</td>
                  <td>{euros(m.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Liens à utiliser dans les pubs et les posts</h2>
        </div>
        <p className={styles.hint}>Sans ces liens, une demande venue d&apos;une pub ou d&apos;un post Google ne peut pas être reconnue. Google Ads ajoute son suivi tout seul (suivi automatique activé dans le compte).</p>
        <ul className={a.links}>
          <CopyLink label="Pub Meta → accueil (formulaire « Être rappelé »)" url={`${base}/?utm_source=meta&utm_medium=paid&utm_campaign=reels`} />
          <CopyLink label="Pub Meta → réservation en ligne" url={`${base}/reserver?utm_source=meta&utm_medium=paid&utm_campaign=reels`} />
          <CopyLink label="Fiche Google → bouton Site web" url={`${base}/?utm_source=gbp&utm_medium=organic&utm_campaign=fiche`} />
          <CopyLink label="Fiche Google → posts" url={`${base}/reserver?utm_source=gbp&utm_medium=organic&utm_campaign=post`} />
          <CopyLink label="Instagram → lien en bio" url={`${base}/?utm_source=instagram&utm_medium=bio&utm_campaign=profil`} />
        </ul>
      </section>
    </div>
  )
}
