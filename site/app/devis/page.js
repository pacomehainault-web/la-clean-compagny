import PageHero from '@/components/PageHero'
import QuoteWizard from '@/components/QuoteWizard'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Demander un devis — Detailing automobile à Angers',
  description:
    "Sélectionnez votre véhicule et vos prestations pour recevoir une estimation immédiate, puis envoyez votre demande de devis par WhatsApp ou par email.",
  path: '/devis',
})

export default async function DevisPage({ searchParams }) {
  const params = await searchParams
  const initialVehicleId = typeof params?.vehicule === 'string' ? params.vehicule : ''
  const initialFormulaId = typeof params?.formule === 'string' ? params.formule : ''
  const initialExtraId = typeof params?.extra === 'string' ? params.extra : ''

  return (
    <>
      <PageHero
        eyebrow="Devis en ligne"
        title="Composez votre devis en 3 étapes"
        lead="Véhicule, prestations, coordonnées : obtenez une estimation immédiate et envoyez votre demande en un clic."
        breadcrumb={[{ label: 'Devis' }]}
      />
      <section className="section">
        <div className="container">
          <QuoteWizard
            initialVehicleId={initialVehicleId}
            initialFormulaId={initialFormulaId}
            initialExtraId={initialExtraId}
          />
        </div>
      </section>
    </>
  )
}
