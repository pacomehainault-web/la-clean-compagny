'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { latestStat, toDateInput, daysBetween } from '../_lib/crm'

const RIVAL = 'FreshInside'

export function duelSummary(stats) {
  const g = (m) => latestStat(stats, 'duel', m)
  const lc = g('lc_avis')
  const fi = g('fi_avis')
  return { lc, fi, lcNote: g('lc_note'), fiNote: g('fi_note'), lcRank: g('lc_rang'), fiRank: g('fi_rang'), gap: lc && fi ? fi.value - lc.value : null }
}

// Duel avec le concurrent n°1 sur « nettoyage voiture Angers ».
export default function Duel({ stats, onSave }) {
  const d = duelSummary(stats)
  const [form, setForm] = useState(null)
  const history = stats
    .filter((s) => s.source === 'duel' && (s.metric === 'lc_avis' || s.metric === 'fi_avis'))
    .sort((a, b) => (a.day > b.day ? 1 : -1))
  const days = [...new Set(history.map((h) => h.day))].slice(-8)
  const max = Math.max(1, ...history.map((h) => Number(h.value)))

  // Rythme : avis gagnés par La Clean depuis le premier relevé.
  const first = history.find((h) => h.metric === 'lc_avis')
  const pace = d.lc && first && d.lc.day !== first.day ? (d.lc.value - Number(first.value)) / Math.max(1, daysBetween(first.day, d.lc.day) / 7) : null

  async function submit(e) {
    e.preventDefault()
    const day = toDateInput(new Date().toISOString())
    const rows = Object.entries(form)
      .filter(([, v]) => v !== '' && v != null)
      .map(([metric, v]) => ({ day, source: 'duel', metric, value: Number(String(v).replace(',', '.')) }))
    if (rows.length && (await onSave(rows))) setForm(null)
  }

  return (
    <section className={`${styles.panel} ${v2.duel}`}>
      <div className={styles.panelHead}>
        <h2>
          <Icon name="trophy" size={18} /> Duel vs {RIVAL}
        </h2>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() =>
            setForm({
              lc_avis: d.lc?.value ?? '',
              lc_note: d.lcNote?.value ?? '',
              lc_rang: d.lcRank?.value ?? '',
              fi_avis: d.fi?.value ?? '',
              fi_note: d.fiNote?.value ?? '',
              fi_rang: d.fiRank?.value ?? '',
            })
          }
        >
          Mettre à jour
        </button>
      </div>

      <div className={v2.duelGrid}>
        <div className={v2.duelSide}>
          <span>La Clean Compagny</span>
          <strong>{d.lc ? d.lc.value : '—'}</strong>
          <em>avis{d.lcNote ? ` · ${d.lcNote.value.toFixed(1)} ★` : ''}</em>
          {d.lcRank && <b>#{d.lcRank.value} sur Maps</b>}
        </div>
        <div className={v2.duelVs}>VS</div>
        <div className={`${v2.duelSide} ${v2.duelRival}`}>
          <span>{RIVAL}</span>
          <strong>{d.fi ? d.fi.value : '—'}</strong>
          <em>avis{d.fiNote ? ` · ${d.fiNote.value.toFixed(1)} ★` : ''}</em>
          {d.fiRank && <b>#{d.fiRank.value} sur Maps</b>}
        </div>
      </div>

      {d.gap != null && (
        <p className={d.gap <= 0 ? styles.okText : v2.duelGap}>
          {d.gap <= 0
            ? `Vous avez dépassé ${RIVAL} en nombre d'avis 🏆`
            : `Il manque ${d.gap} avis pour égaler ${RIVAL}${pace && pace > 0 ? ` · à votre rythme (${pace.toFixed(1)} avis/sem.), ~${Math.ceil(d.gap / pace)} semaines` : ''}. Chaque « Terminé » = une demande d'avis.`}
        </p>
      )}
      {!d.lc && !form && <p className={styles.hint}>Relevez une fois par semaine le nombre d&apos;avis et la position Google Maps des deux fiches (recherche « nettoyage voiture Angers ») pour suivre la remontée vers le top 4.</p>}

      {days.length > 1 && (
        <div className={v2.duelChart} aria-label="Évolution du nombre d'avis">
          {days.map((day) => {
            const lc = history.find((h) => h.day === day && h.metric === 'lc_avis')
            const fi = history.find((h) => h.day === day && h.metric === 'fi_avis')
            return (
              <div key={day} className={v2.duelCol}>
                <div>
                  <i className={v2.barLc} style={{ height: `${lc ? (Number(lc.value) / max) * 100 : 0}%` }} title={`La Clean : ${lc?.value ?? '—'}`} />
                  <i className={v2.barFi} style={{ height: `${fi ? (Number(fi.value) / max) * 100 : 0}%` }} title={`${RIVAL} : ${fi?.value ?? '—'}`} />
                </div>
                <span>{new Date(`${day}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
            )
          })}
        </div>
      )}

      {form && (
        <form className={styles.inlineBox} onSubmit={submit}>
          <div className={v2.duelForm}>
            <strong>La Clean</strong>
            <strong>{RIVAL}</strong>
            {[
              ['avis', "Nombre d'avis", 'numeric'],
              ['note', 'Note (ex. 4,9)', 'decimal'],
              ['rang', 'Position Maps', 'numeric'],
            ].map(([k, label, mode]) => (
              <div key={k} className={v2.duelPair}>
                <label className={styles.field}>
                  {label}
                  <input inputMode={mode} value={form[`lc_${k}`]} onChange={(e) => setForm({ ...form, [`lc_${k}`]: e.target.value })} />
                </label>
                <label className={styles.field}>
                  {label}
                  <input inputMode={mode} value={form[`fi_${k}`]} onChange={(e) => setForm({ ...form, [`fi_${k}`]: e.target.value })} />
                </label>
              </div>
            ))}
          </div>
          <div className={styles.rowBtns}>
            <a className={styles.linkBtn} href="https://www.google.com/maps/search/nettoyage+voiture+angers" target="_blank" rel="noopener noreferrer">
              Ouvrir la recherche Google Maps
            </a>
            <button type="button" className={styles.btnSecondary} onClick={() => setForm(null)}>
              Annuler
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Enregistrer
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
