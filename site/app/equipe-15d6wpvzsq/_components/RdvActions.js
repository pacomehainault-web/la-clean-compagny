'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import SlotPicker from './SlotPicker'
import {
  PAYMENT_METHODS,
  atTime,
  hhmm,
  startOfDay,
  durationH,
  euros,
  templates,
  whatsappHref,
  smsHref,
  loyalty,
  trackUrl,
  mapsHref,
  wazeHref,
  formatTime,
  toDateInput,
  addDays,
} from '../_lib/crm'

function Sheet({ title, sub, onClose, wide = false, children }) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <div className={`${styles.sheet} ${styles.sheetSmall} ${wide ? styles.sheetWide : ''}`}>
        <header className={styles.sheetHead}>
          <div>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}

function SendRow({ lead, text, onSent }) {
  return (
    <div className={styles.doneActions}>
      <a className={styles.actWa} href={whatsappHref(lead, text)} target="_blank" rel="noopener noreferrer" onClick={() => onSent?.('whatsapp')}>
        <Icon name="whatsapp" size={18} /> WhatsApp
      </a>
      <a className={styles.btnSecondary} href={smsHref(lead, text)} onClick={() => onSent?.('sms')}>
        <Icon name="sms" size={18} /> SMS
      </a>
    </div>
  )
}

