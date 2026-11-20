'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { euros2 } from '../_lib/crm'

const APPLIES = [
  { id: 'tout', label: 'Toutes les prestations' },
  { id: 'interieur', label: 'Intérieur' },
  { id: 'exterieur', label: 'Extérieur' },
  { id: 'lustrage', label: 'Lustrage / céramique' },
]
const APPLIES_LABEL = Object.fromEntries(APPLIES.map((a) => [a.id, a.label]))

export function lowStock(products) {
  return products.filter((p) => Number(p.alert_at) > 0 && Number(p.stock) <= Number(p.alert_at))
}

// Stock de produits : décompté automatiquement à chaque prestation terminée.
export default function Stock({ products, onAdd, onUpdate, onDelete, onTask }) {
  const [form, setForm] = useState(null)
  const low = lowStock(products)
  const value = products.reduce((t, p) => t + (Number(p.price) || 0) * Math.max(0, Number(p.stock) || 0), 0)

  async function submit(e) {
    e.preventDefault()
    const row = {
      name: form.name.trim(),
      unit: form.unit.trim() || 'L',
      stock: Number(form.stock) || 0,
      per_job: Number(form.per_job) || 0,
      applies_to: form.applies_to,
      alert_at: Number(form.alert_at) || 0,
      price: form.price === '' ? null : Number(form.price),
    }
    const ok = form.id ? await onUpdate(form, row) : await onAdd(row)
    if (ok !== false) setForm(null)
  }

  return (
    <div className={styles.stack}>
      <div className={styles.cashKpis}>
        <div className={`${styles.cashKpi} ${low.length ? styles.cashKpiWarn : styles.cashKpiMain}`}>
          <span>À racheter</span>
          <strong>{low.length}</strong>
          <em>{low.length ? low.map((p) => p.name).join(', ') : 'tout est OK'}</em>
        </div>
        <div className={styles.cashKpi}>
          <span>Produits suivis</span>
          <strong>{products.length}</strong>
          <em>décomptés à chaque « Terminé »</em>
        </div>
        <div className={styles.cashKpi}>
          <span>Valeur du stock</span>
          <strong>{euros2(value)}</strong>
          <em>selon les prix saisis</em>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Produits</h2>
          <div className={styles.rowBtns}>
            {low.length > 0 && (
              <button type="button" className={styles.btnSecondary} onClick={() => onTask(`Racheter : ${low.map((p) => p.name).join(', ')}`)}>
                <Icon name="check" size={16} /> Tâche « racheter »
              </button>
            )}
            <button type="button" className={styles.btnPrimary} onClick={() => setForm({ name: '', unit: 'L', stock: '', per_job: '', applies_to: 'tout', alert_at: '', price: '' })}>
              <Icon name="plus" size={16} /> Produit
            </button>
          </div>
        </div>

        {form && (
          <form className={styles.inlineBox} onSubmit={submit}>
            <div className={styles.grid2}>
              <label className={styles.field}>
                Produit
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex. Koch Chemie Green Star" autoFocus />
              </label>
              <label className={styles.field}>
                Unité
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="L, flacon, microfibre…" />
              </label>
              <label className={styles.field}>
                En stock
                <input type="number" step="0.01" inputMode="decimal" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </label>
              <label className={styles.field}>
                Consommé par prestation
                <input type="number" step="0.01" min="0" inputMode="decimal" value={form.per_job} onChange={(e) => setForm({ ...form, per_job: e.target.value })} placeholder="Ex. 0.2" />
              </label>
              <label className={styles.field}>
                Alerte quand il reste
                <input type="number" step="0.01" min="0" inputMode="decimal" value={form.alert_at} onChange={(e) => setForm({ ...form, alert_at: e.target.value })} />
              </label>
              <label className={styles.field}>
                Prix d&apos;achat par unité (€)
                <input type="number" step="0.01" min="0" inputMode="decimal" value={form.price ?? ''} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </label>
            </div>
            <div className={styles.chipsWrap}>
              {APPLIES.map((a) => (
                <button type="button" key={a.id} className={`${styles.chip} ${form.applies_to === a.id ? styles.chipOn : ''}`} onClick={() => setForm({ ...form, applies_to: a.id })}>
                  {a.label}
                </button>
              ))}
            </div>
            <div className={styles.rowBtns}>
              <button type="button" className={styles.btnSecondary} onClick={() => setForm(null)}>
                Annuler
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Enregistrer
              </button>
            </div>
          </form>
        )}

        {products.length === 0 ? (
          <p className={styles.empty}>Ajoutez vos produits (shampoing, APC, dressing, microfibres…) avec leur consommation par prestation : le stock baisse tout seul et une alerte s&apos;affiche avant la rupture.</p>
        ) : (
          <ul className={v2.rowsList}>
            {products
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => {
                const isLow = Number(p.alert_at) > 0 && Number(p.stock) <= Number(p.alert_at)
                const jobsLeft = Number(p.per_job) > 0 ? Math.floor(Math.max(0, Number(p.stock)) / Number(p.per_job)) : null
                return (
                  <li key={p.id} className={isLow ? v2.rowWarn : ''}>
                    <button type="button" className={v2.rowMain} onClick={() => setForm({ ...p, price: p.price ?? '' })}>
                      <strong>{p.name}</strong>
                      <span>
                        {APPLIES_LABEL[p.applies_to]}
                        {Number(p.per_job) ? ` · ${p.per_job} ${p.unit} / prestation` : ''}
                      </span>
                      {jobsLeft != null && <em className={isLow ? styles.textDanger : ''}>≈ {jobsLeft} prestation{jobsLeft > 1 ? 's' : ''} restante{jobsLeft > 1 ? 's' : ''}</em>}
                    </button>
                    <div className={v2.stepper}>
                      <button type="button" onClick={() => onUpdate(p, { stock: Math.round((Number(p.stock) - 1) * 100) / 100 })} aria-label={`Retirer 1 ${p.unit}`}>
                        −
                      </button>
                      <strong>
                        {Math.round(Number(p.stock) * 100) / 100} <small>{p.unit}</small>
                      </strong>
                      <button type="button" onClick={() => onUpdate(p, { stock: Math.round((Number(p.stock) + 1) * 100) / 100 })} aria-label={`Ajouter 1 ${p.unit}`}>
                        +
                      </button>
                    </div>
                    <button type="button" className={styles.iconBtnSm} onClick={() => window.confirm(`Supprimer « ${p.name} » ?`) && onDelete(p)} aria-label="Supprimer">
                      <Icon name="trash" size={15} />
                    </button>
                  </li>
                )
              })}
          </ul>
        )}
      </section>
    </div>
  )
}
