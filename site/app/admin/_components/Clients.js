'use client'

import { useMemo, useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import { CLIENT_STATUSES, STATUS_LABEL, daysBetween, euros, searchLeads, whatsappHref, templates, telHref } from '../_lib/crm'

// Clients = fiches ayant au moins une prestation faite (ou statut client).
export default function Clients({ leads, jobs, onOpen, logActivity, updateLead }) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('recent')

  const clients = useMemo(() => {
    const withJobs = new Set(jobs.map((j) => j.lead_id))
    const list = searchLeads(
      leads.filter((l) => CLIENT_STATUSES.includes(l.status) || withJobs.has(l.id)),
      q
    ).map((l) => {
      const own = jobs.filter((j) => j.lead_id === l.id)
      const total = own.reduce((s, j) => s + Number(j.amount || 0), 0)
      const last = own.map((j) => j.done_at).sort().pop() || null
      return { lead: l, total, count: own.length, last }
    })
    const by = {
      recent: (a, b) => ((b.last || '') > (a.last || '') ? 1 : -1),
      ca: (a, b) => b.total - a.total,
      ancien: (a, b) => ((a.last || '') > (b.last || '') ? 1 : -1),
    }
    return list.sort(by[sort])
  }, [leads, jobs, q, sort])

  const totalCa = clients.reduce((s, c) => s + c.total, 0)
  const toReview = clients.filter((c) => c.lead.status === 'fait').length

  return (
    <div className={styles.stack}>
      <section className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Clients</span>
          <strong>{clients.length}</strong>
          <em>{clients.filter((c) => c.count > 1).length} fidèles (2+ prestations)</em>
        </div>
        <div className={styles.kpi}>
          <span>CA total</span>
          <strong>{euros(totalCa)}</strong>
          <em>panier moyen {euros(clients.length ? totalCa / Math.max(1, clients.reduce((s, c) => s + c.count, 0)) : 0)}</em>
        </div>
        <div className={`${styles.kpi} ${toReview ? styles.kpiGold : ''}`}>
          <span>Avis à demander</span>
          <strong>{toReview}</strong>
          <em>clients « fait » sans demande</em>
        </div>
      </section>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Icon name="search" />
          <input type="search" placeholder="Rechercher un client…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier">
          <option value="recent">Plus récents</option>
          <option value="ca">Plus gros CA</option>
          <option value="ancien">À relancer (plus anciens)</option>
        </select>
      </div>

      {clients.length === 0 && (
        <p className={styles.empty}>
          Pas encore de client. Quand une prestation est faite, ouvrez la fiche et cliquez « Prestation faite » avec le montant.
        </p>
      )}

      <div className={styles.table}>
        {clients.map(({ lead, total, count, last }) => {
          const since = last ? daysBetween(last, new Date()) : null
          const due = since !== null && since >= 180
          const tplId = lead.status === 'fait' ? 'avis' : due ? 'entretien' : 'relance-avis'
          const tpl = templates(lead).find((t) => t.id === tplId)
          return (
            <div className={styles.tRow} key={lead.id}>
              <button type="button" className={styles.tMain} onClick={() => onOpen(lead.id)}>
                <strong>{lead.first_name}</strong>
                <span>{[lead.vehicle, lead.city].filter(Boolean).join(' · ')}</span>
              </button>
              <span className={styles.tCell}>
                {count} presta{count > 1 ? 's' : ''}
                <em>{euros(total)}</em>
              </span>
              <span className={`${styles.tCell} ${due ? styles.textWarn : ''}`}>
                {last ? `il y a ${since} j` : '—'}
                <em>{STATUS_LABEL[lead.status]}</em>
              </span>
              <div className={styles.tActs}>
                <a className={styles.iconBtn} href={telHref(lead)} aria-label="Appeler">
                  <Icon name="phone" />
                </a>
                <a
                  className={lead.status === 'fait' ? styles.actReviewSm : styles.iconBtn}
                  href={whatsappHref(lead, tpl.text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={tpl.label}
                  title={tpl.label}
                  onClick={() => {
                    logActivity(lead.id, 'whatsapp', `Message « ${tpl.label} » ouvert`)
                    if (tplId === 'avis') updateLead(lead, { status: 'avis_demande', review_requested_at: new Date().toISOString() }, { silent: true })
                  }}
                >
                  <Icon name={tplId === 'entretien' ? 'whatsapp' : 'star'} />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
