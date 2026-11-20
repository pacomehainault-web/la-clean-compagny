'use client'

import '@fontsource/unbounded/900.css'
import { useMemo, useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { startOfWeek, addDays, toDateInput, isoWeek, euros } from '../_lib/crm'
import { photoUrl } from '../_lib/media'
import { SITE } from '@/lib/constants'

const W = 1080
const H = 1920
const FONT = 'Unbounded'

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function cover(ctx, img, x, y, w, h) {
  const r = Math.max(w / img.width, h / img.height)
  const iw = img.width * r
  const ih = img.height * r
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih)
}

// Texte centré qui remplit la largeur disponible (taille max donnée).
function fitText(ctx, text, y, maxSize, maxWidth = W - 120) {
  let size = maxSize
  ctx.font = `900 ${size}px ${FONT}`
  while (ctx.measureText(text).width > maxWidth && size > 28) {
    size -= 4
    ctx.font = `900 ${size}px ${FONT}`
  }
  ctx.fillText(text, W / 2, y)
  return size
}

function splitVehicle(v) {
  const parts = (v || 'Véhicule').trim().split(/\s+/)
  return { brand: parts[0].toUpperCase(), model: parts.slice(1).join(' ').toUpperCase() }
}

async function renderSlide({ bg, title, subtitle, kicker, footer, logo, shade = 0.55 }) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0f1b33'
  ctx.fillRect(0, 0, W, H)
  if (bg) cover(ctx, bg, 0, 0, W, H)
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, `rgba(10,14,24,${shade + 0.25})`)
  g.addColorStop(0.38, `rgba(10,14,24,${shade * 0.35})`)
  g.addColorStop(0.7, `rgba(10,14,24,${shade * 0.3})`)
  g.addColorStop(1, `rgba(10,14,24,${shade + 0.3})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 24
  if (kicker) {
    ctx.font = `900 46px ${FONT}`
    ctx.fillStyle = '#a9d8ff'
    ctx.fillText(kicker, W / 2, 330)
    ctx.fillStyle = '#ffffff'
  }
  // Marque + modèle en XXL, centrés dans la zone visible de la grille Instagram.
  const s1 = fitText(ctx, title.brand, 520, 210)
  if (title.model) fitText(ctx, title.model, 520 + Math.min(s1, 200) * 0.95, 150)
  if (subtitle) {
    ctx.font = `900 40px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText(subtitle.toUpperCase(), W / 2, 1470)
  }
  ctx.shadowBlur = 0
  if (logo) {
    const lw = 300
    const lh = (logo.height / logo.width) * lw
    ctx.drawImage(logo, (W - lw) / 2, H - 180 - lh, lw, lh)
  }
  if (footer) {
    ctx.font = `900 30px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(footer, W / 2, H - 110)
  }
  return new Promise((res) => c.toBlob((b) => res(b), 'image/jpeg', 0.92))
}

async function renderBeforeAfter({ before, after, title, logo }) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0f1b33'
  ctx.fillRect(0, 0, W, H)
  cover(ctx, before, 0, 0, W, H / 2)
  cover(ctx, after, 0, H / 2, W, H / 2)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, H / 2 - 4, W, 8)
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 20
  ctx.font = `900 64px ${FONT}`
  ctx.fillText('AVANT', W / 2, 130)
  ctx.fillText('APRÈS', W / 2, H / 2 + 130)
  ctx.font = `900 44px ${FONT}`
  ctx.fillText(`${title.brand} ${title.model}`.trim(), W / 2, H - 120)
  ctx.shadowBlur = 0
  if (logo) {
    const lw = 180
    const lh = (logo.height / logo.width) * lw
    ctx.drawImage(logo, W - lw - 40, 40, lw, lh)
  }
  return new Promise((res) => c.toBlob((b) => res(b), 'image/jpeg', 0.92))
}

// Contenu : récap Instagram hebdo automatique + post Google Business.
export default function Content({ leads, jobs, photos, settings, onSaveSettings, flash }) {
  const biz = settings?.business || {}
  const [weekStart, setWeekStart] = useState(() => startOfWeek(addDays(new Date(), -1)))
  const weekEnd = addDays(weekStart, 6)
  const from = toDateInput(weekStart.toISOString())
  const to = toDateInput(weekEnd.toISOString())
  const firstWeek = biz.insta_week_start ? new Date(`${biz.insta_week_start}T12:00:00`) : null
  const weekNumber = firstWeek ? Math.round((startOfWeek(weekStart) - startOfWeek(firstWeek)) / (7 * 86400000)) + 1 : null
  const weekLabel = weekNumber && weekNumber > 0 ? `SEMAINE ${String(weekNumber).padStart(2, '0')}` : `SEMAINE ${String(isoWeek(weekStart)).padStart(2, '0')}`

  const cars = useMemo(() => {
    const wJobs = jobs.filter((j) => j.done_at >= from && j.done_at <= to)
    const byLead = new Map()
    for (const j of wJobs) {
      if (byLead.has(j.lead_id)) continue
      const lead = leads.find((l) => l.id === j.lead_id)
      if (!lead) continue
      const ph = photos.filter((p) => p.lead_id === j.lead_id && p.taken_on >= from && p.taken_on <= to)
      byLead.set(j.lead_id, { lead, job: j, after: ph.filter((p) => p.kind === 'apres'), before: ph.filter((p) => p.kind === 'avant') })
    }
    return [...byLead.values()]
  }, [jobs, leads, photos, from, to])

  const [coverId, setCoverId] = useState(null)
  const [slides, setSlides] = useState([])
  const [busy, setBusy] = useState(false)
  const [startInput, setStartInput] = useState(biz.insta_week_start || toDateInput(startOfWeek().toISOString()))

  const coverCar = cars.find((c) => c.lead.id === coverId) || cars.find((c) => c.after.length) || cars[0]

  async function generate() {
    setBusy(true)
    try {
      await document.fonts.load(`900 100px ${FONT}`)
      const logo = await loadImg('/images/logo/logo-transparent.png').catch(() => null)
      const out = []
      const coverBg = coverCar?.after[0] ? await loadImg(photoUrl(coverCar.after[0].path)).catch(() => null) : null
      out.push({
        name: `${weekLabel.toLowerCase().replace(' ', '-')}-1-couverture.jpg`,
        blob: await renderSlide({ bg: coverBg, title: splitVehicle(coverCar?.lead.vehicle), kicker: weekLabel, subtitle: `${cars.length} véhicule${cars.length > 1 ? 's' : ''} cette semaine`, logo, footer: '' }),
      })
      let i = 2
      for (const car of cars) {
        const t = splitVehicle(car.lead.vehicle)
        const bg = car.after[0] ? await loadImg(photoUrl(car.after[0].path)).catch(() => null) : null
        out.push({ name: `${weekLabel.toLowerCase().replace(' ', '-')}-${i++}.jpg`, blob: await renderSlide({ bg, title: t, subtitle: car.job.service, logo, shade: 0.45 }) })
        if (car.before[0] && car.after[0]) {
          const [b, a] = await Promise.all([loadImg(photoUrl(car.before[0].path)), loadImg(photoUrl(car.after[0].path))]).catch(() => [null, null])
          if (b && a) out.push({ name: `${weekLabel.toLowerCase().replace(' ', '-')}-${i++}-avant-apres.jpg`, blob: await renderBeforeAfter({ before: b, after: a, title: t, logo }) })
        }
      }
      setSlides((prev) => {
        prev.forEach((x) => URL.revokeObjectURL(x.url))
        return out.filter((x) => x.blob).map((x) => ({ ...x, url: URL.createObjectURL(x.blob) }))
      })
    } catch {
      flash?.('Génération impossible')
    }
    setBusy(false)
  }

  async function shareAll() {
    const files = slides.map((s) => new File([s.blob], s.name, { type: 'image/jpeg' }))
    if (navigator.canShare?.({ files })) {
      try {
        await navigator.share({ files, title: weekLabel })
        return
      } catch {
        return
      }
    }
    for (const s of slides) {
      const a = document.createElement('a')
      a.href = s.url
      a.download = s.name
      a.click()
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  const services = [...new Set(cars.map((c) => c.job.service))]
  const cities = [...new Set(cars.map((c) => c.lead.city).filter(Boolean))]
  const caption = `${weekLabel} ✨\n\n${cars.map((c) => `• ${c.lead.vehicle || 'Véhicule'} : ${c.job.service.toLowerCase()}`).join('\n')}\n\nNettoyage à domicile${cities.length ? ` (${cities.slice(0, 4).join(', ')})` : ' autour d’Angers'}. Réservation en ligne en 1 minute, lien en bio.\n\n#angers #detailingauto #nettoyagevoiture #lacleancompagny`
  const gPost = cars.length
    ? `Cette semaine, ${cars.length} véhicule${cars.length > 1 ? 's' : ''} remis à neuf à domicile${cities.length ? ` à ${cities.slice(0, 3).join(', ')}` : ' autour d’Angers'} : ${services.slice(0, 3).join(', ').toLowerCase()}. On se déplace chez vous ou au travail, sans que vous ayez à bouger. Réservez votre créneau en ligne en 1 minute : ${SITE.url}/reserver`
    : ''

  function copy(text) {
    navigator.clipboard?.writeText(text)
    flash?.('Texte copié')
  }

  function changeWeek(d) {
    slides.forEach((x) => URL.revokeObjectURL(x.url))
    setSlides([])
    setCoverId(null)
    setWeekStart(d)
  }
  const shift = (n) => changeWeek(addDays(weekStart, n * 7))

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <div className={styles.segment} role="group" aria-label="Semaine">
          <button type="button" onClick={() => shift(-1)} aria-label="Semaine précédente">
            <Icon name="left" size={16} />
          </button>
          <button type="button" className={styles.segOn} onClick={() => changeWeek(startOfWeek())}>
            {weekLabel.replace('SEMAINE', 'Semaine')} · {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </button>
          <button type="button" onClick={() => shift(1)} aria-label="Semaine suivante">
            <Icon name="right" size={16} />
          </button>
        </div>
      </div>

      {!biz.insta_week_start && (
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Numérotation des semaines</h2>
          </div>
          <p className={styles.hint}>Indiquez la semaine qui correspond à la « Semaine 01 » de vos publications. Ensuite tout se numérote tout seul.</p>
          <div className={styles.noteRow}>
            <input type="date" value={startInput} onChange={(e) => setStartInput(e.target.value)} aria-label="Début de la semaine 01" />
            <button type="button" className={styles.btnPrimary} onClick={() => onSaveSettings({ business: { ...biz, insta_week_start: toDateInput(startOfWeek(new Date(`${startInput}T12:00:00`)).toISOString()) } })}>
              Enregistrer
            </button>
          </div>
        </section>
      )}

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Récap Instagram de la semaine</h2>
          <span className={styles.count}>{cars.length}</span>
        </div>
        {cars.length === 0 ? (
          <p className={styles.empty}>Aucune prestation cette semaine. Les voitures et leurs photos « après » (prises dans Intervention) apparaîtront ici automatiquement.</p>
        ) : (
          <>
            <p className={styles.hint}>Voiture de la couverture (même modèle chaque semaine, seuls la voiture et le numéro changent) :</p>
            <div className={v2.carPick}>
              {cars.map((c) => (
                <button type="button" key={c.lead.id} className={coverCar?.lead.id === c.lead.id ? v2.carOn : ''} onClick={() => setCoverId(c.lead.id)}>
                  {c.after[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl(c.after[0].path)} alt="" />
                  ) : (
                    <span className={v2.noPhoto}>
                      <Icon name="camera" size={20} />
                    </span>
                  )}
                  <strong>{c.lead.vehicle || c.lead.first_name}</strong>
                  <em>{c.after.length ? `${c.after.length} photo${c.after.length > 1 ? 's' : ''}` : 'pas de photo'}</em>
                </button>
              ))}
            </div>
            <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} onClick={generate} disabled={busy}>
              <Icon name="spark" size={18} /> {busy ? 'Création des visuels…' : slides.length ? 'Recréer les visuels' : 'Créer les visuels 9:16'}
            </button>
          </>
        )}
        {slides.length > 0 && (
          <>
            <div className={v2.slides}>
              {slides.map((s) => (
                <a key={s.name} href={s.url} download={s.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.url} alt={s.name} />
                </a>
              ))}
            </div>
            <div className={styles.rowBtns}>
              <button type="button" className={styles.btnPrimary} onClick={shareAll}>
                <Icon name="arrow" size={17} /> Enregistrer / partager ({slides.length})
              </button>
              <button type="button" className={styles.btnSecondary} onClick={() => copy(caption)}>
                <Icon name="copy" size={17} /> Copier la légende
              </button>
            </div>
          </>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Post Google de la semaine</h2>
        </div>
        {gPost ? (
          <>
            <p className={styles.hint}>Un post par semaine sur la fiche Google aide à remonter sur « nettoyage voiture Angers ». Ajoutez une photo « après » de la semaine.</p>
            <pre className={styles.message}>{gPost}</pre>
            <div className={styles.rowBtns}>
              <button type="button" className={styles.btnSecondary} onClick={() => copy(gPost)}>
                <Icon name="copy" size={17} /> Copier
              </button>
              <a className={styles.btnPrimary} href="https://business.google.com/posts" target="_blank" rel="noopener noreferrer">
                <Icon name="globe" size={17} /> Ouvrir la fiche Google
              </a>
            </div>
          </>
        ) : (
          <p className={styles.empty}>Le texte se rédige tout seul dès qu&apos;il y a des prestations dans la semaine.</p>
        )}
      </section>

      {cars.length > 0 && (
        <p className={styles.hint}>
          Semaine : {cars.length} véhicule{cars.length > 1 ? 's' : ''} · {euros(cars.reduce((t, c) => t + Number(c.job.amount || 0), 0))} (le prix n&apos;apparaît jamais sur les visuels).
        </p>
      )}
    </div>
  )
}
