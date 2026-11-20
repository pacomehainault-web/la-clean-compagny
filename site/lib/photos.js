import { LEADS_DB } from './constants'

// URL publique d'une photo de prestation (bucket « photos » : lecture publique,
// noms de fichiers aléatoires impossibles à deviner).
export function photoUrl(path) {
  return path ? `${LEADS_DB.url}/storage/v1/object/public/photos/${path.split('/').map(encodeURIComponent).join('/')}` : ''
}
