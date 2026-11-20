'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './tracking.module.css'
import { getTracking, acceptQuote, icsFile } from '@/lib/booking'
import { photoUrl } from '@/lib/photos'
import { CONTACT, SITE, whatsappLink } from '@/lib/constants'

const STEPS = [
  { id: 'confirme', label: 'Confirmé' },
  { id: 'en_route', label: 'En route' },
  { id: 'sur_place', label: 'En cours' },
  { id: 'termine', label: 'Terminé' },
]

const euros = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0)
const euros0 = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(n) || 0)
const time = (iso) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
const longDay = (iso) => new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

function stageOf(t) {
  if (!t) return null
  if (t.track_stage === 'termine' || ['fait', 'avis_demande', 'avis_recu'].includes(t.status)) return 'termine'
  if (t.track_stage) return t.track_stage
  if (t.appointment_at && t.status !== 'perdu') return 'confirme'
  if (t.quote) return 'devis'
  return 'attente'
}

function relDay(iso) {
  const a = new Date(iso)
  const d0 = new Date()
  d0.setHours(0, 0, 0, 0)
  // (date du jour : recalculée à chaque rendu, sans effet de bord)
  const d1 = new Date(a)
  d1.setHours(0, 0, 0, 0)
  const diff = Math.round((d1 - d0) / 86400000)
  if (diff === 0) return "aujourd'hui"
  if (diff === 1) return 'demain'
  if (diff > 1 && diff < 7) return `dans ${diff} jours`
  return null
}

function BeforeAfter({ before, after }) {
  const [pos, setPos] = useState(50)
  return (
    <div className={styles.ba}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrl(after)} alt="Après" className={styles.baImg} />
      <div className={styles.baBefore} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl(before)} alt="Avant" className={styles.baImg} />
      </div>
      <span className={styles.baLine} style={{ left: `${pos}%` }} aria-hidden="true">
        <i />
      </span>
      <span className={`${styles.baTag} ${styles.baTagL}`}>Avant</span>
      <span className={`${styles.baTag} ${styles.baTagR}`}>Après</span>
      <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="Comparer avant et après" className={styles.baRange} />
    </div>
  )
}

