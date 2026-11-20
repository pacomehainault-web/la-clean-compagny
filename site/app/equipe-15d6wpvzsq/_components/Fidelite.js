'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { euros, formatDayLabel, loyalty, searchLeads, toDateInput, addDays, whatsappHref, templates, CLIENT_STATUSES } from '../_lib/crm'

// Fidélisation : formules d'entretien (revenu régulier), parrainages, carte fidélité.
export default function Fidelite({ leads, jobs, subs, settings, onOpen, onAddSub, onUpdateSub, onDeleteSub, onPlanRdv, logActivity }) {
  const biz = settings?.business || {}
  const every = Number(biz.loyalty_every) || 5
  const active = subs.filter((s) => s.active)
  const monthly = active.reduce((t, s) => t + (Number(s.price) * 30) / s.every_days, 0)
  const name = (id) => leads.find((l) => l.id === id)
  const [adding, setAdding] = useState(null)
  const [q, setQ] = useState('')

  // Parrainages : clients arrivés avec le code d'un autre client.
  const byCode = new Map(leads.filter((l) => l.referral_code).map((l) => [l.referral_code.toUpperCase(), l]))
  const referred = leads.filter((l) => l.ref_code && byCode.has(l.ref_code.toUpperCase()))
  const godparents = [...referred.reduce((m, l) => m.set(l.ref_code.toUpperCase(), [...(m.get(l.ref_code.toUpperCase()) || []), l]), new Map())]
    .map(([code, kids]) => ({ parrain: byCode.get(code), kids }))
    .sort((a, b) => b.kids.length - a.kids.length)

  // Clients fidèles : nombre de prestations.
  const counts = jobs.reduce((m, j) => m.set(j.lead_id, (m.get(j.lead_id) || 0) + 1), new Map())
  const fideles = [...counts]
    .map(([id, n]) => ({ lead: name(id), n, total: jobs.filter((j) => j.lead_id === id).reduce((t, j) => t + Number(j.amount || 0), 0) }))
    .filter((x) => x.lead)
    .sort((a, b) => b.n - a.n || b.total - a.total)
    .slice(0, 12)

  const matches = q.trim().length >= 2 ? searchLeads(leads.filter((l) => CLIENT_STATUSES.includes(l.status) || l.status === 'reserve'), q).slice(0, 5) : []

  return (
    <div className={styles.stack}>
      <div className={styles.cashKpis}>
        <div className={`${styles.cashKpi} ${styles.cashKpiMain}`}>
          <span>Revenu régulier (formules)</span>
          <strong>{euros(monthly)}</strong>
          <em>
            par mois · {active.length} formule{active.length > 1 ? 's' : ''} active{active.length > 1 ? 's' : ''}
          </em>
        </div>
        <div className={styles.cashKpi}>
          <span>Clients parrainés</span>
          <strong>{referred.length}</strong>
          <em>{godparents.length} parrain{godparents.length > 1 ? 's' : ''}</em>
        </div>
        <div className={styles.cashKpi}>
          <span>Clients revenus 2 fois ou plus</span>
          <strong>{[...counts.values()].filter((n) => n >= 2).length}</strong>
          <em>sur {counts.size} client{counts.size > 1 ? 's' : ''}</em>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Formules d&apos;entretien</h2>
          <button type="button" className={styles.btnSecondary} onClick={() => setAdding({ lead: null, label: 'Entretien mensuel', price: '', every: 30 })}>
            <Icon name="plus" size={16} /> Nouvelle
          </button>
        </div>
        {adding && (
          <form
            className={styles.inlineBox}
            onSubmit={async (e) => {
              e.preventDefault()
              if (!adding.lead) return
              const ok = await onAddSub({
                lead_id: adding.lead.id,
                label: adding.label.trim() || 'Entretien',
                price: Number(adding.price) || 0,
                every_days: Number(adding.every) || 30,
                next_on: toDateInput(addDays(new Date(), Number(adding.every) || 30).toISOString()),
              })
              if (ok) setAdding(null)
            }}
          >
            {adding.lead ? (
              <div className={styles.pickedClient}>
                <span className={styles.avatar}>{adding.lead.first_name.slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{adding.lead.first_name}</strong>
                  <span>{adding.lead.vehicle || adding.lead.city || ''}</span>
                </div>
                <button type="button" className={styles.linkBtn} onClick={() => setAdding({ ...adding, lead: null })}>
                  Changer
                </button>
              </div>
            ) : (
              <>
                <div className={styles.search}>
                  <Icon name="search" size={17} />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Client : nom, téléphone…" autoFocus />
                </div>
                {matches.length > 0 && (
                  <ul className={styles.matchList}>
                    {matches.map((l) => (
                      <li key={l.id}>
                        <button type="button" onClick={() => (setAdding({ ...adding, lead: l, label: `Entretien ${l.vehicle || ''}`.trim() }), setQ(''))}>
                          <strong>{l.first_name}</strong>
                          <span>{[l.vehicle, l.city].filter(Boolean).join(' · ')}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            <div className={styles.grid2}>
              <label className={styles.field}>
                Nom de la formule
                <input value={adding.label} onChange={(e) => setAdding({ ...adding, label: e.target.value })} />
              </label>
              <label className={styles.field}>
                Prix par passage (€)
                <input type="number" min="0" inputMode="decimal" value={adding.price} onChange={(e) => setAdding({ ...adding, price: e.target.value })} />
              </label>
            </div>
            <div className={styles.chipsWrap}>
              {[
                [14, 'Toutes les 2 sem.'],
                [30, 'Tous les mois'],
                [60, 'Tous les 2 mois'],
                [90, 'Tous les 3 mois'],
              ].map(([d, l]) => (
                <button type="button" key={d} className={`${styles.chip} ${Number(adding.every) === d ? styles.chipOn : ''}`} onClick={() => setAdding({ ...adding, every: d })}>
                  {l}
                </button>
              ))}
            </div>
            <div className={styles.rowBtns}>
              <button type="button" className={styles.btnSecondary} onClick={() => setAdding(null)}>
                Annuler
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={!adding.lead}>
                Créer
              </button>
            </div>
          </form>
        )}
        {subs.length === 0 ? (
          <p className={styles.empty}>
            Proposez une formule (ex. lavage tous les mois à prix réduit) après une prestation réussie : c&apos;est du chiffre d&apos;affaires garanti chaque mois.
          </p>
        ) : (
          <ul className={v2.rowsList}>
            {subs.map((s) => {
              const l = name(s.lead_id)
              const late = s.next_on && new Date(s.next_on + 'T12:00:00') < new Date()
              return (
                <li key={s.id} className={!s.active ? v2.muted : ''}>
                  <button type="button" className={v2.rowMain} onClick={() => l && onOpen(l.id)}>
                    <strong>{l?.first_name || 'Client supprimé'}</strong>
                    <span>
                      {s.label} · {euros(s.price)} tous les {s.every_days} j
                    </span>
                    {s.active && s.next_on && <em className={late ? styles.textDanger : ''}>Prochain passage : {formatDayLabel(s.next_on + 'T12:00:00').toLowerCase()}</em>}
                  </button>
                  <div className={v2.rowActs}>
                    {s.active && l && (
                      <button type="button" className={styles.btnSecondary} onClick={() => onPlanRdv(l)}>
                        Planifier
                      </button>
                    )}
                    <button type="button" className={styles.linkBtn} onClick={() => onUpdateSub(s, { active: !s.active })}>
                      {s.active ? 'Mettre en pause' : 'Réactiver'}
                    </button>
                    <button type="button" className={styles.iconBtnSm} onClick={() => window.confirm('Supprimer cette formule ?') && onDeleteSub(s)} aria-label="Supprimer">
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className={styles.twoCols}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Parrainages</h2>
            <span className={styles.count}>{referred.length}</span>
          </div>
          <p className={styles.hint}>
            Chaque client a un code (visible sur sa fiche et sa page de suivi). Récompense affichée : « {biz.referral_reward || '—'} ».
          </p>
          {godparents.length === 0 ? (
            <p className={styles.empty}>Aucun parrainage pour l&apos;instant. Envoyez son code à chaque client satisfait (bouton dans « Terminé »).</p>
          ) : (
            <ul className={v2.rowsList}>
              {godparents.map(({ parrain, kids }) => (
                <li key={parrain.id}>
                  <button type="button" className={v2.rowMain} onClick={() => onOpen(parrain.id)}>
                    <strong>
                      {parrain.first_name} <span className={styles.count}>{kids.length}</span>
                    </strong>
                    <span>a parrainé {kids.map((k) => k.first_name).join(', ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Clients fidèles</h2>
            <span className={styles.hint}>remise tous les {every} passages</span>
          </div>
          {fideles.length === 0 ? (
            <p className={styles.empty}>Les clients apparaîtront ici après leurs prestations.</p>
          ) : (
            <ul className={v2.rowsList}>
              {fideles.map(({ lead, n, total }) => {
                const loy = loyalty(n, every)
                const tpl = templates(lead).find((t) => t.id === 'entretien')
                return (
                  <li key={lead.id}>
                    <button type="button" className={v2.rowMain} onClick={() => onOpen(lead.id)}>
                      <strong>{lead.first_name}</strong>
                      <span>
                        {n} prestation{n > 1 ? 's' : ''} · {euros(total)}
                      </span>
                      <em>{loy.rewardNow ? '🎁 Prochaine prestation remisée' : `encore ${loy.left} avant la remise`}</em>
                    </button>
                    <div className={v2.rowActs}>
                      <a className={styles.iconBtnSm2} href={whatsappHref(lead, tpl.text)} target="_blank" rel="noopener noreferrer" onClick={() => logActivity(lead.id, 'whatsapp', 'Relance entretien')} aria-label="Relancer sur WhatsApp">
                        <Icon name="whatsapp" size={15} />
                      </a>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
