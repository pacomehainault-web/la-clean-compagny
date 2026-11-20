'use client'

import { useMemo, useState } from 'react'
import styles from '../admin.module.css'
import { CLIENT_STATUSES, computeKpis, countBy, euros, monthlySeries, sourceGroup, statSeries, latestStat, addDays, startOfDay, toDateInput } from '../_lib/crm'

function Bars({ rows, valueKey, format = (v) => v, tone = 'blue' }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]))
  return (
    <div className={styles.bars}>
      {rows.map((r) => (
        <div className={styles.barCol} key={r.label}>
          <span className={styles.barVal}>{r[valueKey] ? format(r[valueKey]) : ''}</span>
          <span className={`${styles.bar} ${styles[`bar_${tone}`]}`} style={{ height: `${(r[valueKey] / max) * 100}%` }} />
          <span className={styles.barLabel}>{r.label}</span>
        </div>
      ))}
    </div>
  )
}

function Ranking({ rows, total }) {
  if (!rows.length) return <p className={styles.emptySmall}>Pas encore de données.</p>
  return (
    <ul className={styles.ranking}>
      {rows.slice(0, 8).map(([label, n]) => (
        <li key={label}>
          <span>{label}</span>
          <span className={styles.rankBar}>
            <i style={{ width: `${(n / Math.max(1, rows[0][1])) * 100}%` }} />
          </span>
          <strong>
            {n}
            {total ? <em> {Math.round((n / total) * 100)} %</em> : null}
          </strong>
        </li>
      ))}
    </ul>
  )
}