export default function Tracking({ token }) {
  const params = useSearchParams()
  const isNew = params.get('nouveau') === '1'
  const [t, setT] = useState(null)
  const [state, setState] = useState('loading')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const timer = useRef(null)

  const load = useCallback(async () => {
    try {
      const data = await getTracking(token)
      if (!data) return setState('missing')
      setT(data)
      setNow(Date.now())
      setState('ok')
    } catch {
      setState((s) => (s === 'ok' ? 'ok' : 'error'))
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const stage = stageOf(t)
  const live = stage === 'en_route' || stage === 'sur_place' || (stage === 'confirme' && t?.appointment_at && relDay(t.appointment_at) === "aujourd'hui")

  useEffect(() => {
    clearInterval(timer.current)
    if (live) {
      timer.current = setInterval(() => {
        load()
        setNow(Date.now())
      }, 30000)
    }
    const onVis = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(timer.current)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [live, load])

  if (state === 'loading') {
    return (
      <main className={styles.page}>
        <div className={styles.skeleton} aria-busy="true">
          <span />
          <span />
          <span />
        </div>
      </main>
    )
  }
  if (state !== 'ok') {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.h1}>Lien introuvable</h1>
          <p className={styles.muted}>Ce lien de suivi n&apos;existe pas ou a expiré. Contactez-nous, on vous renvoie le bon lien.</p>
          <div className={styles.actions}>
            <a className="btn btn-cta" href={`tel:${CONTACT.phoneTel}`}>
              Appeler Enzo
            </a>
            <Link className="btn btn-ghost" href="/">
              Le site
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const biz = t.biz || {}
  const name = (t.first_name || '').split(' ')[0]
  const stepIndex = STEPS.findIndex((s) => s.id === stage)
  const photos = t.photos || []
  const befores = photos.filter((p) => p.kind === 'avant')
  const afters = photos.filter((p) => p.kind === 'apres')
  const pairs = befores.slice(0, afters.length).map((b, i) => ({ before: b.path, after: afters[i].path }))
  const extraAfters = afters.slice(pairs.length)
  const invoice = t.invoice
  const quote = t.quote
  const every = Math.max(2, Number(biz.loyalty_every) || 5)
  const visits = Number(t.visits) || 0
  const inCycle = visits % every
  const rewardNext = inCycle === every - 1
  const minutes = Number(t.duration_min) || 120
  const eta = t.eta_at ? new Date(t.eta_at) : null
  const etaMin = eta ? Math.max(0, Math.round((eta - now) / 60000)) : null
  const start = t.appointment_at ? new Date(t.appointment_at) : null
  // Sur place : eta_at = heure de fin estimée (posée par Enzo à son arrivée).
  const endAt = stage === 'sur_place' ? (eta || (start ? new Date(start.getTime() + minutes * 60000) : null)) : null
  const progress = endAt ? Math.min(96, Math.max(4, Math.round((1 - (endAt - now) / (minutes * 60000)) * 100))) : null
  const shareUrl = `${SITE.url}/reserver?parrain=${t.referral_code}`
  const payLink = biz.payment_link && /^https:\/\//.test(biz.payment_link) ? biz.payment_link : null
  const depositPct = Number(biz.deposit_pct) || 0
  const unpaid = invoice && invoice.status !== 'paye'

  const hero = {
    attente: { kicker: 'Demande reçue', title: 'On revient vers vous très vite', sub: 'Enzo vous recontacte pour fixer le créneau.' },
    devis: { kicker: 'Votre devis', title: 'Votre devis est prêt', sub: 'Consultez-le ci-dessous et acceptez-le en un clic.' },
    confirme: start
      ? { kicker: 'Rendez-vous confirmé', title: `${relDay(t.appointment_at) ? relDay(t.appointment_at).replace(/^./, (c) => c.toUpperCase()) : longDay(t.appointment_at).replace(/^./, (c) => c.toUpperCase())} à ${time(t.appointment_at)}`, sub: relDay(t.appointment_at) ? longDay(t.appointment_at) : 'On a hâte de s’occuper de votre véhicule.' }
      : null,
    en_route: { kicker: 'Enzo est en route', title: eta ? `Arrivée vers ${time(t.eta_at)}` : 'Arrivée imminente', sub: etaMin != null ? (etaMin <= 1 ? 'Il arrive dans un instant.' : `Dans environ ${etaMin} min.`) : 'Il arrive bientôt.' },
    sur_place: { kicker: 'Nettoyage en cours', title: 'Votre véhicule est entre de bonnes mains', sub: endAt ? `Fin estimée vers ${time(endAt.toISOString())}.` : '' },
    termine: { kicker: 'C’est terminé', title: `Tout propre${name ? `, ${name}` : ''} ✨`, sub: 'Merci pour votre confiance. Retrouvez vos photos et votre facture ci-dessous.' },
  }[stage] || { kicker: 'Suivi', title: 'Votre prestation', sub: '' }

  async function accept() {
    setAccepting(true)
    try {
      const ok = await acceptQuote(token, quote.id)
      if (ok) {
        setAccepted(true)
        load()
      }
    } finally {
      setAccepting(false)
    }
  }

  function downloadIcs() {
    const blob = new Blob(
      [
        icsFile({
          title: `La Clean Compagny – ${t.service || 'Nettoyage'}`,
          start: t.appointment_at,
          minutes,
          location: [t.address, t.city].filter(Boolean).join(', '),
          description: `Suivi en direct : ${SITE.url}/suivi/${token}\nContact : ${CONTACT.phoneDisplay}`,
        }),
      ],
      { type: 'text/calendar' }
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'rdv-la-clean-compagny.ics'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }

  async function share() {
    const text = `Je te recommande La Clean Compagny pour le nettoyage de ta voiture (à domicile autour d'Angers). Avec mon code ${t.referral_code} on a tous les deux une réduction : ${shareUrl}`
    try {
      if (navigator.share) return await navigator.share({ title: 'La Clean Compagny', text, url: shareUrl })
    } catch {
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {}
  }

  return (
    <main className={styles.page}>
      <header className={`${styles.top} ${styles.noPrint}`}>
        <Link href="/" aria-label="La Clean Compagny, accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/logo-onlight.png" alt="La Clean Compagny" className={styles.logo} />
        </Link>
        <a className={styles.topCall} href={`tel:${CONTACT.phoneTel}`}>
          Appeler
        </a>
      </header>

      {isNew && stage === 'confirme' && (
        <p className={`${styles.banner} ${styles.noPrint}`} role="status">
          🎉 Réservation confirmée ! Gardez ce lien : il vous suit jusqu&apos;au jour J.
        </p>
      )}

      <section className={`${styles.hero} ${styles[`hero_${stage}`] || ''} ${styles.noPrint}`} aria-live="polite">
        <p className={styles.kicker}>
          {live && <span className={styles.pulse} aria-hidden="true" />}
          {hero.kicker}
        </p>
        <h1 className={styles.heroTitle}>{hero.title}</h1>
        {hero.sub && <p className={styles.heroSub}>{hero.sub}</p>}

        {stage === 'en_route' && (
          <div className={styles.road} aria-hidden="true">
            <span className={styles.roadLine} />
            <span className={styles.car} style={{ left: `${etaMin != null ? Math.max(6, Math.min(88, 88 - etaMin * 2.5)) : 50}%` }}>
              🚗
            </span>
            <span className={styles.home}>🏠</span>
          </div>
        )}
        {stage === 'sur_place' && progress != null && (
          <div className={styles.progress} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Avancement estimé">
            <i style={{ width: `${progress}%` }} />
          </div>
        )}

        {stepIndex >= 0 && (
          <ol className={styles.stepper}>
            {STEPS.map((s, i) => (
              <li key={s.id} className={i < stepIndex ? styles.stepDone : i === stepIndex ? styles.stepNow : ''}>
                <span>{i < stepIndex ? '✓' : i + 1}</span>
                {s.label}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Devis à accepter */}
      {quote && (
        <section className={`${styles.card} ${styles.noPrint}`}>
          <div className={styles.cardHead}>
            <h2>Devis {quote.number}</h2>
            <span className={`${styles.pill} ${quote.status === 'accepte' || accepted ? styles.pillOk : ''}`}>{quote.status === 'accepte' || accepted ? 'Accepté' : 'En attente'}</span>
          </div>
          <ul className={styles.lines}>
            {(quote.lines || []).map((l, i) => (
              <li key={i}>
                <span>
                  {l.label}
                  {Number(l.qty) > 1 ? ` × ${l.qty}` : ''}
                </span>
                <strong>{euros(Number(l.qty || 0) * Number(l.unit_price || 0))}</strong>
              </li>
            ))}
            <li className={styles.total}>
              <span>Total</span>
              <strong>{euros(quote.total)}</strong>
            </li>
          </ul>
          {biz.vat_note && <p className={styles.small}>{biz.vat_note}</p>}
          {quote.status === 'envoye' && !accepted && (
            <button type="button" className={`btn btn-cta btn-block ${styles.mt}`} onClick={accept} disabled={accepting}>
              {accepting ? 'Validation…' : 'J’accepte ce devis'}
            </button>
          )}
          {(quote.status === 'accepte' || accepted) && !t.appointment_at && <p className={styles.ok}>Merci ! Enzo vous contacte pour fixer le créneau.</p>}
        </section>
      )}

      {/* Détails du RDV */}
      {t.appointment_at && stage !== 'termine' && (
        <section className={`${styles.card} ${styles.noPrint}`}>
          <h2>Votre rendez-vous</h2>
          <dl className={styles.facts}>
            <div>
              <dt>Quand</dt>
              <dd>
                {longDay(t.appointment_at)} à {time(t.appointment_at)}
              </dd>
            </div>
            {t.service && (
              <div>
                <dt>Prestation</dt>
                <dd>{t.service}</dd>
              </div>
            )}
            {t.vehicle && (
              <div>
                <dt>Véhicule</dt>
                <dd>{t.vehicle}</dd>
              </div>
            )}
            {(t.address || t.city) && (
              <div>
                <dt>Adresse</dt>
                <dd>{[t.address, t.city].filter(Boolean).join(', ')}</dd>
              </div>
            )}
            {t.quoted_price ? (
              <div>
                <dt>Prix</dt>
                <dd>{euros0(t.quoted_price)} · déplacement compris</dd>
              </div>
            ) : null}
          </dl>
          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={downloadIcs}>
              Ajouter à mon agenda
            </button>
            <a className="btn btn-ghost btn-sm" href={whatsappLink(`Bonjour Enzo, c'est ${t.first_name} pour le RDV du ${longDay(t.appointment_at)}. `)} target="_blank" rel="noopener noreferrer">
              Écrire sur WhatsApp
            </a>
          </div>
          {payLink && depositPct > 0 && t.quoted_price && stage === 'confirme' && (
            <a className={`btn btn-cta btn-block ${styles.mt}`} href={payLink} target="_blank" rel="noopener noreferrer">
              Régler l&apos;acompte de {euros0((t.quoted_price * depositPct) / 100)}
            </a>
          )}
        </section>
      )}

      {stage === 'confirme' && (
        <section className={`${styles.card} ${styles.noPrint}`}>
          <h2>Pour que tout soit parfait</h2>
          <ul className={styles.tips}>
            <li>
              <span>🔌</span> Une prise électrique accessible près du véhicule
            </li>
            <li>
              <span>🎒</span> Videz l&apos;habitacle et le coffre de vos affaires personnelles
            </li>
            <li>
              <span>🅿️</span> Un peu de place autour de la voiture pour ouvrir les portes
            </li>
            <li>
              <span>🔑</span> Les clés à portée de main à l&apos;arrivée d&apos;Enzo
            </li>
          </ul>
        </section>
      )}

      {/* Avant / après */}
      {(pairs.length > 0 || extraAfters.length > 0) && (
        <section className={`${styles.card} ${styles.noPrint}`}>
          <h2>Avant / après</h2>
          <div className={styles.baList}>
            {pairs.map((p, i) => (
              <BeforeAfter key={i} before={p.before} after={p.after} />
            ))}
          </div>
          {extraAfters.length > 0 && (
            <div className={styles.gallery}>
              {extraAfters.map((p) => (
                <a key={p.path} href={photoUrl(p.path)} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl(p.path)} alt="Après la prestation" loading="lazy" />
                </a>
              ))}
            </div>
          )}
          <p className={styles.small}>Touchez une photo pour l&apos;ouvrir en grand et l&apos;enregistrer.</p>
        </section>
      )}

      {/* Avis Google */}
      {stage === 'termine' && !t.review_done && (
        <section className={`${styles.card} ${styles.reviewCard} ${styles.noPrint}`}>
          <p className={styles.stars} aria-hidden="true">
            ★★★★★
          </p>
          <h2>Votre avis compte énormément</h2>
          <p className={styles.muted}>30 secondes sur Google aident une petite entreprise locale à se faire connaître. Merci !</p>
          <a className="btn btn-cta btn-block" href={CONTACT.googleReviewUrl} target="_blank" rel="noopener noreferrer">
            Laisser un avis Google
          </a>
        </section>
      )}

      {/* Facture */}
      {invoice && (
        <section className={`${styles.card} ${styles.invoice}`}>
          <div className={styles.cardHead}>
            <h2>Facture {invoice.number}</h2>
            <span className={`${styles.pill} ${invoice.status === 'paye' ? styles.pillOk : ''}`}>
              {invoice.status === 'paye' ? `Payée${invoice.paid_at ? ` le ${new Date(invoice.paid_at).toLocaleDateString('fr-FR')}` : ''}` : 'À régler'}
            </span>
          </div>
          <div className={styles.invMeta}>
            <div>
              <strong>{biz.name || 'La Clean Compagny'}</strong>
              <span>{biz.owner}</span>
              {biz.address && <span>{biz.address}</span>}
              {biz.siret && <span>SIRET {biz.siret}</span>}
              <span>{biz.phone}</span>
            </div>
            <div>
              <strong>{invoice.client?.name || t.first_name}</strong>
              {invoice.client?.address && <span>{invoice.client.address}</span>}
              {invoice.client?.vehicle && <span>{invoice.client.vehicle}</span>}
              <span>Émise le {new Date(invoice.issued_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          <ul className={styles.lines}>
            {(invoice.lines || []).map((l, i) => (
              <li key={i}>
                <span>
                  {l.label}
                  {Number(l.qty) > 1 ? ` × ${l.qty}` : ''}
                </span>
                <strong>{euros(Number(l.qty || 0) * Number(l.unit_price || 0))}</strong>
              </li>
            ))}
            <li className={styles.total}>
              <span>Total</span>
              <strong>{euros(invoice.total)}</strong>
            </li>
          </ul>
          {biz.vat_note && <p className={styles.small}>{biz.vat_note}</p>}
          <div className={`${styles.actions} ${styles.noPrint}`}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              Télécharger (PDF)
            </button>
            {unpaid && payLink && (
              <a className="btn btn-cta btn-sm" href={payLink} target="_blank" rel="noopener noreferrer">
                Payer en ligne
              </a>
            )}
          </div>
        </section>
      )}

      {/* Fidélité */}
      {visits > 0 && (
        <section className={`${styles.card} ${styles.noPrint}`}>
          <h2>Votre carte fidélité</h2>
          <div className={styles.loyalty} aria-label={`${inCycle} passage(s) sur ${every - 1}`}>
            {Array.from({ length: every }, (_, i) => (
              <span key={i} className={i < inCycle ? styles.dotOn : i === every - 1 ? styles.dotGift : ''}>
                {i === every - 1 ? '🎁' : i < inCycle ? '✓' : ''}
              </span>
            ))}
          </div>
          <p className={styles.muted}>
            {rewardNext
              ? `Votre prochaine prestation est à -${biz.loyalty_discount || 20} % !`
              : `Encore ${every - 1 - inCycle} prestation${every - 1 - inCycle > 1 ? 's' : ''} et la suivante est à -${biz.loyalty_discount || 20} %.`}
          </p>
        </section>
      )}

      {/* Parrainage */}
      {t.referral_code && (stage === 'termine' || visits > 0) && (
        <section className={`${styles.card} ${styles.referral} ${styles.noPrint}`}>
          <h2>Parrainez un proche</h2>
          <p className={styles.muted}>{biz.referral_reward || 'Une réduction pour vous et pour votre filleul'} avec votre code :</p>
          <p className={styles.code}>{t.referral_code}</p>
          <button type="button" className="btn btn-cta btn-block" onClick={share}>
            {copied ? 'Message copié !' : 'Partager mon code'}
          </button>
          {Number(t.filleuls) > 0 && (
            <p className={styles.small}>
              {t.filleuls} proche{t.filleuls > 1 ? 's ont' : ' a'} déjà utilisé votre code. Merci !
            </p>
          )}
        </section>
      )}

      {stage === 'termine' && (
        <section className={`${styles.card} ${styles.noPrint}`}>
          <h2>On se revoit ?</h2>
          <p className={styles.muted}>Réservez votre prochain nettoyage en une minute, au créneau qui vous arrange.</p>
          <a className="btn btn-ghost btn-block" href="/reserver">
            Reprendre rendez-vous
          </a>
        </section>
      )}

      <footer className={`${styles.foot} ${styles.noPrint}`}>
        <p>
          {biz.name || 'La Clean Compagny'} · {CONTACT.phoneDisplay}
        </p>
        <p>Nettoyage automobile à domicile autour d&apos;{CONTACT.city}</p>
      </footer>
    </main>
  )
}
