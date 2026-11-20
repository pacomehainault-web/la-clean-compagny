'use client'

import { useMemo, useState } from 'react'
import styles from '../admin.module.css'
import LeadCard from './LeadCard'
import { Icon } from './Icon'
import { PIPELINE, searchLeads } from '../_lib/crm'

const TEMPLATE_FOR = {
  nouveau: 'premier',
  contacte: 'devis',
  devis_envoye: 'relance-devis',
  reserve: 'confirmation',
  fait: 'avis',
  perdu: 'relance-devis',
}

export default function Pipeline({ leads, onOpen, updateLead, logActivity }) {
  const [q, setQ] = useState('')
  const [col, setCol] = useState('nouveau')
  const [layout, setLayout] = useState('colonnes')
  const filtered = useMemo(() => searchLeads(leads, q), [leads, q])
  const byCol = useMemo(
    () => Object.fromEntries(PIPELINE.map((c) => [c.id, filtered.filter((l) => c.statuses.includes(l.status))])),
    [filtered]
  )

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Icon name="search" />
          <input type="search" placeholder="Nom, téléphone, ville, véhicule…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className={styles.segment} role="group" aria-label="Affichage">
          <button type="button" className={layout === 'colonnes' ? styles.segOn : ''} onClick={() => setLayout('colonnes')}>
            Colonnes
          </button>
          <button type="button" className={layout === 'liste' ? styles.segOn : ''} onClick={() => setLayout('liste')}>
            Liste
          </button>
        </div>
      </div>

      {/* Mobile / mode liste : onglets par étape */}
      <div className={`${styles.chips} ${layout === 'colonnes' ? styles.onlyMobile : ''}`}>
        {PIPELINE.map((c) => (
          <button type="button" key={c.id} className={`${styles.chip} ${col === c.id ? styles.chipOn : ''}`} onClick={() => setCol(c.id)}>
            {c.label} <span>{byCol[c.id].length}</span>
          </button>
        ))}
      </div>

      {layout === 'colonnes' && (
        <div className={`${styles.board} ${styles.onlyDesktop}`}>
          {PIPELINE.map((c) => (
            <section className={styles.column} key={c.id}>
              <h2>
                {c.label} <span>{byCol[c.id].length}</span>
              </h2>
              <div className={styles.columnBody}>
                {byCol[c.id].length === 0 && <p className={styles.emptySmall}>—</p>}
                {byCol[c.id].map((l) => (
                  <LeadCard key={l.id} lead={l} templateId={TEMPLATE_FOR[c.id]} onOpen={onOpen} updateLead={updateLead} logActivity={logActivity} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className={`${styles.cardList} ${layout === 'colonnes' ? styles.onlyMobile : ''}`}>
        {byCol[col].length === 0 && <p className={styles.empty}>Personne à cette étape.</p>}
        {byCol[col].map((l) => (
          <LeadCard key={l.id} lead={l} templateId={TEMPLATE_FOR[col]} onOpen={onOpen} updateLead={updateLead} logActivity={logActivity} />
        ))}
      </div>
    </div>
  )
}
