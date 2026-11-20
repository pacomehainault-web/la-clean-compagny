'use client'

import { useMemo } from 'react'
import styles from '../admin.module.css'
import LeadCard from './LeadCard'
import { Icon } from './Icon'
import { TaskRow } from './Tasks'
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
  durationH,
  taskGroup,
  isOutdoor,
  monthForecast,
} from '../_lib/crm'
import v2 from '../v2.module.css'
import { dayWeather, slotRain, weatherEmoji } from '../_lib/geo'
import { lowStock } from './Stock'
import { duelSummary } from './Duel'

const DAY_START = 8
const DAY_END = 19

function hourOf(d) {
  const x = new Date(d)
  return x.getHours() + x.getMinutes() / 60
}

export default function Overview({ leads, jobs, cars = [], docs = [], reviews = [], stats = [], views = [], tasks = [], subs = [], products = [], fc, settings, who, onOpen, updateLead, logActivity, goTo, onAdd, onComplete, onToggleTask, onGo, onVisit, onReview }) {
  const todo = useMemo(() => buildTodo(leads, jobs, new Date(), subs), [leads, jobs, subs])
  // Les voitures des garages partenaires comptent dans le chiffre d'affaires (facture groupée).
  const k = useMemo(() => {
    const base = computeKpis(leads, jobs.filter((j) => !j.partner))
    const n = new Date()
    const ym = (d) => d.slice(0, 7)
    const cur = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
    const p = new Date(n.getFullYear(), n.getMonth() - 1, 1)
    const prev = `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, '0')}`
    const sum = (m) => cars.filter((c) => ym(c.done_on) === m).reduce((t, c) => t + Number(c.price || 0), 0)
    return { ...base, caMonth: base.caMonth + sum(cur), caPrev: base.caPrev + sum(prev) }
  }, [leads, jobs, cars])
  const now = new Date()
  const today = startOfDay(now)

  const booked = leads
    .filter((l) => l.appointment_at && l.status !== 'perdu')
    .sort((a, b) => (a.appointment_at > b.appointment_at ? 1 : -1))
  const todays = booked.filter((l) => sameDay(l.appointment_at, now))
  const next = booked.find((l) => new Date(l.appointment_at).getTime() + durationH(l) * 3600000 > now.getTime())
  const nowH = hourOf(now)
  const myTasks = tasks.filter((t) => ['late', 'today'].includes(taskGroup(t, now)))
  // RDV d'aujourd'hui commencé ou passé et pas encore marqué « fait »
  const toClose = todays.filter((l) => l.status === 'reserve' && new Date(l.appointment_at) <= now)

  const goal = Number(settings?.monthly_goal) || 0
  const forecast = monthForecast(leads, jobs, now)
  const wToday = dayWeather(fc, now)
  const rainy = booked.filter((l) => l.status === 'reserve' && new Date(l.appointment_at) >= now && new Date(l.appointment_at) < addDays(today, 3) && isOutdoor(l.service)).map((l) => ({ l, r: slotRain(fc, l.appointment_at, durationH(l) * 60) })).filter((x) => x.r && x.r.prob >= 50)
  const tomorrows = booked.filter((l) => l.status === 'reserve' && sameDay(l.appointment_at, addDays(now, 1)))
  const low = lowStock(products)
  const duel = duelSummary(stats)
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
    todo.length + myTasks.length ? `${todo.length + myTasks.length} chose${todo.length + myTasks.length > 1 ? 's' : ''} à faire` : 'rien en attente',
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
                {next.status === 'reserve' && new Date(next.appointment_at) <= now && (
                  <button type="button" className={styles.heroBtnLight} onClick={() => onComplete(next)}>
                    <Icon name="check" size={17} /> Terminé
                  </button>
                )}
                {onGo && sameDay(next.appointment_at, now) && next.status === 'reserve' && next.track_stage !== 'sur_place' && (
                  <button type="button" className={styles.heroBtnLight} onClick={() => onGo(next)}>
                    <Icon name="car" size={17} /> {next.track_stage === 'en_route' ? 'Je suis arrivé' : 'Je pars'}
                  </button>
                )}
                {onVisit && sameDay(next.appointment_at, now) && (
                  <button type="button" className={styles.heroBtn} onClick={() => onVisit(next)}>
                    <Icon name="camera" size={17} /> Intervention
                  </button>
                )}
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
              <button type="button" className={styles.heroLink} onClick={() => onAdd()}>
                + Ajouter un RDV
              </button>
            </div>
          )}
        </div>
      </section>

      <div className={styles.quickBar}>
        <button type="button" onClick={() => onAdd()}>
          <Icon name="calendar" size={18} /> RDV
        </button>
        <button type="button" onClick={() => onAdd({ mode: 'tache' })}>
          <Icon name="check" size={18} /> Tâche
        </button>
        <button type="button" onClick={() => onAdd({ mode: 'depense' })}>
          <Icon name="euro" size={18} /> Dépense
        </button>
        <button type="button" onClick={() => goTo('caisse')}>
          <Icon name="chart" size={18} /> Caisse
        </button>
      </div>

      <div className={styles.homeGrid}>
        <div className={styles.homeMain}>
        <section className={`${styles.block} ${v2.brief}`} aria-labelledby="brief-title">
          <header className={styles.blockHead}>
            <h2 id="brief-title">Le brief</h2>
            {wToday && (
              <span className={v2.briefWeather}>
                {weatherEmoji(wToday.code)} {wToday.tmax}° · pluie {wToday.prob ?? 0} %
              </span>
            )}
          </header>
          <ul className={v2.briefList}>
            <li>
              <Icon name="route" size={17} />
              <span>
                {todays.length ? `${todays.length} client${todays.length > 1 ? 's' : ''} aujourd'hui` : "Pas de tournée aujourd'hui"}
                {todays.length ? ` · ${Math.round(todays.reduce((t, l) => t + durationH(l), 0) * 10) / 10} h sur place` : ''}
              </span>
              {todays.length > 0 && (
                <button type="button" className={styles.linkBtn} onClick={() => goTo('planning', 'tournee')}>
                  Tournée
                </button>
              )}
            </li>
            {rainy.map(({ l, r }) => (
              <li key={l.id} className={v2.briefWarn}>
                <Icon name="cloud" size={17} />
                <span>
                  Pluie {r.prob} % pour {l.first_name} ({formatDayLabel(l.appointment_at).toLowerCase()} {formatTime(l.appointment_at)})
                </span>
                <a
                  className={styles.linkBtn}
                  href={whatsappHref(l, templates(l).find((t) => t.id === 'meteo').text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => logActivity(l.id, 'whatsapp', 'Alerte météo envoyée')}
                >
                  Prévenir
                </a>
              </li>
            ))}
            {tomorrows.length > 0 && (
              <li>
                <Icon name="bell" size={17} />
                <span>Rappels à envoyer pour demain :</span>
              </li>
            )}
            {tomorrows.map((l) => {
              const tpl = templates(l).find((t) => t.id === 'veille')
              return (
                <li key={l.id} className={v2.briefSub}>
                  <span>
                    {formatTime(l.appointment_at)} · <strong>{l.first_name}</strong>
                  </span>
                  <a className={styles.actWa} href={whatsappHref(l, tpl.text)} target="_blank" rel="noopener noreferrer" onClick={() => logActivity(l.id, 'whatsapp', 'Rappel de la veille envoyé')}>
                    <Icon name="whatsapp" size={15} /> Rappel
                  </a>
                </li>
              )
            })}
            {low.length > 0 && (
              <li className={v2.briefWarn}>
                <Icon name="box" size={17} />
                <span>Stock bas : {low.map((p) => p.name).join(', ')}</span>
                <button type="button" className={styles.linkBtn} onClick={() => goTo('stock')}>
                  Voir
                </button>
              </li>
            )}
            {duel.gap != null && duel.gap > 0 && (
              <li>
                <Icon name="trophy" size={17} />
                <span>
                  {`${duel.gap} avis d’écart avec FreshInside`}
                </span>
                <button type="button" className={styles.linkBtn} onClick={() => goTo('avis')}>
                  Duel
                </button>
              </li>
            )}
          </ul>
        </section>
        {toClose.length > 0 && (
          <section className={styles.block} aria-labelledby="close-title">
            <header className={styles.blockHead}>
              <h2 id="close-title">Prestations à valider</h2>
              <span className={styles.count}>{toClose.length}</span>
            </header>
            <ul className={styles.miniList}>
              {toClose.map((l) => (
                <li key={l.id} className={styles.closeRow}>
                  <button type="button" onClick={() => onOpen(l.id)}>
                    <span className={styles.miniWhen}>{formatTime(l.appointment_at)}</span>
                    <strong>{l.first_name}</strong>
                    <span>{l.service || ''}</span>
                  </button>
                  <button type="button" className={styles.btnPrimary} onClick={() => onComplete(l)}>
                    <Icon name="check" size={16} /> Terminé
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {myTasks.length > 0 && (
          <section className={styles.block} aria-labelledby="tasks-title">
            <header className={styles.blockHead}>
              <h2 id="tasks-title">Mes tâches du jour</h2>
              <button type="button" className={styles.linkBtn} onClick={() => goTo('taches')}>
                Toutes
              </button>
            </header>
            <ul className={styles.taskList}>
              {myTasks.map((t) => (
                <TaskRow key={t.id} t={t} onToggle={onToggleTask} />
              ))}
            </ul>
          </section>
        )}
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
                  onReview={onReview}
                  onOpen={onOpen}
                  updateLead={updateLead}
                  logActivity={logActivity}
                />
              ))}
            </div>
          )}
        </section>
        </div>

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
            {forecast.planned > 0 && (
              <p className={v2.forecastLine}>
                Prévision fin de mois : <strong>{euros(forecast.total)}</strong> (dont {euros(forecast.planned)} de RDV prévus)
              </p>
            )}
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
