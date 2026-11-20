'use client'

import { useMemo } from 'react'
import styles from '../admin.module.css'
import { CLIENT_STATUSES, computeKpis, countBy, euros, monthlySeries, sourceGroup } from '../_lib/crm'

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

export default function Stats({ leads, jobs }) {
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
