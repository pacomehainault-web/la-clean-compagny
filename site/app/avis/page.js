import ReviewsGrid from '@/components/ReviewsGrid'
import PageHero from '@/components/PageHero'
import { IconStar } from '@/components/Icons'
import { REVIEWS, AGGREGATE_RATING } from '@/lib/data/reviews'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
            <div style={{ display: 'flex', gap: 3, color: '#f5b800' }} aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar key={i} size={22} />
              ))}
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{AGGREGATE_RATING.ratingValue.toFixed(1)} / 5</span>
            <span style={{ color: 'var(--color-text-muted)' }}>({AGGREGATE_RATING.reviewCount} avis)</span>
          </div>

          <ReviewsGrid reviews={REVIEWS} />

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <p className="lead">Vous avez fait appel à nos services ?</p>
            <a
              href={CONTACT.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-cta"
              style={{ marginTop: 20 }}
            >
              Laisser un avis Google
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
