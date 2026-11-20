'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import { disablePush, enablePush, isIos, pushState } from '../_lib/push'

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// Notifications natives : activation sur l'appareil, test différé, liste des téléphones abonnés.
export default function PushPanel({ supabase, flash, onDigestNow }) {
  const [state, setState] = useState('loading')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [devices, setDevices] = useState([])
  const [countdown, setCountdown] = useState(0)

  const refresh = useCallback(async () => {
    setState(await pushState())
    const { data } = await supabase.from('push_subscriptions').select('id, device, created_at, last_status, last_sent_at').order('created_at')
    setDevices(data || [])
  }, [supabase])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function enable() {
    setBusy(true)
    setError('')
    try {
      const next = await enablePush(supabase)
      setState(next)
      if (next === 'on') flash('Notifications activées sur cet appareil')
      await refresh()
    } catch (e) {
      setError(`Activation impossible : ${e?.message || 'erreur inconnue'}. Réessayez dans quelques secondes.`)
    }
    setBusy(false)
  }

  async function disable() {
    setBusy(true)
    await disablePush(supabase).catch(() => {})
    await refresh()
    setBusy(false)
    flash('Notifications désactivées sur cet appareil')
  }

  async function delayedTest() {
    const { error: err } = await supabase.rpc('test_push_delayed')
    if (err) return flash('Envoi impossible')
    setCountdown(10)
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Notifications sur ce téléphone</h2>
        {state === 'on' && (
          <span className={styles.pushOn}>
            <Icon name="check" size={15} /> Activées
          </span>
        )}
      </div>

      {state === 'loading' && <p className={styles.hint}>Vérification…</p>}

      {state === 'ios-browser' && (
        <>
          <p className={styles.pushLead}>Sur iPhone, les notifications n&apos;arrivent que si l&apos;espace équipe est installé comme une app. Ça prend 30 secondes :</p>
          <ol className={styles.steps2}>
            <li>
              Dans <strong>Safari</strong>, touchez le bouton <strong>Partager</strong> (le carré avec une flèche vers le haut).
            </li>
            <li>
              Choisissez <strong>Sur l&apos;écran d&apos;accueil</strong>, puis <strong>Ajouter</strong>.
            </li>
            <li>
              Ouvrez <strong>La Clean</strong> depuis la nouvelle icône, connectez-vous, puis revenez dans Réglages pour activer les notifications.
            </li>
          </ol>
          <p className={styles.hint}>Il faut iOS 16.4 ou plus récent (Réglages → Général → Informations).</p>
        </>
      )}

      {state === 'unsupported' && (
        <p className={styles.pushLead}>
          Ce navigateur ne gère pas les notifications. Sur Android, ouvrez cette page dans <strong>Chrome</strong> ; sur iPhone, dans <strong>Safari</strong>.
        </p>
      )}

      {state === 'denied' && (
        <>
          <p className={styles.pushLead}>Les notifications sont bloquées pour cette app.</p>
          <ul className={styles.steps2}>
            {isIos() ? (
              <li>
                iPhone : <strong>Réglages → Notifications → La Clean</strong> → activez « Autoriser les notifications ».
              </li>
            ) : (
              <li>
                Android : touchez le cadenas à gauche de l&apos;adresse (ou appui long sur l&apos;icône La Clean) → <strong>Notifications → Autoriser</strong>.
              </li>
            )}
          </ul>
          <div className={styles.quickRow}>
            <button type="button" className={styles.btnSecondary} onClick={refresh}>
              <Icon name="refresh" size={17} /> J&apos;ai autorisé, vérifier
            </button>
          </div>
        </>
      )}

      {state === 'ready' && (
        <>
          <p className={styles.pushLead}>
            Recevez une notification dès qu&apos;un client remplit le formulaire du site, et le récap de la journée chaque matin à 8 h, même téléphone verrouillé.
          </p>
          <div className={styles.quickRow}>
            <button type="button" className={styles.btnPrimary} onClick={enable} disabled={busy}>
              <Icon name="bell" size={17} /> {busy ? 'Activation…' : 'Activer les notifications'}
            </button>
          </div>
        </>
      )}

      {state === 'on' && (
        <>
          <p className={styles.pushLead}>
            Testez dans les conditions réelles : appuyez, puis <strong>quittez l&apos;app ou verrouillez le téléphone</strong>. La notification doit apparaître 10 secondes plus tard.
          </p>
          <div className={styles.quickRow}>
            <button type="button" className={styles.btnPrimary} onClick={delayedTest} disabled={countdown > 0}>
              <Icon name="bell" size={17} /> {countdown > 0 ? `Arrive dans ${countdown} s…` : 'Tester dans 10 s'}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onDigestNow}>
              Recevoir le récap du jour
            </button>
          </div>
        </>
      )}

      {error && <p className={styles.pushErr}>{error}</p>}

      {devices.length > 0 && (
        <div className={styles.pushDevices}>
          <h3>Appareils qui reçoivent les alertes</h3>
          <ul>
            {devices.map((d) => (
              <li key={d.id}>
                <Icon name="bell" size={15} />
                <span>
                  {d.device || 'Appareil'} <em>depuis le {fmtDate(d.created_at)}</em>
                </span>
                {d.last_status != null &&
                  (d.last_status >= 200 && d.last_status < 300 ? (
                    <b className={styles.okText}>dernier envoi : OK</b>
                  ) : (
                    <b className={styles.textWarn}>dernier envoi : refusé</b>
                  ))}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state === 'on' && (
        <button type="button" className={styles.linkDanger} onClick={disable} disabled={busy}>
          Désactiver sur cet appareil
        </button>
      )}
    </section>
  )
}
