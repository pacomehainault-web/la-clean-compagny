// Photos des prestations : compression dans le téléphone puis envoi dans le
// stockage Supabase (bucket « photos »), et enregistrement dans la table photos.

export { photoUrl } from '@/lib/photos'

// Réduit la photo (bord long 1600 px, JPEG 82 %) : envoi rapide même en 4G.
export async function compressImage(file, max = 1600, quality = 0.82) {
  const bitmap = await loadBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('compression'))), 'image/jpeg', quality))
}

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {}
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function randomId() {
  return (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, '')
}

// Envoie une photo (File ou Blob) et l'enregistre. Renvoie la ligne créée.
export async function uploadPhoto(supabase, { leadId, kind, file, caption = null, takenOn = null, alreadyCompressed = false }) {
  const blob = alreadyCompressed ? file : await compressImage(file)
  const ext = blob.type === 'image/png' ? 'png' : 'jpg'
  const path = `${leadId}/${randomId()}.${ext}`
  const up = await supabase.storage.from('photos').upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false })
  if (up.error) throw up.error
  const row = { lead_id: leadId, kind, path, caption }
  if (takenOn) row.taken_on = takenOn
  const { data, error } = await supabase.from('photos').insert(row).select().single()
  if (error) throw error
  return data
}

export async function deletePhoto(supabase, photo) {
  await supabase.storage.from('photos').remove([photo.path])
  const { error } = await supabase.from('photos').delete().eq('id', photo.id)
  if (error) throw error
}
