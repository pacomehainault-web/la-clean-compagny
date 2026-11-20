// Ajout de RDV en une phrase (dictée ou tapée) :
// « Mardi 14h Golf 7 intérieur chez Martin, 12 rue des Lices à Angers, 129 € »

import { CATALOG, startOfDay, addDays } from './crm'

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

const SERVICE_WORDS = [
  [/sortie de concession|concession/, 'Sortie de Concession'],
  [/coup de propre|int[ée]rieur/, 'Coup de Propre'],
  [/lustrage minute/, 'Lustrage minute'],
  [/lustrage express/, 'Lustrage Express'],
  [/lustrage finition|finition/, 'Lustrage Finition'],
  [/correction/, 'Correction avancée'],
  [/d[ée]contamination/, 'Décontamination'],
  [/ext[ée]rieur approfondi|approfondi/, 'Ext. approfondi'],
  [/lavage|ext[ée]rieur/, 'Lavage ext.'],
  [/lustrage|polissage/, 'Lustrage Express'],
  [/phare|optique/, 'Phares'],
  [/moto/, 'Moto'],
  [/canap[ée]|matelas|tapis/, 'Canapé / tissus'],
]

const SIZE_WORDS = [
  [/grand suv|7 places|monospace/, 'grand-suv'],
  [/utilitaire|camion|fourgon/, 'utilitaire'],
  [/suv|break|4x4/, 'suv-break'],
  [/berline|compacte/, 'compacte-berline'],
  [/citadine/, 'citadine'],
  [/\bmoto\b|scooter/, 'moto'],
]

const BRANDS =
  'golf|polo|clio|captur|megane|mégane|twingo|zoe|208|2008|308|3008|5008|508|c3|c4|c5|ds|bmw|audi|mercedes|classe|tesla|model|peugeot|renault|citroën|citroen|volkswagen|vw|toyota|yaris|aygo|ford|fiesta|focus|kuga|fiat|500|panda|dacia|sandero|duster|kia|hyundai|tucson|nissan|qashqai|juke|opel|corsa|mini|seat|ibiza|leon|cupra|skoda|octavia|porsche|range|land|volvo|jeep|mazda|honda|lexus|alfa|ferrari|lamborghini|maserati|x1|x3|x5|serie|série|a1|a3|a4|a5|q3|q5|q7|rs6|m3|m4|clio'

