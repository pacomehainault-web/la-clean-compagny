// Lecture des plaques d'immatriculation à partir d'une photo, directement dans le téléphone.
// Moteur de lecture : tesseract.js, servi depuis /ocr (copié au build depuis node_modules,
// voir scripts/copy-ocr.mjs). Rien ne part sur un serveur extérieur.

// Plaque actuelle (SIV) : AB-123-CD. Lettres I, O et U jamais utilisées.
const SIV = 'LLDDDLL'
const TO_LETTER = { 0: 'D', 1: 'L', 2: 'Z', 4: 'A', 5: 'S', 6: 'G', 7: 'T', 8: 'B' }
const TO_DIGIT = { O: '0', D: '0', Q: '0', U: '0', I: '1', L: '1', J: '1', Z: '2', S: '5', B: '8', G: '6', T: '7', A: '4' }

const isLetter = (c) => c >= 'A' && c <= 'Z'
const isDigit = (c) => c >= '0' && c <= '9'

// Remet en forme ce qui est tapé ou lu : « ab123cd » → « AB-123-CD ».
export function formatPlate(value) {
  const raw = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(raw)) return `${raw.slice(0, 2)}-${raw.slice(2, 5)}-${raw.slice(5)}`
  return String(value || '').toUpperCase().replace(/[^A-Z0-9 -]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20)
}

// Clé de comparaison : sans tirets ni espaces.
export const plateKey = (p) => String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, '')

// Saisie au clavier : ajoute les tirets au fil de la frappe pour le format AB-123-CD.
export function typePlate(value) {
  const raw = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (/^[A-Z]{0,2}$/.test(raw) || /^[A-Z]{2}\d{0,3}$/.test(raw) || /^[A-Z]{2}\d{3}[A-Z]{0,2}$/.test(raw)) {
    return [raw.slice(0, 2), raw.slice(2, 5), raw.slice(5, 7)].filter(Boolean).join('-')
  }
  return String(value || '').toUpperCase().slice(0, 20)
}

// Lettres jamais utilisées sur les plaques SIV.
const SIV_BANNED = /[IOU]/

// Vérifie qu'une suite de 7 caractères lus ressemble vraiment à une plaque AB-123-CD.
// Une seule correction (0→D, 8→B…) est tolérée : au-delà, c'est du bruit pris pour une plaque.
function sivFrom(win) {
  let exact = 0
  let out = ''
  for (let k = 0; k < 7; k++) {
    const c = win[k]
    if (SIV[k] === 'L') {
      if (isLetter(c)) {
        exact++
        out += c
      } else if (TO_LETTER[c]) out += TO_LETTER[c]
      else return null
    } else if (isDigit(c)) {
      exact++
      out += c
    } else if (TO_DIGIT[c]) out += TO_DIGIT[c]
    else return null
  }
  if (exact < 6) return null
  const letters = out.slice(0, 2) + out.slice(5)
  if (SIV_BANNED.test(letters) || out.slice(2, 5) === '000') return null
  return { plate: `${out.slice(0, 2)}-${out.slice(2, 5)}-${out.slice(5)}`, exact }
}

// Candidats « plaque » dans des lignes lues : [{ text, confidence }] → meilleur { plate, score, confidence }.
export function plateCandidates(lines) {
  const found = []
  for (const line of lines) {
    const chunk = String(line.text || '').toUpperCase()
    const s = chunk.replace(/[^A-Z0-9]/g, '')
    // Une plaque, c'est une ligne courte : une longue ligne de texte n'en est pas une.
    if (s.length < 7 || s.length > 14) continue
    for (let i = 0; i + 7 <= s.length; i++) {
      const win = s.slice(i, i + 7)
      const hit = sivFrom(win)
      if (!hit) continue
      // Bonus si la plaque était bien séparée par des tirets ou des espaces dans le texte lu.
      const sep = new RegExp(`${win.slice(0, 2)}[- ]+${win.slice(2, 5)}[- ]+${win.slice(5)}`).test(chunk) ? 2 : 0
      // Caractères en trop autour : moins sûr.
      const extra = s.length - 7 > 2 ? -1 : 0
      found.push({ plate: hit.plate, score: hit.exact + sep + extra, confidence: Number(line.confidence) || 0 })
    }
  }
  return found.sort((a, b) => b.score - a.score || b.confidence - a.confidence)
}

