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

// Cherche la plaque la plus probable dans le texte lu (corrige 0/O, 8/B, 5/S…).
export function findPlate(text) {
  const lines = String(text || '').toUpperCase().split(/\n+/)
  let best = null
  for (const chunk of [...lines, lines.join(' ')]) {
    const s = chunk.replace(/[^A-Z0-9]/g, '')
    for (let i = 0; i + 7 <= s.length; i++) {
      const win = s.slice(i, i + 7)
      let exact = 0
      let out = ''
      let ok = true
      for (let k = 0; k < 7; k++) {
        const c = win[k]
        if (SIV[k] === 'L') {
          if (isLetter(c)) {
            exact++
            out += c
          } else if (TO_LETTER[c]) out += TO_LETTER[c]
          else ok = false
        } else if (isDigit(c)) {
          exact++
          out += c
        } else if (TO_DIGIT[c]) out += TO_DIGIT[c]
        else ok = false
      }
      // Bonus si la plaque était bien séparée par des tirets ou des espaces dans le texte lu.
      const sep = new RegExp(`${win.slice(0, 2)}[- ]+${win.slice(2, 5)}[- ]+${win.slice(5)}`).test(chunk) ? 2 : 0
      const score = exact + sep
      if (ok && exact >= 5 && (!best || score > best.score)) best = { plate: `${out.slice(0, 2)}-${out.slice(2, 5)}-${out.slice(5)}`, score }
    }
  }
  if (best) return best.plate
  // Ancien format (FNI) : 1234 AB 49
  const old = String(text || '').toUpperCase().match(/\b(\d{1,4})\s?([A-Z]{1,3})\s?(\d{2,3})\b/)
  return old ? `${old[1]} ${old[2]} ${old[3]}` : ''
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
  const d = img.data
  let min = 255
  let max = 0
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    d[i] = g
    if (g < min) min = g
    if (g > max) max = g
  }
  const span = stretch ? Math.max(1, max - min) : 255
  const lo = stretch ? min : 0
  for (let i = 0; i < d.length; i += 4) {
    const v = ((d[i] - lo) / span) * 255
    d[i] = d[i + 1] = d[i + 2] = v
  }
  ctx.putImageData(img, 0, 0)
  return c
}

// Lit la plaque sur une photo. Renvoie { plate, text } (plate vide si rien de lisible).
export async function readPlate(file) {
  const [worker, bmp] = await Promise.all([getWorker(), loadImage(file)])
  // Enzo cadre la plaque au centre : on lit d'abord le centre, puis toute la photo.
  // Deux tailles : les grosses lettres se lisent mieux une fois l'image réduite.
  // Contraste renforcé ou non : selon la lumière, l'un ou l'autre se lit mieux.
  const tries = [
    { crop: [0.1, 0.25, 0.8, 0.5], psm: '7', maxW: 1600, stretch: true },
    { crop: [0.1, 0.25, 0.8, 0.5], psm: '7', maxW: 640, stretch: false },
    { crop: [0.1, 0.25, 0.8, 0.5], psm: '7', maxW: 640, stretch: true },
    { crop: [0.1, 0.25, 0.8, 0.5], psm: '7', maxW: 900, stretch: false },
    { crop: [0, 0.15, 1, 0.7], psm: '11', maxW: 1600, stretch: true },
    { crop: [0, 0, 1, 1], psm: '11', maxW: 1200, stretch: false },
  ]
  let all = ''
  for (const t of tries) {
    const canvas = region(bmp, t.crop, t.maxW, t.stretch)
    await worker.setParameters({ tessedit_pageseg_mode: t.psm })
    const { data } = await worker.recognize(canvas)
    all += `\n${data.text}`
    const plate = findPlate(data.text)
    if (plate) {
      bmp.close?.()
      return { plate, text: all.trim() }
    }
  }
  bmp.close?.()
  return { plate: '', text: all.trim() }
}
