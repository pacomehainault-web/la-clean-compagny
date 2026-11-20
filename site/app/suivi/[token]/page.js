import { Suspense } from 'react'
import Tracking from './Tracking'

// Page de suivi personnelle d'un client (lien secret envoyé par Enzo).
export const metadata = {
  title: 'Suivi de votre prestation — La Clean Compagny',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
}

export default async function SuiviPage({ params }) {
  const { token } = await params
  return (
    <Suspense fallback={null}>
      <Tracking token={token} />
    </Suspense>
  )
}
