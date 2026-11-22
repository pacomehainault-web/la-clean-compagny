'use client'

import styles from '../admin.module.css'
import { Icon } from './Icon'
import { STATUS_LABEL, sourceLabel, timeAgo, formatPhone, telHref, whatsappHref, templates, formatDayLabel, formatTime, priceLabel } from '../_lib/crm'

// Carte compacte d'un prospect / client, avec les actions en un geste.
// `reason` (optionnel) : pourquoi il apparaît dans « À faire ».
export default function LeadCard({ lead, onOpen, updateLead, logActivity, reason, tone, templateId = 'premier', onReview }) {
  const tpl = templates(lead).find((t) => t.id === templateId) || templates(lead)[0]

  function markContacted(kind) {
    logActivity(lead.id, kind, kind === 'appel' ? 'Appel lancé depuis le dashboard' : `Message « ${tpl.label} » ouvert`)
    if (lead.status === 'nouveau') updateLead(lead, { status: 'contacte' }, { silent: true })
    if (templateId === 'avis' || templateId === 'relance-avis') {
      updateLead(lead, { status: 'avis_demande', review_requested_at: new Date().toISOString() }, { silent: true })
    }
  }

  return (
    <article className={`${styles.card} ${tone ? styles[`tone_${tone}`] : ''}`}>
      <button type="button" className={styles.cardMain} onClick={() => onOpen(lead.id)}>
        <span className={styles.avatar} aria-hidden="true">
          {(lead.first_name || '?').trim().charAt(0).toUpperCase()}
        </span>
        <span className={styles.cardBody}>
          <span className={styles.cardTop}>
            <strong>{lead.first_name}</strong>
            <span className={`${styles.badge} ${styles[`s_${lead.status}`]}`}>{STATUS_LABEL[lead.status]}</span>
          </span>
          {reason && <span className={styles.reason}>{reason}</span>}
          <span className={styles.cardMeta}>
            {[lead.service, lead.vehicle, lead.city].filter(Boolean).join(', ') || 'Demande de rappel'}
          </span>
          <span className={styles.cardSub}>
            {lead.appointment_at && lead.status === 'reserve'
              ? `RDV ${formatDayLabel(lead.appointment_at).toLowerCase()} à ${formatTime(lead.appointment_at)}`
              : `${timeAgo(lead.created_at).replace(/^./, (c) => c.toUpperCase())}, ${sourceLabel(lead.source).toLowerCase()}`}
            {lead.quoted_price ? `, ${priceLabel(lead.quoted_price)}` : ''}
          </span>
        </span>
      </button>
      <div className={styles.cardActions}>
        <a className={styles.actCall} href={telHref(lead)} onClick={() => markContacted('appel')} aria-label={`Appeler ${lead.first_name} au ${formatPhone(lead.phone)}`}>
          <Icon name="phone" size={17} />
          <span>Appeler</span>
        </a>
        {onReview && templateId === 'avis' ? (
          <button type="button" className={styles.actReview} onClick={() => onReview(lead)}>
            <Icon name="star" size={17} />
            <span>{tpl.label}</span>
          </button>
        ) : (
        <a
          className={templateId === 'avis' || templateId === 'relance-avis' ? styles.actReview : styles.actWa}
          href={whatsappHref(lead, tpl.text)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => markContacted('whatsapp')}
        >
          <Icon name={templateId === 'avis' || templateId === 'relance-avis' ? 'star' : 'whatsapp'} size={17} />
          <span>{tpl.label}</span>
        </a>
        )}
      </div>
    </article>
  )
}
