'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import Duel from './Duel'
import { formatDate, templates, whatsappHref, daysBetween } from '../_lib/crm'

const REVIEW_URL = 'https://g.page/r/CSFtfbCI8GR-EBM/review'
const GBP_URL = 'https://business.google.com/reviews'

// Avis Google : avis relevés chaque matin + demandes d'avis aux clients.
export default function Reviews({ reviews, leads, stats, onUpdateReview, onOpen, updateLead, logActivity, flash, onSaveStats, onReview }) {
  const [filter, setFilter] = useState('sans-reponse')
  const sorted = [...reviews].sort((a, b) => ((a.review_date || '') < (b.review_date || '') ? 1 : -1))
  const pending = sorted.filter((r) => !r.replied)
  const list = filter === 'sans-reponse' ? pending : sorted
  const avg = reviews.length ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length : null
  const total = stats.filter((s) => s.source === 'gbp' && s.metric === 'avis_total').sort((a, b) => (a.day < b.day ? 1 : -1))[0]
  const note = stats.filter((s) => s.source === 'gbp' && s.metric === 'note_moyenne').sort((a, b) => (a.day < b.day ? 1 : -1))[0]

  const toAsk = leads.filter((l) => l.status === 'fait' && l.source !== 'test')
  const asked = leads.filter((l) => l.status === 'avis_demande' && l.source !== 'test')
  const received = leads.filter((l) => l.status === 'avis_recu').length

  function ask(lead, tplId) {
    if (tplId === 'avis' && onReview) return onReview(lead)
    const tpl = templates(lead).find((t) => t.id === tplId)
    window.open(whatsappHref(lead, tpl.text), '_blank', 'noopener')
    logActivity(lead.id, 'whatsapp', `WhatsApp « ${tpl.label} »`)
    updateLead(lead, { status: 'avis_demande', review_requested_at: new Date().toISOString() }, { silent: true })
  }

  return (
    <div className={styles.stack}>
      {onSaveStats && <Duel stats={stats} onSave={onSaveStats} />}
      <section className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Note Google</span>
          <strong>{note ? `${Number(note.value).toFixed(1)} ★` : avg ? `${avg.toFixed(1)} ★` : '—'}</strong>
          <em>{total ? `${total.value} avis au total` : `${reviews.length} avis relevés`}</em>
        </div>
        <div className={`${styles.kpi} ${pending.length ? styles.kpiAlert : ''}`}>
          <span>Sans réponse</span>
          <strong>{pending.length}</strong>
          <em>répondre aide le classement</em>
        </div>
        <div className={`${styles.kpi} ${toAsk.length ? styles.kpiGold : ''}`}>
          <span>Avis à demander</span>
          <strong>{toAsk.length}</strong>
          <em>clients « Prestation faite »</em>
        </div>
        <div className={styles.kpi}>
          <span>Demandes</span>
          <strong>
            {received}/{received + asked.length || 0}
          </strong>
          <em>avis reçus / demandés</em>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Demander un avis</h2>
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              navigator.clipboard?.writeText(REVIEW_URL)
              flash('Lien d’avis copié')
            }}
          >
            <Icon name="copy" size={15} /> Copier le lien
          </button>
        </div>
        {toAsk.length === 0 && asked.length === 0 ? (
          <p className={styles.empty}>Personne à relancer. Après chaque prestation, marquez « Fait » dans la fiche : le client apparaîtra ici.</p>
        ) : (
          <ul className={styles.miniList}>
            {toAsk.map((l) => (
              <li key={l.id} className={styles.askRow}>
                <button type="button" onClick={() => onOpen(l.id)}>
                  <span className={styles.miniWhen}>À demander</span>
                  <strong>{l.first_name}</strong>
                  <span>{l.city || ''}</span>
                </button>
                <button type="button" className={styles.actReviewSm} onClick={() => ask(l, 'avis')} aria-label={`Demander l'avis de ${l.first_name}`}>
                  <Icon name="star" size={16} />
                </button>
              </li>
            ))}
            {asked.map((l) => {
              const since = l.review_requested_at ? daysBetween(l.review_requested_at, new Date()) : null
              return (
                <li key={l.id} className={styles.askRow}>
                  <button type="button" onClick={() => onOpen(l.id)}>
                    <span className={styles.miniWhen}>{since !== null ? `Demandé il y a ${since} j` : 'Demandé'}</span>
                    <strong>{l.first_name}</strong>
                    <span>{l.city || ''}</span>
                  </button>
                  {since !== null && since >= 3 && (
                    <button type="button" className={styles.iconBtn} onClick={() => ask(l, 'relance-avis')} aria-label={`Relancer ${l.first_name}`}>
                      <Icon name="whatsapp" size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => updateLead(l, { status: 'avis_recu' })}
                    aria-label={`${l.first_name} a laissé son avis`}
                    title="Avis reçu"
                  >
                    <Icon name="check" size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Avis Google</h2>
          <div className={styles.segment} role="group" aria-label="Filtre">
            <button type="button" className={filter === 'sans-reponse' ? styles.segOn : ''} onClick={() => setFilter('sans-reponse')}>
              Sans réponse
            </button>
            <button type="button" className={filter === 'tous' ? styles.segOn : ''} onClick={() => setFilter('tous')}>
              Tous
            </button>
          </div>
        </div>
        {reviews.length === 0 ? (
          <p className={styles.empty}>Les avis Google seront relevés automatiquement chaque matin et apparaîtront ici.</p>
        ) : list.length === 0 ? (
          <p className={styles.empty}>Tous les avis ont une réponse 👌</p>
        ) : (
          <div className={styles.reviewList}>
            {list.map((r) => (
              <ReviewCard key={r.id} review={r} onUpdate={onUpdateReview} flash={flash} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ReviewCard({ review, onUpdate, flash }) {
  const [draft, setDraft] = useState(review.reply_draft || '')
  return (
    <article className={styles.review}>
      <header>
        <strong>{review.author}</strong>
        <span className={styles.stars} aria-label={`${review.rating} étoiles sur 5`}>
          {'★'.repeat(review.rating || 0)}
          <i>{'★'.repeat(5 - (review.rating || 0))}</i>
        </span>
        <em>{review.review_date ? formatDate(review.review_date) : ''}</em>
      </header>
      {review.body && <p>{review.body}</p>}
      {review.replied ? (
        <p className={styles.reply}>
          <b>Votre réponse :</b> {review.reply_text || '(répondu)'}
        </p>
      ) : (
        <>
          <textarea
            className={styles.msgBox}
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Réponse à publier…"
            aria-label="Réponse proposée"
          />
          <div className={styles.quickRow}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                navigator.clipboard?.writeText(draft)
                if (draft !== review.reply_draft) onUpdate(review, { reply_draft: draft }, { silent: true })
                flash('Réponse copiée : collez-la sur Google')
              }}
            >
              <Icon name="copy" size={16} /> Copier
            </button>
            <a className={styles.btnSecondary} href={GBP_URL} target="_blank" rel="noopener noreferrer">
              <Icon name="globe" size={16} /> Répondre sur Google
            </a>
            <button type="button" className={styles.btnPrimary} onClick={() => onUpdate(review, { replied: true, reply_text: draft || null })}>
              <Icon name="check" size={16} /> C&apos;est fait
            </button>
          </div>
        </>
      )}
    </article>
  )
}