// Compatibilité : plaque la plus probable dans un texte brut (sans indice de confiance).
export function findPlate(text) {
  const lines = String(text || '').split(/\n+/).map((t) => ({ text: t, confidence: 100 }))
  return plateCandidates(lines)[0]?.plate || ''
}

// Seuils de lecture (réglés sur des photos tests : écran noir, dégradé, flou, vraie plaque).
export const MIN_CONTRAST = 18 // écart-type des gris : en dessous, la photo est trop uniforme (noire, floue)
export const MIN_EDGES = 1 // contours nets (‰) : un dégradé, un écran noir ou une photo floue n'en ont pas
export const MIN_CONFIDENCE = 72 // confiance du moteur sur la ligne de la plaque (0-100)

// Mesure une image en niveaux de gris : contraste et contours nets.
// « edges » = part (‰) des pixels voisins qui changent brusquement de teinte : les lettres d'une
// plaque en ont beaucoup, un écran noir, un dégradé ou une photo floue presque pas.
export function grayStats(gray, width) {
  const n = gray.length
  if (!n) return { mean: 0, std: 0, min: 0, max: 0, edges: 0 }
  let sum = 0
  let min = 255
  let max = 0
  for (let i = 0; i < n; i++) {
    const g = gray[i]
    sum += g
    if (g < min) min = g
    if (g > max) max = g
  }
  const mean = sum / n
  const step = Math.max(24, (max - min) * 0.15)
  let v = 0
  let e = 0
  let ne = 0
  for (let i = 0; i < n; i++) {
    const d = gray[i] - mean
    v += d * d
    if ((i + 1) % width) {
      if (Math.abs(gray[i + 1] - gray[i]) >= step) e++
      ne++
    }
  }
  return { mean, std: Math.sqrt(v / n), min, max, edges: ne ? (e / ne) * 1000 : 0 }
}

// La photo peut-elle contenir une plaque lisible ? (sinon : on ne lit rien, plutôt qu'inventer)
export function looksReadable(st) {
  return st.std >= MIN_CONTRAST && st.edges >= MIN_EDGES && st.max - st.min >= 70
}

// Lignes lues par le moteur, avec leur indice de confiance.
export function linesOf(data) {
  const out = []
  for (const b of data?.blocks || []) for (const p of b.paragraphs || []) for (const l of p.lines || []) out.push({ text: l.text, confidence: l.confidence })
  if (!out.length && data?.text) out.push({ text: data.text, confidence: data.confidence ?? 0 })
  return out
}

let workerPromise = null

function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        workerPath: '/ocr/worker.min.js',
        corePath: '/ocr/',
        langPath: '/ocr/',
        workerBlobURL: false,
        cacheMethod: 'write',
      })
      await worker.setParameters({ tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ' })
      return worker
    })().catch((e) => {
      workerPromise = null
      throw e
    })
  }
  return workerPromise
}

// À lancer dès l'ouverture de l'écran de scan : le moteur est prêt quand la photo arrive.
export function warmUpPlateReader() {
  getWorker().catch(() => {})
}

// Prépare une zone de la photo : niveaux de gris + contraste, taille raisonnable.
async function loadImage(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  }
}

// Applique niveaux de gris (+ contraste renforcé si demandé) sur des pixels RGBA. Renvoie les mesures.
export function prepPixels(d, width, stretch = true) {
  const gray = new Uint8ClampedArray(d.length / 4)
  for (let i = 0, j = 0; i < d.length; i += 4, j++) gray[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
  const st = grayStats(gray, width)
  const span = stretch ? Math.max(1, st.max - st.min) : 255
  const lo = stretch ? st.min : 0
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    const v = ((gray[j] - lo) / span) * 255
    d[i] = d[i + 1] = d[i + 2] = v
  }
  return st
}

