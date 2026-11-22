'use client'

import { useEffect, useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import SmsPanel from './SmsPanel'
import PushPanel from './PushPanel'

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
export default function Settings({ supabase, flash, settings, onSave, onTestAlert, onDigestNow, onLogout, exportCsv, hideTests, setHideTests }) {
  const [biz, setBiz] = useState(settings?.business || {})
  const [goal, setGoal] = useState(settings?.monthly_goal ?? '')
  const [dirty, setDirty] = useState(false)
  const auto = settings?.automations || {}
  const topic = settings?.alert_topic || ''
  const [backupAt, setBackupAt] = useState(undefined)
  const [backupLate, setBackupLate] = useState(false)

  useEffect(() => {
    supabase
      ?.rpc('backup_status')
      .then(({ data, error }) => {
        setBackupAt(error ? null : data || null)
        setBackupLate(!!data && Date.now() - new Date(data).getTime() > 3 * 3600000)
      })
  }, [supabase])

  function set(k, v) {
    setBiz((b) => ({ ...b, [k]: v }))
    setDirty(true)
  }

  return (
    <div className={styles.stack}>
      <PushPanel supabase={supabase} flash={flash} onDigestNow={onDigestNow} />

      <details className={styles.panel}>
        <summary className={styles.pushAlt}>Méthode de secours : l&apos;app ntfy</summary>
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
          <button type="button" className={styles.btnSecondary} onClick={onTestAlert}>
            <Icon name="bell" size={17} /> Envoyer un test
          </button>
        </div>
        <p className={styles.hint}>Gardez ce sujet secret : toute personne qui le connaît recevrait les alertes.</p>
      </details>

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
                <em>Devis envoyé → relance prévue à J+3. Prestation faite → demande d&apos;avis, relance à J+3. Relance d&apos;entretien au bon moment selon la prestation (extérieur 1 mois, intérieur 3 mois, lustrage 6 mois, céramique 1 an). Formules d&apos;entretien → passage à planifier.</em>
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

      <SmsPanel supabase={supabase} flash={flash} settings={settings} onSave={onSave} />

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
          <h2>Terrain, page client et fidélité</h2>
        </div>
        <div className={styles.grid2}>
          <label className={styles.field}>
            Adresse de départ des tournées
            <input value={biz.base_address || ''} onChange={(e) => set('base_address', e.target.value)} placeholder="Ex. Angers" />
          </label>
          <label className={styles.field}>
            Trajet laissé entre deux clients (min)
            <input type="number" min="0" max="120" step="5" inputMode="numeric" value={biz.travel_buffer_min ?? 30} onChange={(e) => set('travel_buffer_min', e.target.value === '' ? 0 : Number(e.target.value))} />
          </label>
          <label className={styles.field}>
            Remise fidélité tous les … passages
            <input type="number" min="2" max="20" inputMode="numeric" value={biz.loyalty_every ?? 5} onChange={(e) => set('loyalty_every', Number(e.target.value) || 5)} />
          </label>
          <label className={styles.field}>
            Remise fidélité (%)
            <input type="number" min="0" max="100" inputMode="numeric" value={biz.loyalty_discount ?? 20} onChange={(e) => set('loyalty_discount', Number(e.target.value) || 0)} />
          </label>
        </div>
        <div className={styles.grid2}>
          <label className={styles.field}>
            Parrainage : clients à amener
            <input type="number" min="1" max="50" inputMode="numeric" value={biz.referral_goal ?? 10} onChange={(e) => set('referral_goal', Number(e.target.value) || 10)} />
          </label>
          <label className={styles.field}>
            Récompense du parrain (affichée au client)
            <input value={biz.referral_reward || ''} onChange={(e) => set('referral_reward', e.target.value)} placeholder="Ex. Nettoyage Sortie de Concession offert" />
          </label>
        </div>
        <div className={styles.grid2}>
          <label className={styles.field}>
            Lien de paiement en ligne (SumUp, Stripe, Lydia Pro…)
            <input value={biz.payment_link || ''} onChange={(e) => set('payment_link', e.target.value.trim())} placeholder="https://…" inputMode="url" />
          </label>
          <label className={styles.field}>
            Acompte demandé à la réservation (%)
            <input type="number" min="0" max="100" inputMode="numeric" value={biz.deposit_pct ?? 0} onChange={(e) => set('deposit_pct', Number(e.target.value) || 0)} />
          </label>
        </div>
        <p className={styles.hint}>
          Avec un lien de paiement, la page du client affiche « Payer en ligne » sur la facture et, si l&apos;acompte est supérieur à 0 %, « Régler l&apos;acompte » avant le RDV. Créez le lien dans votre appli de paiement (SumUp, Stripe…), puis collez-le ici.
        </p>
        <p className={styles.hint}>
          Réservation en ligne pour vos clients :{' '}
          <a href="/reserver" target="_blank" rel="noopener noreferrer">
            lacleancompagny.com/reserver
          </a>{' '}
          (créneaux libres calculés avec le trajet ci-dessus, dimanche fermé).
        </p>
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
        <p className={backupLate || backupAt === null ? styles.textWarn : styles.hint}>
          Sauvegarde Google Sheets (toutes les heures) :{' '}
          {backupAt === undefined
            ? '…'
            : backupAt
              ? `dernière le ${new Date(backupAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}${backupLate ? ' — en retard, vérifiez le fichier' : ' ✓'}`
              : 'pas encore lancée'}
          {biz.backup_sheet_url && (
            <>
              {' · '}
              <a className={styles.linkBtn} href={biz.backup_sheet_url} target="_blank" rel="noopener noreferrer">
                Ouvrir le fichier
              </a>
            </>
          )}
        </p>
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
