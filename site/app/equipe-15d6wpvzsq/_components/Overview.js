'use client'

import { useMemo } from 'react'
import styles from '../admin.module.css'
import LeadCard from './LeadCard'
import { Icon } from './Icon'
import {
  buildTodo,
  computeKpis,
  euros,
  euros2,
  formatDayLabel,
  formatTime,
  startOfDay,
  addDays,
  toDateInput,
  latestStat,
  isOverdue,
  sameDay,
  mapsHref,
  telHref,
  whatsappHref,
  templates,
} from '../_lib/crm'

const DAY_START = 8
const DAY_END = 19

// Durée estimée d'une intervention, pour dessiner la journée.
function durationH(lead) {
  const s = (lead.service || '').toLowerCase()
  if (/compl|concession|lustrage|polissage|céramique|ceramique/.test(s)) return 4
  if (/ext/.test(s)) return 1.5
  return 2.5
}

function hourOf(d) {
  const x = new Date(d)
  return x.getHours() + x.getMinutes() / 60
}

export default function Overview({ leads, jobs, docs = [], reviews = [], stats = [], views = [], settings, who, onOpen, updateLead, logActivity, goTo }) {
  const todo = useMemo(() => buildTodo(leads, jobs), [leads, jobs])
  const k = useMemo(() => computeKpis(leads, jobs), [leads, jobs])
  const now = new Date()
  const today = startOfDay(now)

  const booked = leads
    .filter((l) => l.appointment_at && l.status !== 'perdu')
    .sort((a, b) => (a.appointment_at > b.appointment_at ? 1 : -1))
  const todays = booked.filter((l) => sameDay(l.appointment_at, now))
  const next = booked.find((l) => new Date(l.appointment_at).getTime() + durationH(l) * 3600000 > now.getTime())
  const nowH = hourOf(now)

  const goal = Number(settings?.monthly_goal) || 0
  const goalPct = goal ? Math.min(100, Math.round((k.caMonth / goal) * 100)) : 0
  const caTrend = k.caPrev ? Math.round(((k.caMonth - k.caPrev) / k.caPrev) * 100) : null
  const since7 = toDateInput(addDays(today, -6).toISOString())
  const views7 = views.filter((v) => v.day >= since7).reduce((t, v) => t + v.views, 0)
  const gbpViews = latestStat(stats, 'gbp', 'vues_30j')
  const mainPos = latestStat(stats, 'gsc', 'pos:nettoyage voiture angers')
  const unreplied = reviews.filter((r) => !r.replied).length
  const unpaid = docs.filter((d) => d.kind === 'facture' && d.status === 'envoye')
  const unpaidTotal = unpaid.reduce((t, d) => t + Number(d.total), 0)
  const late = unpaid.filter((d) => isOverdue(d)).length

  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const summary = [
    todays.length ? `${todays.length} rendez-vous aujourd'hui` : "Pas de rendez-vous aujourd'hui",
    todo.length ? `${todo.length} chose${todo.length > 1 ? 's' : ''} à faire` : 'rien en attente',
  ].join(', ')

  const nextTpl = next ? templates(next).find((t) => t.id === (sameDay(next.appointment_at, addDays(now, 1)) ? 'veille' : 'confirmation')) : null
  const nextMaps = next ? mapsHref(next) : null

  const vis = [
    {
      label: 'Position sur « nettoyage voiture Angers »',
      value: mainPos ? mainPos.value.toFixed(1) : '—',
      note: mainPos ? 'objectif : top 4' : 'relevée chaque matin',
      onClick: () => goTo('stats', 'google'),
      icon: 'globe',
    },
    {
      label: 'Vues de la fiche Google',
      value: gbpViews ? gbpViews.value : '—',
      note: '30 derniers jours',
      onClick: () => goTo('stats', 'google'),
      icon: 'star',
    },
    { label: 'Pages vues sur le site', value: views7, note: '7 derniers jours', onClick: () => goTo('stats', 'site'), icon: 'chart' },
    {
      label: 'Avis Google sans réponse',
      value: unreplied,
      note: unreplied ? 'à traiter' : 'tout est répondu',
      warn: unreplied > 0,
      onClick: () => goTo('avis'),
      icon: 'message',
    },
    {
      label: 'Factures à encaisser',
      value: euros2(unpaidTotal),
      note: late ? `${late} en retard` : `${unpaid.length} en attente`,
      warn: late > 0,
      onClick: () => goTo('documents'),
      icon: 'file',
    },
  ]

  return (
    <div className={styles.home}>
      {/* La journée : le premier écran qu'on voit le matin */}
      <section className={styles.hero} aria-labelledby="hero-date">
        <div className={styles.heroHead}>
          <p className={styles.heroHello}>Bonjour{who ? ` ${who}` : ''}</p>
          <h2 id="hero-date" className={styles.heroDate}>
            {dateLabel}
          </h2>
          <p className={styles.heroSummary}>{summary}.</p>
        </div>

        <div className={styles.dayTrack} aria-label="Rendez-vous de la journée">
          <div className={styles.dayRail}>
            {Array.from({ length: (DAY_END - DAY_START) / 1 + 1 }, (_, i) => DAY_START + i).map((h) => (
              <span key={h} className={styles.dayTick} style={{ left: `${((h - DAY_START) / (DAY_END - DAY_START)) * 100}%` }}>
                {h % 2 === 0 ? `${h}h` : ''}
              </span>
            ))}
            {todays.map((l) => {
              const start = Math.max(DAY_START, hourOf(l.appointment_at))
              const end = Math.min(DAY_END, start + durationH(l))
              return (
                <button
                  type="button"
                  key={l.id}
                  className={`${styles.daySlot} ${end < nowH ? styles.daySlotDone : ''}`}
                  style={{
                    left: `${((start - DAY_START) / (DAY_END - DAY_START)) * 100}%`,
                    width: `${((end - start) / (DAY_END - DAY_START)) * 100}%`,
                  }}
                  onClick={() => onOpen(l.id)}
                >
                  <strong>{formatTime(l.appointment_at)}</strong>
                  <span>{l.first_name}</span>
                </button>
              )
            })}
            {todays.length === 0 && <span className={styles.dayEmpty}>Journée libre</span>}
            {nowH >= DAY_START && nowH <= DAY_END && (
              <span className={styles.dayNow} style={{ left: `${((nowH - DAY_START) / (DAY_END - DAY_START)) * 100}%` }} aria-hidden="true" />
            )}
          </div>
        </div>

        <div className={styles.heroNext}>
          {next ? (
            <>
              <button type="button" className={styles.heroNextMain} onClick={() => onOpen(next.id)}>
                <span>Prochain rendez-vous</span>
                <strong>
                  {next.first_name}, {sameDay(next.appointment_at, now) ? "aujourd'hui" : formatDayLabel(next.appointment_at).toLowerCase()} à{' '}
                  {formatTime(next.appointment_at)}
                </strong>
                <em>{[next.service, next.address || next.city].filter(Boolean).join(', ')}</em>
              </button>
              <div className={styles.heroActions}>
                {nextMaps && (
                  <a className={styles.heroBtn} href={nextMaps} target="_blank" rel="noopener noreferrer">
                    <Icon name="map" size={17} /> Itinéraire
                  </a>
                )}
                <a className={styles.heroBtn} href={telHref(next)} onClick={() => logActivity(next.id, 'appel', 'Appel lancé depuis l’accueil')}>
                  <Icon name="phone" size={17} /> Appeler
                </a>
                {nextTpl && (
                  <a
                    className={styles.heroBtnLight}
                    href={whatsappHref(next, nextTpl.text)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logActivity(next.id, 'whatsapp', `WhatsApp « ${nextTpl.label} »`)}
                  >
                    <Icon name="whatsapp" size={17} /> {nextTpl.label}
                  </a>
                )}
              </div>
            </>
          ) : (
            <div className={styles.heroNextMain}>
              <span>Prochain rendez-vous</span>
              <strong>Aucun rendez-vous prévu</strong>
              <button type="button" className={styles.heroLink} onClick={() => goTo('planning')}>
                Ouvrir le planning
              </button>
            </div>
          )}
        </div>
      </section>

      <div className={styles.homeGrid}>
        <section className={styles.block} aria-labelledby="todo-title">
          <header className={styles.blockHead}>
            <h2 id="todo-title">À faire</h2>
            {todo.length > 0 && <span className={styles.count}>{todo.length}</span>}
          </header>
          {todo.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="check" size={22} />
              <p>
                <strong>Tout est à jour.</strong> Les nouveaux prospects, relances et demandes d&apos;avis apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className={styles.rows}>
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

        <div className={styles.homeSide}>
          <section className={styles.block} aria-labelledby="month-title">
            <header className={styles.blockHead}>
              <h2 id="month-title">{now.toLocaleDateString('fr-FR', { month: 'long' }).replace(/^./, (c) => c.toUpperCase())}</h2>
              <button type="button" className={styles.linkBtn} onClick={() => goTo('stats')}>
                Statistiques
              </button>
            </header>
            <div className={styles.money}>
              <span>Chiffre d&apos;affaires</span>
              <strong>{euros(k.caMonth)}</strong>
              {caTrend !== null && (
                <em className={caTrend >= 0 ? styles.up : styles.down}>
                  {caTrend >= 0 ? '+' : ''}
                  {caTrend} % par rapport au mois dernier
                </em>
              )}
            </div>
            {goal > 0 && (
              <div className={styles.goal}>
                <span className={styles.goalBar} role="progressbar" aria-valuenow={goalPct} aria-valuemin={0} aria-valuemax={100} aria-label="Objectif du mois">
                  <i style={{ width: `${goalPct}%` }} />
                </span>
                <span>
                  {goalPct} % de l&apos;objectif de {euros(goal)}
                </span>
              </div>
            )}
            <dl className={styles.facts}>
              <div>
                <dt>Prestations</dt>
                <dd>{k.jobsMonth}</dd>
              </div>
              <div>
                <dt>Devis et réservés</dt>
                <dd>{euros(k.pipelineValue)}</dd>
              </div>
              <div>
                <dt>Nouveaux prospects (7 j)</dt>
                <dd>{k.newWeek}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.block} aria-labelledby="vis-title">
            <header className={styles.blockHead}>
              <h2 id="vis-title">Visibilité et suivi</h2>
            </header>
            <ul className={styles.metricList}>
              {vis.map((m) => (
                <li key={m.label}>
                  <button type="button" onClick={m.onClick} className={m.warn ? styles.metricWarn : ''}>
                    <Icon name={m.icon} size={17} />
                    <span>
                      {m.label}
                      <em>{m.note}</em>
                    </span>
                    <strong>{m.value}</strong>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.block} aria-labelledby="latest-title">
            <header className={styles.blockHead}>
              <h2 id="latest-title">Derniers prospects</h2>
              <button type="button" className={styles.linkBtn} onClick={() => goTo('prospects')}>
                Tout voir
              </button>
            </header>
            {leads.length === 0 ? (
              <p className={styles.emptySmall}>Les demandes du site arriveront ici.</p>
            ) : (
              <ul className={styles.miniList}>
                {leads.slice(0, 5).map((l) => (
                  <li key={l.id}>
                    <button type="button" onClick={() => onOpen(l.id)}>
                      <span className={styles.miniWhen}>{new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      <strong>{l.first_name}</strong>
                      <span>{l.service || l.city || 'Demande de rappel'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