function region(bmp, crop, maxW = 1600, stretch = true) {
  const W = bmp.width
  const H = bmp.height
  const sx = Math.round(W * crop[0])
  const sy = Math.round(H * crop[1])
  const sw = Math.round(W * crop[2])
  const sh = Math.round(H * crop[3])
  const scale = Math.min(1, maxW / sw)
  const c = document.createElement('canvas')
  c.width = Math.round(sw * scale)
  c.height = Math.round(sh * scale)
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, c.width, c.height)
  const img = ctx.getImageData(0, 0, c.width, c.height)
  const stats = prepPixels(img.data, c.width, stretch)
  ctx.putImageData(img, 0, 0)
  return { canvas: c, stats }
}

// Essais de lecture : Enzo cadre la plaque au centre, on lit d'abord le centre, puis toute la photo.
// Deux tailles : les grosses lettres se lisent mieux une fois l'image réduite.
// Contraste renforcé ou non : selon la lumière, l'un ou l'autre se lit mieux.
export const TRIES = [
  { crop: [0.1, 0.25, 0.8, 0.5], psm: '7', maxW: 1600, stretch: true },
  { crop: [0.1, 0.25, 0.8, 0.5], psm: '7', maxW: 640, stretch: false },
  { crop: [0.1, 0.25, 0.8, 0.5], psm: '7', maxW: 640, stretch: true },
  { crop: [0.1, 0.25, 0.8, 0.5], psm: '7', maxW: 900, stretch: false },
  { crop: [0, 0.15, 1, 0.7], psm: '11', maxW: 1600, stretch: true },
  { crop: [0, 0, 1, 1], psm: '11', maxW: 1200, stretch: false },
]

// Décision finale à partir des lectures : une plaque n'est proposée que si le moteur en est sûr,
// ou s'il l'a lue à l'identique sur deux essais différents.
export function pickPlate(reads) {
  const seen = new Map()
  for (const r of reads) {
    for (const c of r) {
      const e = seen.get(c.plate) || { plate: c.plate, hits: 0, best: 0, score: 0 }
      e.hits++
      e.best = Math.max(e.best, c.confidence)
      e.score = Math.max(e.score, c.score)
      seen.set(c.plate, e)
    }
  }
  const ok = [...seen.values()].filter((e) => e.best >= MIN_CONFIDENCE || (e.hits >= 2 && e.best >= MIN_CONFIDENCE - 15))
  ok.sort((a, b) => b.hits - a.hits || b.best - a.best || b.score - a.score)
  return ok[0]?.plate || ''
}

// Lit la plaque sur une photo. Renvoie { plate, text, reason } (plate vide si rien de sûr).
// reason : 'photo' (noire, floue, uniforme) ou 'illisible'.
export async function readPlate(file) {
  const [worker, bmp] = await Promise.all([getWorker(), loadImage(file)])
  let all = ''
  const reads = []
  let readable = 0
  try {
    for (const t of TRIES) {
      const { canvas, stats } = region(bmp, t.crop, t.maxW, t.stretch)
      // Zone noire, floue ou unie : le moteur y « verrait » des lettres dans le bruit. On saute.
      if (!looksReadable(stats)) continue
      readable++
      await worker.setParameters({ tessedit_pageseg_mode: t.psm })
      const { data } = await worker.recognize(canvas, {}, { text: true, blocks: true })
      all += `\n${data.text}`
      reads.push(plateCandidates(linesOf(data)))
      const plate = pickPlate(reads)
      if (plate) return { plate, text: all.trim(), reason: '' }
    }
  } finally {
    bmp.close?.()
  }
  return { plate: '', text: all.trim(), reason: readable ? 'illisible' : 'photo' }
}
