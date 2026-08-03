import ReviewsCarousel from '@/components/ReviewsCarousel'
import PageHero from '@/components/PageHero'
import { IconGoogleG } from '@/components/Icons'
import { REVIEWS } from '@/lib/data/reviews'
import { CONTACT } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Avis clients',
  description:
    "Découvrez les avis de nos clients sur nos prestations de detailing automobile à Angers : nettoyage intérieur/extérieur, polissage, traitement céramique et plus encore.",
  path: '/avis',
})

export default function AvisPage() {
  return (
    <>
      <PageHero
        eyebrow="Avis clients"
        title="Ce que nos clients en disent"
        breadcrumb={[{ label: 'Avis' }]}
      />
      <section className="section">
        <div className="container">
          <ReviewsCarousel reviews={REVIEWS} />

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <p className="lead">Vous avez fait appel à nos services ?</p>
            <a
              href={CONTACT.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-cta"
              style={{ marginTop: 20, display: 'inline-flex' }}
            >
              <IconGoogleG size={18} />
              Laisser un avis Google
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