// « Terminé » : prestation, encaissement, fidélité, facture, stock, puis récap au client.
export function CompleteRdv({ lead, visits = 0, settings, subscription, onClose, onComplete, onAskedReview, onOpenVisit, onAddSubscription, logActivity }) {
  const biz = settings?.business || {}
  const loy = loyalty(visits, biz.loyalty_every)
  const pct = Number(biz.loyalty_discount) || 20
  const base = Number(lead.quoted_price) || 0
  const [applyLoyalty, setApplyLoyalty] = useState(loy.rewardNow && base > 0)
  const discount = applyLoyalty ? Math.round((base * pct) / 100) : 0
  const [amount, setAmount] = useState(base ? String(base - discount) : '')
  const [method, setMethod] = useState('cb')
  const [invoice, setInvoice] = useState(true)
  const [plate, setPlate] = useState(lead.plate || '')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [subForm, setSubForm] = useState(null)

  function toggleLoyalty() {
    const next = !applyLoyalty
    setApplyLoyalty(next)
    if (base) setAmount(String(base - (next ? Math.round((base * pct) / 100) : 0)))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await onComplete(lead, {
      amount: Number(amount) || 0,
      payment_method: method,
      discount,
      invoice,
      plate: plate.trim() || null,
    })
    setBusy(false)
    if (res) setDone(res)
  }

  const after = done?.lead || lead
  const recap = templates(after).find((t) => t.id === 'avis')
  const parrain = templates(after).find((t) => t.id === 'parrainage')

  return (
    <Sheet title={done ? 'Bien joué !' : 'Prestation terminée'} sub={`${lead.first_name}${lead.service ? ` · ${lead.service}` : ''}`} onClose={onClose}>
      {done ? (
        <>
          <section className={styles.sheetSection}>
            <p className={styles.okText}>
              {euros(amount)} enregistrés{method === 'a_encaisser' ? ' (à encaisser)' : ''}
              {done.invoiceNumber ? ` · facture ${done.invoiceNumber} créée` : ''}
              {done.stockAlerts?.length ? ` · stock bas : ${done.stockAlerts.join(', ')}` : ''}.
            </p>
            <h3>Envoyer le récap au client</h3>
            <p className={styles.hint}>Sa page de suivi contient les photos avant/après, la facture et le bouton d&apos;avis Google.</p>
            <SendRow
              lead={after}
              text={recap.text}
              onSent={(ch) => {
                onAskedReview?.(after)
                logActivity?.(after.id, ch, 'Récap + demande d’avis envoyés')
              }}
            />
            <div className={v2.inlineLinks}>
              <button type="button" className={styles.linkBtn} onClick={() => onOpenVisit?.(after)}>
                <Icon name="camera" size={15} /> Ajouter des photos
              </button>
              <a className={styles.linkBtn} href={whatsappHref(after, parrain.text)} target="_blank" rel="noopener noreferrer" onClick={() => logActivity?.(after.id, 'whatsapp', 'Code parrainage envoyé')}>
                <Icon name="gift" size={15} /> Envoyer son code parrain
              </a>
              <a className={styles.linkBtn} href={trackUrl(after)} target="_blank" rel="noopener noreferrer">
                <Icon name="eye" size={15} /> Voir sa page
              </a>
            </div>
          </section>
          {!subscription && onAddSubscription && (
            <section className={styles.sheetSection}>
              {subForm ? (
                <form
                  className={styles.inlineBox}
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const ok = await onAddSubscription({
                      lead_id: after.id,
                      label: subForm.label.trim() || 'Entretien',
                      price: Number(subForm.price) || 0,
                      every_days: Number(subForm.every) || 30,
                      next_on: toDateInput(addDays(new Date(), Number(subForm.every) || 30).toISOString()),
                    })
                    if (ok) setSubForm(null)
                  }}
                >
                  <strong>Formule d&apos;entretien</strong>
                  <div className={styles.grid2}>
                    <label className={styles.field}>
                      Nom
                      <input value={subForm.label} onChange={(e) => setSubForm({ ...subForm, label: e.target.value })} />
                    </label>
                    <label className={styles.field}>
                      Prix par passage (€)
                      <input type="number" min="0" inputMode="decimal" value={subForm.price} onChange={(e) => setSubForm({ ...subForm, price: e.target.value })} />
                    </label>
                  </div>
                  <div className={styles.chipsWrap}>
                    {[
                      [14, 'Toutes les 2 sem.'],
                      [30, 'Tous les mois'],
                      [60, 'Tous les 2 mois'],
                      [90, 'Tous les 3 mois'],
                    ].map(([d, l]) => (
                      <button type="button" key={d} className={`${styles.chip} ${Number(subForm.every) === d ? styles.chipOn : ''}`} onClick={() => setSubForm({ ...subForm, every: d })}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <div className={styles.rowBtns}>
                    <button type="button" className={styles.btnSecondary} onClick={() => setSubForm(null)}>
                      Annuler
                    </button>
                    <button type="submit" className={styles.btnPrimary}>
                      Créer la formule
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className={`${styles.btnSecondary} ${styles.btnBlock} ${v2.wrapBtn}`}
                  onClick={() => setSubForm({ label: `Entretien ${(after.vehicle || '').trim()}`.trim(), price: Math.round((base || Number(amount) || 0) * 0.85) || '', every: 30 })}
                >
                  <Icon name="repeat" size={17} /> Proposer une formule d&apos;entretien
                </button>
              )}
            </section>
          )}
          <div className={styles.sheetFoot}>
            <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} onClick={onClose}>
              Fermer
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit}>
          <section className={styles.sheetSection}>
            {visits > 0 && (
              <div className={`${v2.loyaltyBox} ${loy.rewardNow ? v2.loyaltyGift : ''}`}>
                <div className={v2.loyaltyDots} aria-hidden="true">
                  {Array.from({ length: loy.every }, (_, i) => (
                    <i key={i} className={i < loy.inCycle ? v2.dotOn : i === loy.every - 1 ? v2.dotGift : ''} />
                  ))}
                </div>
                {loy.rewardNow ? (
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={applyLoyalty} onChange={toggleLoyalty} />
                    <span>
                      {visits + 1}e passage : fidélité -{pct} %{base ? ` (−${euros(Math.round((base * pct) / 100))})` : ''}
                    </span>
                  </label>
                ) : (
                  <span>
                    {visits + 1}e passage · encore {loy.left} avant la remise fidélité
                  </span>
                )}
              </div>
            )}
            {lead.ref_code && visits === 0 && <p className={styles.hint}>🎁 Client parrainé (code {lead.ref_code}) : pensez à sa réduction de bienvenue.</p>}
            <label className={styles.field}>
              Montant encaissé (€)
              <input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
            </label>
            <div className={styles.slotLabel}>Paiement</div>
            <div className={styles.chipsWrap}>
              {PAYMENT_METHODS.map((p) => (
                <button type="button" key={p.id} className={`${styles.chip} ${method === p.id ? styles.chipOn : ''}`} onClick={() => setMethod(p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
            {lead.partner && (
              <label className={styles.field}>
                Plaque ({lead.partner})
                <input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="AB-123-CD" maxLength={20} />
              </label>
            )}
            <label className={styles.toggle}>
              <input type="checkbox" checked={invoice} onChange={(e) => setInvoice(e.target.checked)} />
              <span>Créer la facture automatiquement (visible sur la page du client)</span>
            </label>
          </section>
          <div className={styles.sheetFoot}>
            <button type="submit" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={busy}>
              <Icon name="check" size={18} /> {busy ? 'Enregistrement…' : 'Valider la prestation'}
            </button>
          </div>
        </form>
      )}
    </Sheet>
  )
}

// « Je pars » / « Je suis arrivé » : met à jour la page de suivi du client.
export function GoRdv({ lead, driveMin = null, onClose, onStage, logActivity }) {
  const enRoute = lead.track_stage === 'en_route'
  const suggested = driveMin ? Math.min(90, Math.max(5, Math.round(driveMin / 5) * 5)) : 20
  const [mins, setMins] = useState(suggested)
  const [now] = useState(() => Date.now())
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(null)
  const choices = [...new Set([5, 10, 15, 20, 30, 45, 60, suggested])].sort((a, b) => a - b)

  async function go() {
    setBusy(true)
    const eta = new Date(Date.now() + mins * 60000).toISOString()
    const ok = await onStage(lead, 'en_route', eta)
    setBusy(false)
    if (ok) setSent({ ...lead, track_stage: 'en_route', eta_at: eta })
  }

  async function arrived() {
    setBusy(true)
    const end = new Date(Date.now() + durationH(lead) * 3600000).toISOString()
    const ok = await onStage(lead, 'sur_place', end)
    setBusy(false)
    if (ok) onClose()
  }

  const maps = mapsHref(lead)
  const waze = wazeHref(lead)

  if (sent) {
    const tpl = templates(sent).find((t) => t.id === 'en-route')
    return (
      <Sheet title="Bonne route !" sub={`${lead.first_name} voit votre arrivée vers ${formatTime(sent.eta_at)} sur sa page`} onClose={onClose}>
        <section className={styles.sheetSection}>
          <p className={styles.hint}>Prévenez-le (le lien de suivi est dans le message) :</p>
          <SendRow lead={sent} text={tpl.text} onSent={(ch) => logActivity?.(lead.id, ch, 'Message « en route » envoyé')} />
          <div className={styles.doneActions}>
            {waze && (
              <a className={styles.btnSecondary} href={waze} target="_blank" rel="noopener noreferrer">
                <Icon name="map" size={17} /> Waze
              </a>
            )}
            {maps && (
              <a className={styles.btnSecondary} href={maps} target="_blank" rel="noopener noreferrer">
                <Icon name="map" size={17} /> Google Maps
              </a>
            )}
          </div>
        </section>
        <div className={styles.sheetFoot}>
          <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} onClick={onClose}>
            OK
          </button>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet title={enRoute ? 'Vous êtes arrivé ?' : 'Je pars chez le client'} sub={`${lead.first_name} · ${[lead.address, lead.city].filter(Boolean).join(', ') || 'adresse non renseignée'}`} onClose={onClose}>
      {enRoute ? (
        <section className={styles.sheetSection}>
          <p className={styles.hint}>Sa page passera en « Nettoyage en cours » avec l&apos;heure de fin estimée ({formatTime(new Date(now + durationH(lead) * 3600000).toISOString())}).</p>
          <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} onClick={arrived} disabled={busy}>
            <Icon name="check" size={18} /> Je suis sur place
          </button>
        </section>
      ) : (
        <section className={styles.sheetSection}>
          <div className={styles.slotLabel}>Arrivée dans…{driveMin ? ` (trajet estimé ${driveMin} min)` : ''}</div>
          <div className={styles.chipsWrap}>
            {choices.map((m) => (
              <button type="button" key={m} className={`${styles.chip} ${mins === m ? styles.chipOn : ''}`} onClick={() => setMins(m)}>
                {m} min
              </button>
            ))}
          </div>
          <p className={styles.hint}>Arrivée affichée au client : {formatTime(new Date(now + mins * 60000).toISOString())}</p>
          <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} onClick={go} disabled={busy}>
            <Icon name="car" size={18} /> {busy ? '…' : "C'est parti"}
          </button>
        </section>
      )}
    </Sheet>
  )
}

// « Décaler » : nouveau jour / heure, puis message au client.
export function MoveRdv({ lead, leads, onClose, onMove }) {
  const start = new Date(lead.appointment_at)
  const [slot, setSlot] = useState({ day: startOfDay(start), time: hhmm(start), minutes: Math.round(durationH(lead) * 60) })
  const [busy, setBusy] = useState(false)
  const [moved, setMoved] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const at = atTime(slot.day, slot.time).toISOString()
    const ok = await onMove(lead, { appointment_at: at, duration_min: slot.minutes, track_stage: null, eta_at: null })
    setBusy(false)
    if (ok) setMoved({ ...lead, appointment_at: at })
  }

  const tpl = moved ? templates(moved).find((t) => t.id === 'confirmation') : null
  const text = tpl ? tpl.text.replace("c'est confirmé pour", 'petit changement : on se voit') : ''

  return (
    <Sheet title="Décaler le RDV" sub={`${lead.first_name} · actuellement ${start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à ${hhmm(start).replace(':', 'h')}`} onClose={onClose} wide>
      {moved ? (
        <>
          <section className={styles.sheetSection}>
            <p className={styles.okText}>RDV déplacé. Prévenez le client :</p>
            <SendRow lead={moved} text={text} />
          </section>
          <div className={styles.sheetFoot}>
            <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} onClick={onClose}>
              Fermer
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit}>
          <section className={styles.sheetSection}>
            <SlotPicker leads={leads} value={slot} onChange={setSlot} excludeId={lead.id} />
          </section>
          <div className={styles.sheetFoot}>
            <button type="submit" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={busy || !slot.time}>
              {busy ? 'Enregistrement…' : 'Déplacer le RDV'}
            </button>
          </div>
        </form>
      )}
    </Sheet>
  )
}