function Activity({ leads, jobs }) {
  const series = useMemo(() => monthlySeries(leads, jobs, 6), [leads, jobs])
  const k = useMemo(() => computeKpis(leads, jobs), [leads, jobs])
  const real = leads.filter((l) => l.source !== 'test')
  const won = real.filter((l) => ['reserve', ...CLIENT_STATUSES].includes(l.status))
  const lost = real.filter((l) => l.status === 'perdu')
  const bySource = countBy(real, (l) => sourceGroup(l.source))
  const byService = countBy(real, (l) => l.service)
  const byCity = countBy(real, (l) => l.city && l.city.trim())
  const lostReasons = countBy(lost, (l) => l.lost_reason)
  const caByService = useMemo(() => {
    const m = new Map()
    for (const j of jobs) m.set(j.service, (m.get(j.service) || 0) + Number(j.amount || 0))
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [jobs])

  return (
    <div className={styles.stack}>
      <section className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Prospects (30 j)</span>
          <strong>{k.leads30}</strong>
          <em>{real.length} au total</em>
        </div>
        <div className={styles.kpi}>
          <span>Taux de transformation</span>
          <strong>{k.conversion30 === null ? '—' : `${k.conversion30} %`}</strong>
          <em>réservés ou faits, 30 derniers jours</em>
        </div>
        <div className={styles.kpi}>
          <span>Panier moyen (mois)</span>
          <strong>{euros(k.avgTicket)}</strong>
          <em>{k.jobsMonth} prestations ce mois</em>
        </div>
        <div className={styles.kpi}>
          <span>Gagnés / perdus</span>
          <strong>
            {won.length} / {lost.length}
          </strong>
          <em>depuis le début</em>
        </div>
      </section>

      <div className={styles.twoCols}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Prospects par mois</h2>
          </div>
          <Bars rows={series} valueKey="leads" />
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Chiffre d&apos;affaires par mois</h2>
          </div>
          <Bars rows={series} valueKey="ca" format={(v) => euros(v)} tone="green" />
        </section>
      </div>

      <div className={styles.twoCols}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>D&apos;où viennent les prospects</h2>
          </div>
          <Ranking rows={bySource} total={real.length} />
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Prestations demandées</h2>
          </div>
          <Ranking rows={byService} total={real.length} />
        </section>
      </div>

      <div className={styles.twoCols}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Villes</h2>
          </div>
          <Ranking rows={byCity} total={real.length} />
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>CA par prestation</h2>
          </div>
          {caByService.length === 0 ? (
            <p className={styles.emptySmall}>Pas encore de prestation enregistrée.</p>
          ) : (
            <ul className={styles.ranking}>
              {caByService.map(([label, v]) => (
                <li key={label}>
                  <span>{label}</span>
                  <span className={styles.rankBar}>
                    <i style={{ width: `${(v / Math.max(1, caByService[0][1])) * 100}%` }} />
                  </span>
                  <strong>{euros(v)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {lost.length > 0 && (
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Pourquoi on perd des clients</h2>
          </div>
          <Ranking rows={lostReasons} total={lost.length} />
        </section>
      )}
    </div>
  )
}

// Barres quotidiennes compactes (30 jours) : valeur au survol, dates aux extrémités.
function DailyBars({ rows, tone = 'blue', format = (v) => v }) {
  const max = Math.max(1, ...rows.map((r) => r.value || 0))
  const total = rows.reduce((t, r) => t + (r.value || 0), 0)
  if (!rows.some((r) => r.value)) return <p className={styles.emptySmall}>Pas encore de données relevées.</p>
  return (
    <div>
      <div className={styles.daily}>
        {rows.map((r) => (
          <span
            key={r.day}
            className={`${styles.dailyBar} ${styles[`bar_${tone}`] || ''} ${r.value === null ? styles.dailyNone : ''}`}
            style={{ height: `${r.value ? Math.max(4, (r.value / max) * 100) : 2}%` }}
            title={`${new Date(r.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} : ${r.value === null ? 'pas de donnée' : format(r.value)}`}
          />
        ))}
      </div>
      <div className={styles.dailyAxis}>
        <span>{new Date(rows[0].day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
        <span>Total : {format(total)}</span>
        <span>{new Date(rows[rows.length - 1].day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  )
}

function sumBy(rows, keyFn) {
  const m = new Map()
  for (const r of rows) m.set(keyFn(r), (m.get(keyFn(r)) || 0) + Number(r.views))
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

function viewsSeries(views, days = 30) {
  const by = new Map()
  for (const v of views) by.set(v.day, (by.get(v.day) || 0) + Number(v.views))
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const key = toDateInput(addDays(startOfDay(), -i).toISOString())
    out.push({ day: key, value: by.get(key) || 0 })
  }
  return out
}

const PAGE_NAMES = {
  '/': 'Accueil',
  '/devis': 'Devis en ligne',
  '/prestations': 'Prestations',
  '/avis': 'Avis',
  '/contact': 'Contact',
  '/galerie': 'Galerie',
  '/bons-cadeaux': 'Bons cadeaux',
  '/pro': 'Espace pro',
}
function pageName(path) {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path]
  const parts = path.split('/').filter(Boolean)
  const last = parts[parts.length - 1] || ''
  const nice = last.replace(/-/g, ' ')
  return nice.charAt(0).toUpperCase() + nice.slice(1) + (parts.length > 2 ? ` (${parts[1].replace(/-/g, ' ')})` : '')
}

const REF_NAMES = { google: 'Google', direct: 'Accès direct', social: 'Réseaux sociaux', autre: 'Autres sites' }

function Site({ views, leads }) {
  const since7 = toDateInput(addDays(startOfDay(), -6).toISOString())
  const since14 = toDateInput(addDays(startOfDay(), -13).toISOString())
  const w = views.filter((v) => v.day >= since7).reduce((t, v) => t + v.views, 0)
  const pw = views.filter((v) => v.day >= since14 && v.day < since7).reduce((t, v) => t + v.views, 0)
  const last30 = toDateInput(addDays(startOfDay(), -29).toISOString())
  const recent = views.filter((v) => v.day >= last30)
  const pages = sumBy(recent, (v) => pageName(v.path))
  const entries = recent.filter((v) => v.ref !== 'interne')
  const refs = sumBy(entries, (v) => REF_NAMES[v.ref] || v.ref)
  const visits = entries.reduce((t, v) => t + v.views, 0)
  const totalRecent = recent.reduce((t, v) => t + v.views, 0)
  const formLeads = leads.filter((l) => l.source !== 'test' && sourceGroup(l.source) === 'Site internet' && l.created_at >= last30).length
  const trend = pw ? Math.round(((w - pw) / pw) * 100) : null
  return (
    <div className={styles.stack}>
      <section className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Pages vues (7 j)</span>
          <strong>{w}</strong>
          <em>{trend === null ? 'semaine d’avant : —' : `${trend >= 0 ? '+' : ''}${trend} % vs semaine d’avant`}</em>
        </div>
        <div className={styles.kpi}>
          <span>Visites (30 j)</span>
          <strong>{visits}</strong>
          <em>{totalRecent} pages vues</em>
        </div>
        <div className={styles.kpi}>
          <span>Formulaires (30 j)</span>
          <strong>{formLeads}</strong>
          <em>prospects venus du site</em>
        </div>
        <div className={styles.kpi}>
          <span>Conversion</span>
          <strong>{visits ? `${((formLeads / visits) * 100).toFixed(1)} %` : '—'}</strong>
          <em>formulaires / visites</em>
        </div>
      </section>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Pages vues par jour</h2>
        </div>
        <DailyBars rows={viewsSeries(views)} />
      </section>
      <div className={styles.twoCols}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Pages les plus vues (30 j)</h2>
          </div>
          <Ranking rows={pages} total={totalRecent} />
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>D&apos;où viennent les visiteurs</h2>
          </div>
          <Ranking rows={refs} total={visits} />
        </section>
      </div>
      <p className={styles.hint}>Compteur anonyme du site (sans cookie), actif depuis le 20 novembre 2026.</p>
    </div>
  )
}

const GBP_METRICS = [
  { id: 'vues_30j', label: 'Vues de la fiche' },
  { id: 'appels_30j', label: 'Appels' },
  { id: 'clics_site_30j', label: 'Clics vers le site' },
  { id: 'itineraires_30j', label: 'Itinéraires' },
]

function Google({ stats }) {
  const keywords = useMemo(() => {
    const byKey = new Map()
    for (const x of stats) {
      if (x.source !== 'gsc' || !x.metric.startsWith('pos:')) continue
      const k = x.metric.slice(4)
      if (!byKey.has(k)) byKey.set(k, [])
      byKey.get(k).push(x)
    }
    return [...byKey.entries()]
      .map(([k, rows]) => {
        rows.sort((p, q) => (p.day < q.day ? 1 : -1))
        return { k, pos: Number(rows[0].value), prev: rows[1] ? Number(rows[1].value) : null }
      })
      .sort((p, q) => p.pos - q.pos)
  }, [stats])
  const anyGbp = stats.some((s) => s.source === 'gbp')
  const anyGsc = stats.some((s) => s.source === 'gsc')
  return (
    <div className={styles.stack}>
      <section className={styles.kpis}>
        {GBP_METRICS.map((m) => {
          const l = latestStat(stats, 'gbp', m.id)
          return (
            <div className={styles.kpi} key={m.id}>
              <span>{m.label}</span>
              <strong>{l ? l.value : '—'}</strong>
              <em>
                fiche Google, 30 derniers jours
                {l && l.prev !== null ? ` · ${l.value - l.prev >= 0 ? '+' : ''}${l.value - l.prev} depuis le relevé précédent` : ''}
              </em>
            </div>
          )
        })}
      </section>
      {!anyGbp && <p className={styles.hint}>Les chiffres de la fiche Google sont relevés chaque matin automatiquement : ils apparaissent dès le premier relevé.</p>}

      <div className={styles.twoCols}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Clics depuis Google (par jour)</h2>
          </div>
          <DailyBars rows={statSeries(stats, 'gsc', 'clics', 30)} />
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Apparitions dans Google (par jour)</h2>
          </div>
          <DailyBars rows={statSeries(stats, 'gsc', 'impressions', 30)} tone="green" />
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Positions sur Google</h2>
          <span className={styles.count}>objectif : top 4</span>
        </div>
        {!anyGsc || keywords.length === 0 ? (
          <p className={styles.emptySmall}>Les positions sont relevées chaque matin dans la Search Console.</p>
        ) : (
          <ul className={styles.ranking}>
            {keywords.map((r) => {
              const delta = r.prev === null ? null : Math.round((r.prev - r.pos) * 10) / 10
              return (
                <li key={r.k}>
                  <span>{r.k}</span>
                  <span className={styles.rankBar}>
                    <i style={{ width: `${Math.max(4, 100 - (r.pos - 1) * 5)}%`, background: r.pos <= 4 ? 'var(--green)' : r.pos <= 10 ? 'var(--blue)' : 'var(--orange)' }} />
                  </span>
                  <strong>
                    {r.pos.toFixed(1)}
                    {delta ? <em className={delta > 0 ? styles.up : styles.down}> {delta > 0 ? `▲ ${delta}` : `▼ ${-delta}`}</em> : null}
                  </strong>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default function Stats({ leads, jobs, stats, views, initialTab = 'activite' }) {
  const [tab, setTab] = useState(initialTab)
  return (
    <div className={styles.stack}>
      <div className={styles.segment} role="tablist" aria-label="Statistiques">
        {[
          ['activite', 'Activité'],
          ['google', 'Google'],
          ['site', 'Site'],
        ].map(([id, label]) => (
          <button type="button" role="tab" aria-selected={tab === id} key={id} className={tab === id ? styles.segOn : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'activite' && <Activity leads={leads} jobs={jobs} />}
      {tab === 'google' && <Google stats={stats} />}
      {tab === 'site' && <Site views={views} leads={leads} />}
    </div>
  )
}
