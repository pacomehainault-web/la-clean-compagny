'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from '../admin.module.css'
import s from './sms.module.css'
import { formatDate } from '../_lib/crm'

// SMS automatiques envoyés par la base (Brevo) : réglages, interrupteurs,
// modèles de messages, test et derniers envois. Tout est éteint par défaut.

const KINDS = [
  {
    id: 'sms_confirmation',
    label: 'Confirmation de la demande',
    hint: 'Dès qu’une demande ou une réservation arrive du site.',
    templates: [
      ['confirmation', 'Demande (formulaire)', 'Bonjour {prenom}, merci pour votre demande ! Enzo de La Clean Compagny vous rappelle très vite. Réserver directement : {lien_reserver}'],
      ['confirmation_rdv', 'Réservation en ligne', 'Bonjour {prenom}, votre RDV La Clean Compagny est bien enregistré : {date} à {heure}. Suivi et infos : {lien_suivi}'],
    ],
  },
  {
    id: 'sms_relance',
    label: 'Relance des demandes sans RDV',
    hint: 'À J+1 puis J+3, seulement si la personne a coché la case et n’a toujours pas de RDV.',
    templates: [
      ['relance1', '1re relance (J+1)', 'Bonjour {prenom}, c’est Enzo de La Clean Compagny. Toujours partant pour votre nettoyage ? Choisissez votre créneau en 1 min : {lien_reserver} STOP au [STOP_CODE]'],
      ['relance2', '2e relance (J+3)', 'Bonjour {prenom}, dernier petit message : il reste des créneaux pour votre nettoyage à domicile. {lien_reserver} ou appelez le {telephone}. STOP au [STOP_CODE]'],
    ],
  },
  {
    id: 'sms_veille',
    label: 'Rappel la veille du RDV',
    hint: 'Envoyé entre 17 h et 20 h (le samedi pour les RDV du lundi).',
    templates: [['veille', 'Rappel', 'Rappel La Clean Compagny : Enzo passe {date} à {heure} pour votre {prestation}. Pensez à vider le véhicule. Un souci ? {telephone}']],
  },
  {
    id: 'sms_avis',
    label: 'Demande d’avis Google + relance',
    hint: 'Quand la fiche passe à « Fait » (2 h après), puis relance à J+3 si l’avis n’est pas arrivé. Avec accord du client.',
    templates: [
      ['avis', 'Demande d’avis', 'Merci {prenom} pour votre confiance ! Votre avis Google aide beaucoup La Clean Compagny (30 s) : {lien_avis} STOP au [STOP_CODE]'],
      ['relance_avis', 'Relance d’avis (J+3)', 'Bonjour {prenom}, si vous avez 30 secondes, votre avis sur La Clean Compagny nous aiderait énormément : {lien_avis} Merci ! STOP au [STOP_CODE]'],
    ],
  },
  {
    id: 'sms_entretien',
    label: 'Rappel d’entretien',
    hint: 'Au bon délai selon la prestation (extérieur 1 mois, intérieur 3 mois, lustrage 6 mois…). Avec accord du client.',
    templates: [['entretien', 'Rappel', 'Bonjour {prenom}, c’est le bon moment pour un nouveau nettoyage de votre véhicule ! Créneaux en ligne : {lien_reserver} STOP au [STOP_CODE]']],
  },
]

const KIND_LABEL = {
  confirmation: 'Confirmation',
  confirmation_rdv: 'Confirmation RDV',
  relance1: 'Relance 1',
  relance2: 'Relance 2',
  veille: 'Rappel veille',
  avis: 'Demande d’avis',
  relance_avis: 'Relance avis',
  entretien: 'Entretien',
  test: 'Test',
}

const STATUS_LABEL = { en_cours: 'En cours', envoye: 'Envoyé', erreur: 'Erreur' }

// Les apostrophes typographiques coûtent cher en SMS (encodage spécial) : on les remplace.
const gsm = (t) => (t || '').replace(/[’‘]/g, "'").replace(/[–—]/g, '-')

async function fetchSms(supabase) {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('sms_status')
  if (error) return { status: null, log: [] }
  const { data: rows } = await supabase.from('auto_messages').select('id, kind, phone, body, status, response, created_at').order('created_at', { ascending: false }).limit(15)
  return { status: data, log: rows || [] }
}

