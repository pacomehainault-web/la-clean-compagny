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
  const isPro = params?.pro === '1'

  return (
    <>
      <PageHero
        eyebrow={isPro ? 'Devis flotte en ligne' : 'Devis en ligne'}
        title={isPro ? 'Composez votre devis flotte en 3 étapes' : 'Composez votre devis en 3 étapes'}
        lead={
          isPro
            ? 'Type de véhicule, prestations, flotte et coordonnées : envoyez votre demande en un clic, nous revenons vers vous avec un devis sur-mesure.'
            : 'Véhicule, prestations, coordonnées : obtenez une estimation immédiate et envoyez votre demande en un clic.'
        }
        breadcrumb={isPro ? [{ label: 'Espace Pro', href: '/pro' }, { label: 'Devis flotte' }] : [{ label: 'Devis' }]}
      />
      <section className="section">
        <div className="container">
          <QuoteWizard
            initialVehicleId={initialVehicleId}
            initialFormulaId={initialFormulaId}
            initialExtraId={initialExtraId}
            isPro={isPro}
          />
        </div>
      </section>
    </>
  )
}
