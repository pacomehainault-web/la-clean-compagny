'use client'

import { useMemo } from 'react'
import styles from '../admin.module.css'
import LeadCard from './LeadCard'
import { buildTodo, computeKpis, euros, euros2, formatDayLabel, formatTime, startOfDay, addDays, toDateInput, latestStat, isOverdue } from '../_lib/crm'
import { Icon } from './Icon'

export default function Overview({ leads, jobs, docs = [], reviews = [], stats = [], views = [], settings, onOpen, updateLead, logActivity, goTo }) {
  const todo = useMemo(() => buildTodo(leads, jobs), [leads, jobs])
  const k = useMemo(() => computeKpis(leads, jobs), [leads, jobs])
  const upcoming = leads
    .filter((l) => l.status === 'reserve' && l.appointment_at && new Date(l.appointment_at) >= startOfDay())
    .sort((a, b) => (a.appointment_at > b.appointment_at ? 1 : -1))
    .slice(0, 5)

  const caTrend = k.caPrev ? Math.round(((k.caMonth - k.caPrev) / k.caPrev) * 100) : null
  const goal = Number(settings?.monthly_goal) || 0
  const goalPct = goal ? Math.min(100, Math.round((k.caMonth / goal) * 100)) : 0
  const since7 = toDateInput(addDays(startOfDay(), -6).toISOString())
  const views7 = views.filter((v) => v.day >= since7).reduce((t, v) => t + v.views, 0)
  const gbpViews = latestStat(stats, 'gbp', 'vues_30j')
  const mainPos = latestStat(stats, 'gsc', 'pos:nettoyage voiture angers')
  const unreplied = reviews.filter((r) => !r.replied).length
  const unpaid = docs.filter((d) => d.kind === 'facture' && d.status === 'envoye')
  const late = unpaid.filter((d) => isOverdue(d)).length

  return (
    <div className={styles.stack}>
      <section className={styles.kpis}>
        <button type="button" className={`${styles.kpi} ${k.toCall ? styles.kpiAlert : ''}`} onClick={() => goTo('prospects')}>
          <span>À rappeler</span>
          <strong>{k.toCall}</strong>
          <em>{k.newWeek} nouveaux en 7 jours</em>
        </button>
        <button type="button" className={styles.kpi} onClick={() => goTo('planning')}>
          <span>RDV à venir</span>
          <strong>{k.upcoming}</strong>
          <em>{k.pipelineValue ? `${euros(k.pipelineValue)} en devis / réservés` : 'Aucun devis en cours'}</em>
        </button>
        <button type="button" className={styles.kpi} onClick={() => goTo('stats')}>
          <span>CA du mois</span>
          <strong>{euros(k.caMonth)}</strong>
          <em>
            {k.jobsMonth} presta{k.jobsMonth > 1 ? 's' : ''}
            {caTrend !== null ? ` · ${caTrend >= 0 ? '+' : ''}${caTrend} % vs mois dernier` : ''}
          </em>
        </button>
        <button type="button" className={styles.kpi} onClick={() => goTo('clients')}>
          <span>Avis</span>
          <strong>{k.reviewsReceived}</strong>
          <em>reçus · {k.reviewsAsked} en attente</em>
        </button>
      </section>

      {goal > 0 && (
        <section className={styles.goal}>
          <div>
            <strong>Objectif du mois : {euros(goal)}</strong>
            <span>
              {euros(k.caMonth)} faits · {goalPct} %
            </span>
          </div>
          <span className={styles.goalBar}>
            <i style={{ width: `${goalPct}%` }} />
          </span>
        </section>
      )}

      <section className={styles.tiles}>
        <button type="button" className={styles.tile} onClick={() => goTo('stats', 'google')}>
          <Icon name="globe" size={18} />
          <span>Position « nettoyage voiture Angers »</span>
          <strong>{mainPos ? mainPos.value.toFixed(1) : '—'}</strong>
          <em>{gbpViews ? `${gbpViews.value} vues de la fiche (30 j)` : 'relevé chaque matin'}</em>
        </button>
        <button type="button" className={styles.tile} onClick={() => goTo('stats', 'site')}>
          <Icon name="chart" size={18} />
          <span>Visites du site</span>
          <strong>{views7}</strong>
          <em>pages vues sur 7 jours</em>
        </button>
        <button type="button" className={`${styles.tile} ${unreplied ? styles.tileWarn : ''}`} onClick={() => goTo('avis')}>
          <Icon name="star" size={18} />
          <span>Avis Google sans réponse</span>
          <strong>{unreplied}</strong>
          <em>{k.reviewsAsked} demande{k.reviewsAsked > 1 ? 's' : ''} en attente</em>
        </button>
        <button type="button" className={`${styles.tile} ${late ? styles.tileWarn : ''}`} onClick={() => goTo('documents')}>
          <Icon name="file" size={18} />
          <span>Factures à encaisser</span>
          <strong>{euros2(unpaid.reduce((t, d) => t + Number(d.total), 0))}</strong>
          <em>{late ? `${late} en retard` : `${unpaid.length} en attente`}</em>
        </button>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>À faire aujourd&apos;hui</h2>
          <span className={styles.count}>{todo.length}</span>
        </div>
        {todo.length === 0 ? (
          <p className={styles.empty}>Rien d&apos;urgent. Tout est à jour 👌</p>
        ) : (
          <div className={styles.cardList}>
            {todo.map((t) => (
              <LeadCard
                key={`${t.lead.id}-${t.kind}`}
                lead={t.lead}
                reason={t.reason}
                tone={t.tone}
                templateId={t.template}
                onOpen={onOpen}
                updateLead={updateLead}
                logActivity={logActivity}
              />
            ))}
          </div>
        )}
      </section>

      <div className={styles.twoCols}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Prochains rendez-vous</h2>
            <button type="button" className={styles.linkBtn} onClick={() => goTo('planning')}>
              Tout voir
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className={styles.empty}>Aucun rendez-vous programmé.</p>
          ) : (
            <ul className={styles.miniList}>
              {upcoming.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => onOpen(l.id)}>
                    <span className={styles.miniWhen}>
                      {formatDayLabel(l.appointment_at)} · {formatTime(l.appointment_at)}
                    </span>
                    <strong>{l.first_name}</strong>
                    <span>{[l.service, l.city].filter(Boolean).join(' · ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Derniers prospects</h2>
            <button type="button" className={styles.linkBtn} onClick={() => goTo('prospects')}>
              Tout voir
            </button>
          </div>
          {leads.length === 0 ? (
            <p className={styles.empty}>Aucun prospect pour l&apos;instant.</p>
          ) : (
            <ul className={styles.miniList}>
              {leads.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => onOpen(l.id)}>
                    <span className={styles.miniWhen}>{new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    <strong>{l.first_name}</strong>
                    <span>{[l.service, l.city].filter(Boolean).join(' · ') || 'Demande de rappel'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