export function parseRdvSentence(text, leads = [], now = new Date()) {
  const raw = (text || '').trim()
  const s = raw.toLowerCase().replace(/’/g, "'")
  const out = {}

  // Jour
  let day = null
  if (/apr[èe]s[- ]demain/.test(s)) day = addDays(startOfDay(now), 2)
  else if (/demain/.test(s)) day = addDays(startOfDay(now), 1)
  else if (/aujourd'hui|ce matin|cet apr[eè]s-midi|ce soir/.test(s)) day = startOfDay(now)
  if (!day) {
    const m = s.match(/\b(\d{1,2})\s*(?:\/|\s)(\d{1,2}|janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\b/)
    if (m) {
      const dd = Number(m[1])
      let mm = /^\d+$/.test(m[2]) ? Number(m[2]) - 1 : MONTHS.indexOf(m[2].replace('fevrier', 'février').replace('aout', 'août').replace('decembre', 'décembre'))
      if (mm >= 0 && dd >= 1 && dd <= 31) {
        let d = new Date(now.getFullYear(), mm, dd)
        if (d < startOfDay(now)) d = new Date(now.getFullYear() + 1, mm, dd)
        day = d
      }
    }
  }
  if (!day) {
    const m = s.match(/\ble (\d{1,2})\b(?!\s*h)/)
    if (m) {
      const dd = Number(m[1])
      let d = new Date(now.getFullYear(), now.getMonth(), dd)
      if (d < startOfDay(now)) d = new Date(now.getFullYear(), now.getMonth() + 1, dd)
      day = d
    }
  }
  if (!day) {
    const idx = DAYS.findIndex((d) => new RegExp(`\\b${d}\\b`).test(s))
    if (idx >= 0) {
      let diff = (idx - now.getDay() + 7) % 7
      if (diff === 0) diff = /prochain/.test(s) ? 7 : 0
      day = addDays(startOfDay(now), diff)
    }
  }
  if (day) out.day = startOfDay(day)

  // Heure
  const t = s.match(/\b(\d{1,2})\s*(?:h|heures?|:)\s*(\d{2})?\b/)
  if (t && Number(t[1]) <= 23) out.time = `${String(t[1]).padStart(2, '0')}:${t[2] || '00'}`
  else if (/\bmidi\b/.test(s)) out.time = '12:00'

  // Prestation & gabarit
  for (const [re, short] of SERVICE_WORDS) {
    if (re.test(s)) {
      const item = CATALOG.find((c) => c.short === short)
      if (item) {
        out.service = item.label
        break
      }
    }
  }
  for (const [re, id] of SIZE_WORDS) {
    if (re.test(s)) {
      out.size = id
      break
    }
  }

  // Prix
  const p = s.match(/(\d{2,4})\s*(?:€|euros?)/)
  if (p) out.price = Number(p[1])

  // Véhicule
  const v = raw.match(new RegExp(`\\b(${BRANDS})\\b(\\s+[\\wÀ-ÿ-]+)?`, 'i'))
  if (v) {
    const second = (v[2] || '').trim()
    const keepSecond =
      second &&
      !/^(chez|pour|avec|à|a|au|le|la|de|du|demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|\d{1,2}h.*)$/i.test(second) &&
      !/^(int|ext|lav|lust|pol|phar|nett|coup|sortie|d[ée]co|canap|citadine|berline|suv|break|utilitaire|grand)/i.test(second)
    out.vehicle = `${v[1].replace(/^./, (c) => c.toUpperCase())}${keepSecond ? ` ${second}` : ''}`
  }

  // Adresse et ville
  const a = raw.match(/(\d{1,4}\s*(?:bis|ter)?,?\s+(?:rue|avenue|av\.?|boulevard|bd|chemin|allée|allee|impasse|place|route|quai|square|cours|lotissement|résidence|residence)\b[^,.;]*?)(?=\s+à\s|,|\.|;|$)/i)
  if (a) out.address = a[1].trim()
  const c = raw.match(/\bà\s+([A-ZÀ-Ý][\wÀ-ÿ'-]+(?:[\s-](?:sur|en|lès|les|de|du|la|le)?[\s-]?[A-ZÀ-Ý][\wÀ-ÿ'-]+)*)/)
  if (c && !/^\d/.test(c[1])) out.city = c[1].trim()

  // Client : « chez X », « pour X », « avec X »
  const n = raw.match(/\b(?:chez|pour|avec|client|cliente)\s+(?:m\.|mr|mme|madame|monsieur)?\s*([A-ZÀ-Ýa-zà-ÿ][\wÀ-ÿ'-]+(?:\s+[A-ZÀ-Ý][\wÀ-ÿ'-]+)?)/i)
  if (n) {
    const name = n[1].replace(/\s+(à|au|le|la|de)$/i, '').trim()
    const match = leads.find((l) => (l.first_name || '').toLowerCase() === name.toLowerCase()) || leads.find((l) => (l.first_name || '').toLowerCase().includes(name.toLowerCase().split(' ')[0]))
    if (match) out.lead = match
    else out.name = name.replace(/^./, (x) => x.toUpperCase())
  }

  // Téléphone
  const ph = raw.match(/(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}/)
  if (ph) out.phone = ph[0]

  return out
}

export function speechSupported() {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

// Démarre la dictée ; appelle onText(texte, final) au fil de l'eau.
export function startDictation({ onText, onEnd, onError }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return null
  const rec = new SR()
  rec.lang = 'fr-FR'
  rec.interimResults = true
  rec.continuous = false
  rec.onresult = (e) => {
    let txt = ''
    let final = false
    for (let i = 0; i < e.results.length; i++) {
      txt += e.results[i][0].transcript
      if (e.results[i].isFinal) final = true
    }
    onText(txt, final)
  }
  rec.onerror = (e) => onError?.(e.error)
  rec.onend = () => onEnd?.()
  rec.start()
  return rec
}
