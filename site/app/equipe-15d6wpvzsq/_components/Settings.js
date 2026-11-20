'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'

const FIELDS = [
  ['name', 'Nom commercial'],
  ['owner', 'Gérant'],
  ['siret', 'SIRET'],
  ['phone', 'Téléphone'],
  ['email', 'Email'],
  ['website', 'Site'],
  ['vat_note', 'Mention TVA'],
  ['payment_terms', 'Conditions de paiement'],
]

const LINKS = [
  ['Site internet', 'https://www.lacleancompagny.com'],
  ['Fiche Google', 'https://business.google.com'],
  ['Search Console', 'https://search.google.com/search-console?resource_id=sc-domain%3Alacleancompagny.com'],
  ['Lien d’avis Google', 'https://g.page/r/CSFtfbCI8GR-EBM/review'],
]

// Réglages : infos de l'entreprise (devis/factures), objectif, alertes et automatismes.
export default function Settings({ settings, onSave, onTestAlert, onDigestNow, onLogout, exportCsv, hideTests, setHideTests }) {
  const [biz, setBiz] = useState(settings?.business || {})
  const [goal, setGoal] = useState(settings?.monthly_goal ?? '')
  const [dirty, setDirty] = useState(false)
  const auto = settings?.automations || {}
  const topic = settings?.alert_topic || ''

  function set(k, v) {
    setBiz((b) => ({ ...b, [k]: v }))
    setDirty(true)
  }

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Alertes sur le téléphone</h2>
        </div>
        <ol className={styles.steps2}>
          <li>
            Installez l&apos;app gratuite <strong>ntfy</strong> (App Store ou Play Store).
          </li>
          <li>
            Appuyez sur <strong>+</strong> et abonnez-vous au sujet :
            <span className={styles.code}>
              {topic}
              <button type="button" className={styles.iconBtnSm} onClick={() => navigator.clipboard?.writeText(topic)} aria-label="Copier le sujet">
                <Icon name="copy" size={15} />
              </button>
            </span>
          </li>
          <li>Autorisez les notifications, puis testez :</li>
        </ol>
        <div className={styles.quickRow}>
          <button type="button" className={styles.btnPrimary} onClick={onTestAlert}>
            <Icon name="bell" size={17} /> Envoyer un test
          </button>
          <button type="button" className={styles.btnSecondary} onClick={onDigestNow}>
            Recevoir le récap du jour
          </button>
        </div>
        <p className={styles.hint}>Gardez ce sujet secret : toute personne qui le connaît recevrait les alertes.</p>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Automatismes</h2>
        </div>
        <ul className={styles.autoList}>
          <li>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={auto.new_lead !== false}
                onChange={(e) => onSave({ automations: { ...auto, new_lead: e.target.checked } })}
              />
              <span>
                <strong>Alerte nouveau prospect</strong>
                <em>Notification immédiate dès qu&apos;un formulaire arrive du site.</em>
              </span>
            </label>
          </li>
          <li>
            <label className={styles.toggle}>
              <input type="checkbox" checked={auto.digest !== false} onChange={(e) => onSave({ automations: { ...auto, digest: e.target.checked } })} />
              <span>
                <strong>Récap chaque matin à 8 h</strong>
                <em>Qui rappeler, RDV du jour et du lendemain, devis à relancer, avis à demander, factures en retard.</em>
              </span>
            </label>
          </li>
          <li>
            <span className={styles.autoOn}>
              <Icon name="check" size={16} />
              <span>
                <strong>Relances programmées toutes seules</strong>
                <em>Devis envoyé → relance prévue à J+3. Prestation faite → demande d&apos;avis, relance à J+3. Dernier nettoyage il y a 6 mois → proposition d&apos;entretien.</em>
              </span>
            </span>
          </li>
          <li>
            <span className={styles.autoOn}>
              <Icon name="check" size={16} />
              <span>
                <strong>Relevé Google chaque matin</strong>
                <em>Stats de la fiche, positions dans Google, nouveaux avis avec réponse proposée.</em>
              </span>
            </span>
          </li>
        </ul>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Entreprise (devis et factures)</h2>
        </div>
        <div className={styles.grid2}>
          {FIELDS.map(([k, label]) => (
            <label className={styles.field} key={k}>
              {label}
              <input value={biz[k] || ''} onChange={(e) => set(k, e.target.value)} />
            </label>
          ))}
        </div>
        <label className={styles.field}>
          Adresse (obligatoire sur les factures)
          <input value={biz.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="N°, rue, code postal, ville" />
        </label>
        <label className={styles.field}>
          IBAN (affiché sur les factures, facultatif)
          <input value={biz.iban || ''} onChange={(e) => set('iban', e.target.value)} autoComplete="off" />
        </label>
        <label className={styles.field}>
          Objectif de chiffre d&apos;affaires par mois (€)
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value)
              setDirty(true)
            }}
          />
        </label>
        {dirty && (
          <div className={styles.rowBtns}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={async () => {
                const ok = await onSave({ business: biz, monthly_goal: goal === '' ? null : Number(goal) })
                if (ok) setDirty(false)
              }}
            >
              Enregistrer
            </button>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Liens utiles</h2>
        </div>
        <ul className={styles.miniList}>
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Icon name="globe" size={16} />
                <strong>{label}</strong>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Données</h2>
        </div>
        <div className={styles.quickRow}>
          <label className={styles.toggle}>
            <input type="checkbox" checked={hideTests} onChange={(e) => setHideTests(e.target.checked)} />
            <span>Masquer les prospects de test</span>
          </label>
          <button type="button" className={styles.btnSecondary} onClick={exportCsv}>
            Exporter (Excel)
          </button>
          <button type="button" className={styles.btnSecondary} onClick={onLogout}>
            <Icon name="lock" size={16} /> Déconnexion
          </button>
        </div>
      </section>
    </div>
  )
}
