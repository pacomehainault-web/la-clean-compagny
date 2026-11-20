'use client'

import { useEffect, useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { PAYMENT_METHODS, EXPENSE_LABEL, euros, euros2, monthRange, formatDate, catalogItem, defaultMinutes, stockCategory, getTravelBuffer, roadKm, monthForecast } from '../_lib/crm'
import { geocode } from '../_lib/geo'

// Coût produits estimé d'une prestation (stock : consommation × prix d'achat).
function productCost(products, service) {
  const cat = stockCategory(service)
  return products
    .filter((p) => p.applies_to === 'tout' || p.applies_to === cat || (cat === 'complet' && (p.applies_to === 'interieur' || p.applies_to === 'exterieur')))
    .reduce((t, p) => t + (Number(p.per_job) || 0) * (Number(p.price) || 0), 0)
}

// Caisse : encaissements (prestations), dépenses, bénéfice du mois.
export default function Cash({ jobs, leads, expenses, docs, settings, products = [], onSaveSettings, onUpdateJob, onDeleteExpense, onNewExpense, onOpenLead }) {
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const { from, to } = monthRange(ym.y, ym.m)
  const inMonth = (d) => d && d >= from && d <= to
  const rate = Number(settings?.business?.cotisations_pct) || 0
  const [rateInput, setRateInput] = useState(rate || '')

  const mJobs = jobs.filter((j) => inMonth(j.done_at)).sort((a, b) => (a.done_at < b.done_at ? 1 : -1))
  const mExp = expenses.filter((e) => inMonth(e.spent_on)).sort((a, b) => (a.spent_on < b.spent_on ? 1 : -1))
  const ca = mJobs.reduce((s, j) => s + Number(j.amount || 0), 0)
  const pending = mJobs.filter((j) => j.payment_method === 'a_encaisser').reduce((s, j) => s + Number(j.amount || 0), 0)
  const spent = mExp.reduce((s, e) => s + Number(e.amount || 0), 0)
  const cotis = rate ? Math.round(ca * rate) / 100 : 0
  const profit = ca - spent - cotis
  const unpaidInvoices = docs.filter((d) => d.kind === 'facture' && d.status === 'envoye').reduce((s, d) => s + Number(d.total), 0)

  // Rentabilité par prestation : € gagnés par heure, trajet et produits déduits.
  const buffer = getTravelBuffer()
  const leadOf = (id) => leads.find((l) => l.id === id)
  const perService = Object.values(
    mJobs.reduce((acc, j) => {
      const key = catalogItem(j.service)?.short || j.service
      const l = leadOf(j.lead_id)
      const minutes = Number(j.minutes) || Number(l?.duration_min) || defaultMinutes(j.service)
      const cost = productCost(products, j.service)
      const a = acc[key] || { key, n: 0, ca: 0, minutes: 0, cost: 0 }
      a.n += 1
      a.ca += Number(j.amount || 0)
      a.minutes += minutes + buffer
      a.cost += cost
      acc[key] = a
      return acc
    }, {})
  )
    .map((r) => ({ ...r, perHour: r.minutes ? ((r.ca - r.cost) / r.minutes) * 60 : 0 }))
    .sort((a, b) => b.perHour - a.perHour)
  const totalHours = perService.reduce((t, r) => t + r.minutes, 0) / 60
  const globalPerHour = totalHours ? (ca - perService.reduce((t, r) => t + r.cost, 0)) / totalHours : 0

  // Kilomètres du mois (adresses géolocalisées dans la Tournée).
  const [base, setBase] = useState(null)
  const baseAddress = settings?.business?.base_address || 'Angers'
  useEffect(() => {
    let off = false
    geocode(baseAddress)
      .then((b) => !off && setBase(b))
      .catch(() => {})
    return () => {
      off = true
    }
  }, [baseAddress])
  const byDay = mJobs.reduce((m, j) => m.set(j.done_at, [...(m.get(j.done_at) || []), leadOf(j.lead_id)].filter(Boolean)), new Map())
  let km = 0
  let located = 0
  for (const [, ls] of byDay) {
    const pts = ls.filter((l) => l.lat != null)
    if (!pts.length || !base) continue
    located += pts.length
    let prev = base
    for (const p of pts) {
      km += roadKm(prev, { lat: p.lat, lng: p.lng }) || 0
      prev = { lat: p.lat, lng: p.lng }
    }
    km += roadKm(prev, base) || 0
  }
  const isCurrent = ym.y === now.getFullYear() && ym.m === now.getMonth()
  const fc = isCurrent ? monthForecast(leads, jobs, now) : null
  const goal = Number(settings?.monthly_goal) || 0

  const byMethod = PAYMENT_METHODS.map((p) => ({ ...p, total: mJobs.filter((j) => (j.payment_method || 'cb') === p.id).reduce((s, j) => s + Number(j.amount || 0), 0) })).filter((p) => p.total > 0)
  const byCat = Object.entries(mExp.reduce((acc, e) => ({ ...acc, [e.category]: (acc[e.category] || 0) + Number(e.amount) }), {})).sort((a, b) => b[1] - a[1])
  const name = (id) => leads.find((l) => l.id === id)?.first_name || 'Client'

  const label = new Date(ym.y, ym.m, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const shift = (n) => {
    const d = new Date(ym.y, ym.m + n, 1)
    setYm({ y: d.getFullYear(), m: d.getMonth() })
  }

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <div className={styles.segment} role="group" aria-label="Mois">
          <button type="button" onClick={() => shift(-1)} aria-label="Mois précédent">
            <Icon name="left" size={16} />
          </button>
          <button type="button" className={styles.segOn} onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })}>
            {label.replace(/^./, (c) => c.toUpperCase())}
          </button>
          <button type="button" onClick={() => shift(1)} aria-label="Mois suivant">
            <Icon name="right" size={16} />
          </button>
        </div>
        <button type="button" className={styles.btnSecondary} onClick={onNewExpense}>
          <Icon name="plus" size={17} /> Dépense
        </button>
      </div>

      <div className={styles.cashKpis}>
        <div className={styles.cashKpi}>
          <span>Chiffre d&apos;affaires</span>
          <strong>{euros(ca)}</strong>
          <em>{mJobs.length} prestation{mJobs.length > 1 ? 's' : ''}</em>
        </div>
        <div className={styles.cashKpi}>
          <span>Dépenses</span>
          <strong>{euros(spent)}</strong>
          <em>{mExp.length} ligne{mExp.length > 1 ? 's' : ''}</em>
        </div>
        <div className={`${styles.cashKpi} ${styles.cashKpiMain}`}>
          <span>Il vous reste</span>
          <strong>{euros(profit)}</strong>
          <em>{rate ? `après ${rate} % de cotisations (${euros(cotis)})` : 'CA − dépenses'}</em>
        </div>
        <div className={`${styles.cashKpi} ${pending + unpaidInvoices > 0 ? styles.cashKpiWarn : ''}`}>
          <span>À encaisser</span>
          <strong>{euros(pending + unpaidInvoices)}</strong>
          <em>prestations non payées + factures</em>
        </div>
      </div>

      <div className={styles.twoCols}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Encaissements</h2>
            <span className={styles.count}>{euros(ca)}</span>
          </div>
          {byMethod.length > 0 && (
            <p className={styles.hint}>{byMethod.map((p) => `${p.label} ${euros(p.total)}`).join(' · ')}</p>
          )}
          {mJobs.length === 0 ? (
            <p className={styles.empty}>Aucune prestation ce mois-ci. Dans le planning, touchez ✓ sur un RDV terminé.</p>
          ) : (
            <ul className={styles.cashList}>
              {mJobs.map((j) => (
                <li key={j.id}>
                  <button type="button" className={styles.cashMain} onClick={() => onOpenLead(j.lead_id)}>
                    <strong>{name(j.lead_id)}</strong>
                    <span>
                      {formatDate(j.done_at, { day: 'numeric', month: 'short' })} · {j.service}
                    </span>
                  </button>
                  <select
                    className={`${styles.cashSelect} ${j.payment_method === 'a_encaisser' ? styles.cashSelectWarn : ''}`}
                    value={j.payment_method || ''}
                    onChange={(e) => onUpdateJob(j, { payment_method: e.target.value || null })}
                    aria-label="Mode de paiement"
                  >
                    <option value="">Paiement ?</option>
                    {PAYMENT_METHODS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <b>{euros2(j.amount)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Dépenses</h2>
            <span className={styles.count}>{euros(spent)}</span>
          </div>
          {byCat.length > 0 && <p className={styles.hint}>{byCat.map(([c, t]) => `${EXPENSE_LABEL[c] || c} ${euros(t)}`).join(' · ')}</p>}
          {mExp.length === 0 ? (
            <p className={styles.empty}>Aucune dépense notée ce mois-ci (produits, carburant, matériel…).</p>
          ) : (
            <ul className={styles.cashList}>
              {mExp.map((e) => (
                <li key={e.id}>
                  <div className={styles.cashMain}>
                    <strong>{e.label}</strong>
                    <span>
                      {formatDate(e.spent_on, { day: 'numeric', month: 'short' })} · {EXPENSE_LABEL[e.category] || e.category}
                    </span>
                  </div>
                  <button type="button" className={styles.iconBtnSm} onClick={() => onDeleteExpense(e)} aria-label="Supprimer la dépense">
                    <Icon name="trash" size={15} />
                  </button>
                  <b>−{euros2(e.amount)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {fc && (
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Fin de mois</h2>
          </div>
          <div className={v2.forecast}>
            <div>
              <span>Encaissé</span>
              <strong>{euros(fc.done)}</strong>
            </div>
            <div>
              <span>+ RDV prévus</span>
              <strong>{euros(fc.planned)}</strong>
            </div>
            <div>
              <span>= Prévision</span>
              <strong>{euros(fc.total)}</strong>
            </div>
          </div>
          {goal > 0 && (
            <>
              <div className={styles.goal}>
                <span className={styles.goalBar} role="progressbar" aria-valuenow={Math.min(100, Math.round((fc.total / goal) * 100))} aria-valuemin={0} aria-valuemax={100} aria-label="Prévision par rapport à l'objectif">
                  <i style={{ width: `${Math.min(100, Math.round((fc.total / goal) * 100))}%` }} />
                </span>
                <span>
                  {fc.total >= goal
                    ? `Objectif de ${euros(goal)} atteint avec les RDV prévus 🎯`
                    : `Il manque ${euros(goal - fc.total)} pour l'objectif de ${euros(goal)}${globalPerHour ? ` (≈ ${Math.ceil((goal - fc.total) / Math.max(1, ca / Math.max(1, mJobs.length)))} prestation(s) de plus)` : ''}`}
                </span>
              </div>
            </>
          )}
          {!goal && <p className={styles.hint}>Fixez un objectif mensuel dans Réglages pour voir ce qu&apos;il manque.</p>}
        </section>
      )}

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Rentabilité par prestation</h2>
          {globalPerHour > 0 && <span className={styles.count}>{euros(globalPerHour)} / h en moyenne</span>}
        </div>
        {perService.length === 0 ? (
          <p className={styles.empty}>Apparaît dès la première prestation du mois.</p>
        ) : (
          <ul className={v2.rowsList}>
            {perService.map((r) => (
              <li key={r.key}>
                <div className={v2.rowMain}>
                  <strong>{r.key}</strong>
                  <span>
                    {r.n} × · {euros(r.ca)} · {Math.round(r.minutes / 6) / 10} h (trajets compris){r.cost ? ` · produits ≈ ${euros2(r.cost)}` : ''}
                  </span>
                </div>
                <strong className={r.perHour >= globalPerHour ? styles.up : styles.down}>{euros(r.perHour)} / h</strong>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.hint}>
          Calcul : (montant − coût des produits du stock) ÷ (temps sur place + {buffer} min de trajet). Kilomètres du mois : {base && located ? `≈ ${Math.round(km)} km sur ${byDay.size} jour(s) de tournée` : 'ouvrez la Tournée pour géolocaliser les adresses'}.
        </p>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Cotisations</h2>
        </div>
        <form
          className={styles.cashRate}
          onSubmit={(e) => {
            e.preventDefault()
            onSaveSettings({ business: { ...(settings?.business || {}), cotisations_pct: Number(rateInput) || null } })
          }}
        >
          <label className={styles.field}>
            Taux de cotisations sur le CA (%)
            <input type="number" min="0" max="60" step="0.1" inputMode="decimal" value={rateInput} onChange={(e) => setRateInput(e.target.value)} placeholder="Ex. le taux URSSAF de la micro-entreprise" />
          </label>
          <button type="submit" className={styles.btnSecondary}>
            Enregistrer
          </button>
        </form>
        <p className={styles.hint}>Vérifiez le taux exact sur autoentrepreneur.urssaf.fr : il sert seulement à estimer ce qu&apos;il vous reste.</p>
      </section>
    </div>
  )
}
