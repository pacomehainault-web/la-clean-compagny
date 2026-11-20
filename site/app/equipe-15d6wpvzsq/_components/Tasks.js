'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import { taskGroup, toDateInput, addDays, formatDayLabel } from '../_lib/crm'

const GROUPS = [
  { id: 'late', label: 'En retard' },
  { id: 'today', label: "Aujourd'hui" },
  { id: 'soon', label: 'À venir' },
  { id: 'later', label: 'Sans date' },
]

export function TaskRow({ t, onToggle, onDelete, onOpenLead, compact = false }) {
  const g = taskGroup(t)
  return (
    <li className={`${styles.task} ${t.done ? styles.taskDone : ''}`}>
      <button type="button" className={styles.taskCheck} onClick={() => onToggle(t)} aria-label={t.done ? 'Marquer comme à faire' : 'Marquer comme fait'} aria-pressed={t.done}>
        {t.done && <Icon name="check" size={15} />}
      </button>
      <div className={styles.taskBody}>
        <span>{t.title}</span>
        {(t.due_on || t.lead_id) && !compact && (
          <em className={g === 'late' ? styles.textDanger : ''}>
            {t.due_on ? formatDayLabel(`${t.due_on}T12:00:00`) : ''}
            {t.lead_id && onOpenLead && (
              <button type="button" className={styles.linkBtn} onClick={() => onOpenLead(t.lead_id)}>
                {' '}
                · voir la fiche
              </button>
            )}
          </em>
        )}
      </div>
      {onDelete && (
        <button type="button" className={styles.iconBtnSm} onClick={() => onDelete(t)} aria-label="Supprimer la tâche">
          <Icon name="trash" size={15} />
        </button>
      )}
    </li>
  )
}

export default function Tasks({ tasks, onAdd, onToggle, onDelete, onOpenLead }) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('today')
  const [showDone, setShowDone] = useState(false)
  const now = new Date()
  const dueValue = { today: toDateInput(now.toISOString()), tomorrow: toDateInput(addDays(now, 1).toISOString()), week: toDateInput(addDays(now, 7).toISOString()), none: null }

  async function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    const ok = await onAdd({ title: title.trim(), due_on: dueValue[due] })
    if (ok) setTitle('')
  }

  const open = tasks.filter((t) => !t.done).sort((a, b) => (a.due_on || '9999') < (b.due_on || '9999') ? -1 : 1)
  const done = tasks.filter((t) => t.done).sort((a, b) => (a.done_at < b.done_at ? 1 : -1))

  return (
    <div className={styles.stack}>
      <form className={styles.taskAdd} onSubmit={submit}>
        <div className={styles.search}>
          <Icon name="plus" size={17} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ajouter une tâche (produits à racheter, appel à passer…)" aria-label="Nouvelle tâche" />
        </div>
        <div className={styles.chips}>
          {[
            ['today', "Aujourd'hui"],
            ['tomorrow', 'Demain'],
            ['week', 'Dans 1 semaine'],
            ['none', 'Sans date'],
          ].map(([id, label]) => (
            <button type="button" key={id} className={`${styles.chip} ${due === id ? styles.chipOn : ''}`} onClick={() => setDue(id)}>
              {label}
            </button>
          ))}
          <button type="submit" className={styles.btnPrimary} disabled={!title.trim()}>
            Ajouter
          </button>
        </div>
      </form>

      {open.length === 0 && (
        <div className={styles.emptyState}>
          <Icon name="check" size={22} />
          <p>
            <strong>Rien à faire.</strong> Notez ici tout ce qui n&apos;est pas un client : produits, matériel, appels aux garages…
          </p>
        </div>
      )}

      {GROUPS.map((g) => {
        const items = open.filter((t) => taskGroup(t, now) === g.id)
        if (!items.length) return null
        return (
          <section key={g.id} className={styles.block}>
            <header className={styles.blockHead}>
              <h2 className={g.id === 'late' ? styles.textDanger : ''}>{g.label}</h2>
              <span className={styles.count}>{items.length}</span>
            </header>
            <ul className={styles.taskList}>
              {items.map((t) => (
                <TaskRow key={t.id} t={t} onToggle={onToggle} onDelete={onDelete} onOpenLead={onOpenLead} />
              ))}
            </ul>
          </section>
        )
      })}

      {done.length > 0 && (
        <section className={styles.block}>
          <header className={styles.blockHead}>
            <h2>Faites</h2>
            <button type="button" className={styles.linkBtn} onClick={() => setShowDone((v) => !v)}>
              {showDone ? 'Masquer' : `Afficher (${done.length})`}
            </button>
          </header>
          {showDone && (
            <ul className={styles.taskList}>
              {done.slice(0, 30).map((t) => (
                <TaskRow key={t.id} t={t} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
