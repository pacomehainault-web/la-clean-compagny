'use client'

import { useMemo } from 'react'
import styles from '../admin.module.css'
import LeadCard from './LeadCard'
import { buildTodo, computeKpis, euros, formatDayLabel, formatTime, startOfDay } from '../_lib/crm'

export default function Overview({ leads, jobs, onOpen, updateLead, logActivity, goTo }) {
  const todo = useMemo(() => buildTodo(leads, jobs), [leads, jobs])
  const k = useMemo(() => computeKpis(leads, jobs), [leads, jobs])
  const upcoming = leads
    .filter((l) => l.status === 'reserve' && l.appointment_at && new Date(l.appointment_at) >= startOfDay())
    .sort((a, b) => (a.appointment_at > b.appointment_at ? 1 : -1))
    .slice(0, 5)

  const caTrend = k.caPrev ? Math.round(((k.caMonth - k.caPrev) / k.caPrev) * 100) : null

  return (
    <div className={styles.stack}>
      <section className={styles.kpis}>
        <button type="button" className={`${styles.kpi} ${k.toCall ? styles.kpiAlert : ''}`} onClick={() => goTo('prospects')}>
          <span>À rappeler</span>
          <strong>{k.toCall}</strong>
          <em>{k.newWeek} nouveaux en 7 jours</em>
        </button>
        <button type="button" className={styles.kpi} onClick={() => goTo('agenda')}>
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
            <button type="button" className={styles.linkBtn} onClick={() => goTo('agenda')}>
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
