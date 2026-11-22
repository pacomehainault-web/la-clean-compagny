'use client'

import styles from '../admin.module.css'
import d2 from '../docs.module.css'
import { Icon } from './Icon'
import { AUDIT_AXES, AUDIT_ACTIONS, AUDIT_DATE, auditScore } from '../_lib/audit'
import { formatDate } from '../_lib/crm'

const P_LABEL = { 1: 'Priorité 1 — gros impact', 2: 'Priorité 2', 3: 'Priorité 3 — à moyen terme' }

// Onglet « Audit SEO / IA » : note GEO + SEO du site et plan d'action à cocher.
export default function Audit({ settings, onSaveSettings }) {
  const biz = settings?.business || {}
  const checked = biz.audit_done || {}
  const isDone = (a) => a.done || Boolean(checked[a.id])
  const done = AUDIT_ACTIONS.filter(isDone).length
  const before = auditScore('before')
  const after = auditScore('after')

  async function toggle(a) {
    if (a.done) return
    const next = { ...checked }
    if (next[a.id]) delete next[a.id]
    else next[a.id] = new Date().toISOString().slice(0, 10)
    await onSaveSettings({ business: { ...biz, audit_done: next } })
  }

  return (
    <div className={styles.stack}>
      <section className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Note GEO + SEO</span>
          <strong>{after}/100</strong>
          <em>
            {before}/100 avant les corrections · audit du {formatDate(AUDIT_DATE)}
          </em>
        </div>
        <div className={styles.kpi}>
          <span>Plan d’action</span>
          <strong>
            {done}/{AUDIT_ACTIONS.length}
          </strong>
          <em>actions faites</em>
        </div>
        <div className={styles.kpi}>
          <span>Point le plus faible</span>
          <strong>Fiche Google</strong>
          <em>avis, posts, annuaires</em>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Les 6 axes</h2>
        </div>
        <div className={d2.axes}>
          {AUDIT_AXES.map((a) => (
            <div key={a.id} className={d2.axis}>
              <div className={d2.axisHead}>
                <strong>{a.label}</strong>
                <span>
                  {a.after}/100{a.after !== a.before ? <em> (avant {a.before})</em> : null}
                </span>
              </div>
              <div className={d2.bar} aria-hidden="true">
                <i style={{ width: `${a.before}%` }} className={d2.barBefore} />
                <i style={{ width: `${a.after}%` }} className={a.after >= 75 ? d2.barGood : a.after >= 55 ? d2.barMid : d2.barLow} />
              </div>
              <p>{a.note}</p>
            </div>
          ))}
        </div>
      </section>

      {[1, 2, 3].map((p) => (
        <section className={styles.panel} key={p}>
          <div className={styles.panelHead}>
            <h2>{P_LABEL[p]}</h2>
          </div>
          <ul className={d2.actions}>
            {AUDIT_ACTIONS.filter((a) => a.p === p).map((a) => (
              <li key={a.id} className={isDone(a) ? d2.actionDone : ''}>
                <button type="button" className={d2.check} onClick={() => toggle(a)} aria-pressed={isDone(a)} aria-label={isDone(a) ? 'Fait' : 'Marquer comme fait'} disabled={a.done}>
                  {isDone(a) ? <Icon name="check" size={16} /> : null}
                </button>
                <div>
                  <strong>{a.title}</strong>
                  <p>{a.how}</p>
                  <em>
                    {a.done ? 'Fait le 22/11/2026' : checked[a.id] ? `Fait le ${formatDate(checked[a.id])}` : `À faire · ${a.who}`}
                  </em>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
