import { Suspense } from 'react'
import PageHero from '@/components/PageHero'
import BookingWizard from '@/components/BookingWizard'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Réserver en ligne — Nettoyage voiture à domicile à Angers',
  description:
    'Choisissez votre prestation et votre créneau : La Clean Compagny vient nettoyer votre véhicule chez vous ou au travail, autour d’Angers. Confirmation immédiate.',
  path: '/reserver',
})

export default function ReserverPage() {
  return (
    <>
      <PageHero
        eyebrow="Réservation en ligne"
        title="Réservez votre nettoyage en 1 minute"
        lead="Prestation, créneau, adresse : c'est confirmé tout de suite, et vous suivez l'arrivée d'Enzo en direct le jour J."
        breadcrumb={[{ label: 'Réserver' }]}
      />
      <section className="section-tight">
        <div className="container">
          <Suspense fallback={null}>
            <BookingWizard />
          </Suspense>
        </div>
      </section>
    </>
  )
}
