import { Suspense } from 'react'
import Tracking from './Tracking'
import { getTracking } from '@/lib/booking'
import { photoUrl } from '@/lib/photos'

const BASE = {
  title: 'Suivi de votre prestation — La Clean Compagny',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
}

// Page de suivi personnelle d'un client (lien secret envoyé par Enzo).
// Image de partage = dernière photo « après » : quand Enzo envoie le lien sur WhatsApp,
// l'aperçu du message montre la voiture une fois propre.
export async function generateMetadata({ params }) {
  const { token } = await params
  try {
    const t = await getTracking(token)
    const after = (t?.photos || []).filter((p) => p.kind === 'apres').pop()
    if (!after) return BASE
    const name = (t.first_name || '').split(' ')[0]
    return {
      ...BASE,
      openGraph: {
        title: name ? `${name}, votre voiture est toute propre ✨` : 'Votre voiture est toute propre ✨',
        description: 'Photos avant/après, facture et avis — La Clean Compagny',
        images: [{ url: photoUrl(after.path), alt: 'Votre voiture après le nettoyage' }],
        type: 'website',
      },
      twitter: { card: 'summary_large_image', images: [photoUrl(after.path)] },
    }
  } catch {
    return BASE
  }
}

export default async function SuiviPage({ params }) {
  const { token } = await params
  return (
    <Suspense fallback={null}>
      <Tracking token={token} />
    </Suspense>
  )
}
