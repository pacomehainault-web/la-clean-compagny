// Copie le moteur de lecture des plaques (tesseract.js) dans public/ocr pour qu'il soit
// servi par le site lui-même (aucun appel à un CDN extérieur, compatible avec la CSP).
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const out = join(process.cwd(), 'public', 'ocr')
mkdirSync(out, { recursive: true })

const tjs = dirname(require.resolve('tesseract.js/package.json'))
const core = dirname(require.resolve('tesseract.js-core/package.json'))
const eng = dirname(require.resolve('@tesseract.js-data/eng/package.json'))

const files = [
  [join(tjs, 'dist', 'worker.min.js'), 'worker.min.js'],
  [join(core, 'tesseract-core-lstm.wasm.js'), 'tesseract-core-lstm.wasm.js'],
  [join(core, 'tesseract-core-simd-lstm.wasm.js'), 'tesseract-core-simd-lstm.wasm.js'],
  [join(eng, '4.0.0_best_int', 'eng.traineddata.gz'), 'eng.traineddata.gz'],
]
for (const [from, name] of files) {
  if (!existsSync(from)) throw new Error(`OCR : fichier introuvable ${from}`)
  copyFileSync(from, join(out, name))
}
console.log(`OCR : ${files.length} fichiers copiés dans public/ocr`)