export default function SmsPanel({ supabase, flash, settings, onSave }) {
  const auto = settings?.automations || {}
  const [status, setStatus] = useState(undefined)
  const [key, setKey] = useState('')
  const [sender, setSender] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [log, setLog] = useState([])
  const [drafts, setDrafts] = useState({})

  const [tick, setTick] = useState(0)
  const load = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let alive = true
    fetchSms(supabase).then((res) => {
      if (!alive || !res) return
      setStatus(res.status)
      if (res.status) setSender(res.status.sender || '')
      setLog(res.log)
    })
    return () => {
      alive = false
    }
  }, [supabase, tick])

  async function saveConfig() {
    const { error } = await supabase.rpc('sms_config_set', { p_key: key.trim() ? key.trim() : null, p_sender: sender.trim() || null })
    if (error) return flash(error.message === 'expediteur' ? 'Expéditeur : 3 à 11 lettres ou chiffres, sans espace' : 'Enregistrement impossible')
    setKey('')
    flash('Réglages SMS enregistrés')
    load()
  }

  async function removeKey() {
    const { error } = await supabase.rpc('sms_config_set', { p_key: '', p_sender: null })
    if (error) return flash('Suppression impossible')
    flash('Clé supprimée : plus aucun SMS ne part')
    load()
  }

  async function sendTest() {
    const { data, error } = await supabase.rpc('sms_test', { p_phone: testPhone })
    if (error) return flash(error.message === 'telephone' ? 'Numéro de portable invalide' : error.message === 'limite' ? '5 tests maximum par heure' : 'Envoi impossible')
    flash(data ? 'SMS test parti, vérifiez le téléphone' : 'Pas de clé Brevo enregistrée')
    setTimeout(load, 4000)
  }

  function toggle(id, on) {
    onSave({ automations: { ...auto, [id]: on } })
  }

  function saveTemplate(tplId, text) {
    const templates = { ...(auto.templates || {}) }
    const clean = gsm(text).trim()
    if (clean) templates[tplId] = clean
    else delete templates[tplId]
    onSave({ automations: { ...auto, templates } })
    setDrafts((d) => {
      const n = { ...d }
      delete n[tplId]
      return n
    })
  }

  if (status === undefined) return null

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>SMS automatiques</h2>
      </div>

      {status === null ? (
        <p className={styles.hint}>
          Pas encore installé : la mise à jour de la base « SMS automatiques » doit d&apos;abord être appliquée (fichier supabase/migrations/20261122_sms_automatiques.sql).
        </p>
      ) : (
        <>
          <p className={styles.hint}>
            Envoyés par Brevo depuis le nom « {status.sender} », du lundi au samedi entre 8 h et 20 h. Environ 0,045 € le SMS.{' '}
            {status.configured ? (
              <strong className={s.ok}>Clé Brevo enregistrée ({status.key_hint}) · {status.sent_30d} SMS envoyés en 30 jours{status.errors_7d ? ` · ${status.errors_7d} erreur(s) cette semaine` : ''}</strong>
            ) : (
              <strong className={s.warn}>Aucune clé Brevo : rien ne part.</strong>
            )}
          </p>

          <details className={s.block} open={!status.configured}>
            <summary>Compte Brevo</summary>
            <ol className={styles.steps2}>
              <li>Créez un compte Brevo au nom de La Clean Compagny et achetez des crédits SMS (ils n&apos;expirent pas).</li>
              <li>Brevo → Paramètres → SMTP &amp; API → « Générer une clé API », puis collez-la ici.</li>
            </ol>
            <div className={s.row}>
              <label className={styles.field}>
                Clé API Brevo
                <input type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder={status.configured ? 'Laisser vide pour garder la clé actuelle' : 'xkeysib-…'} />
              </label>
              <label className={styles.field}>
                Nom d&apos;expéditeur
                <input value={sender} onChange={(e) => setSender(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 11))} placeholder="LaClean" />
              </label>
            </div>
            <div className={styles.quickRow}>
              <button type="button" className={styles.btnPrimary} onClick={saveConfig}>
                Enregistrer
              </button>
              {status.configured && (
                <button type="button" className={styles.btnSecondary} onClick={removeKey}>
                  Supprimer la clé
                </button>
              )}
            </div>
            <div className={s.row}>
              <label className={styles.field}>
                Portable pour un SMS test
                <input type="tel" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="06 12 34 56 78" />
              </label>
              <button type="button" className={styles.btnSecondary} onClick={sendTest} disabled={!status.configured || !testPhone.trim()}>
                Envoyer un SMS test
              </button>
            </div>
          </details>

          <ul className={styles.autoList}>
            {KINDS.map((k) => (
              <li key={k.id}>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={auto[k.id] === true} disabled={!status.configured} onChange={(e) => toggle(k.id, e.target.checked)} />
                  <span>
                    <strong>{k.label}</strong>
                    <em>{k.hint}</em>
                  </span>
                </label>
                <details className={s.tpl}>
                  <summary>Modifier le message</summary>
                  {k.templates.map(([tplId, label, def]) => {
                    const current = drafts[tplId] ?? auto.templates?.[tplId] ?? def
                    const len = gsm(current).length
                    return (
                      <label key={tplId} className={styles.field}>
                        {label}
                        <textarea rows={3} value={current} onChange={(e) => setDrafts((d) => ({ ...d, [tplId]: e.target.value }))} maxLength={480} />
                        <span className={s.meta}>
                          {len} caractères (≈ {Math.max(1, Math.ceil(len / 153))} SMS) · {'{prenom} {date} {heure} {prestation} {lien_reserver} {lien_suivi} {lien_avis} {telephone}'}
                          <span>
                            {drafts[tplId] !== undefined && (
                              <button type="button" className={styles.linkBtn} onClick={() => saveTemplate(tplId, current)}>
                                Enregistrer
                              </button>
                            )}
                            {auto.templates?.[tplId] && (
                              <button type="button" className={styles.linkBtn} onClick={() => saveTemplate(tplId, '')}>
                                Texte d&apos;origine
                              </button>
                            )}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </details>
              </li>
            ))}
          </ul>
          <p className={styles.hint}>Relances, avis et entretien partent seulement si le client a coché la case d&apos;accord sur le site, avec la mention STOP. Les SMS envoyés apparaissent dans l&apos;historique de chaque fiche.</p>

          {log.length > 0 && (
            <details className={s.block}>
              <summary>Derniers SMS envoyés</summary>
              <ul className={s.log}>
                {log.map((m) => (
                  <li key={m.id}>
                    <div>
                      <strong>{KIND_LABEL[m.kind] || m.kind}</strong>
                      <span className={m.status === 'erreur' ? s.warn : m.status === 'envoye' ? s.ok : ''}>{STATUS_LABEL[m.status] || m.status}</span>
                      <em>{formatDate(m.created_at, { dateStyle: 'short', timeStyle: 'short' })}</em>
                    </div>
                    <p>{m.body}</p>
                    {m.status === 'erreur' && m.response && <p className={s.err}>{m.response}</p>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  )
}
