import Link from 'next/link'
import PageHero from '@/components/PageHero'
import FAQAccordion from '@/components/FAQAccordion'
import JsonLd from '@/components/JsonLd'
import { IconArrowRight } from '@/components/Icons'
import { FAQ_ITEMS } from '@/lib/data/faq'
import { CONTACT, telLink, mailtoLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { faqPageSchema } from '@/lib/schema'

export const metadata = buildMetadata({
  title: 'Questions fréquentes',
  description:
    "Toutes les réponses à vos questions sur nos prestations de detailing automobile : polissage, traitement céramique, intervention à domicile, tarifs, paiement…",
  path: '/faq',
})

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(FAQ_ITEMS)} />
      <PageHero
        eyebrow="Questions fréquentes"
        title="Tout ce qu'il faut savoir avant de réserver"
        breadcrumb={[{ label: 'FAQ' }]}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <FAQAccordion items={FAQ_ITEMS} defaultOpenIndex={0} />

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <p className="lead">Vous ne trouvez pas la réponse à votre question ?</p>
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <a href={telLink()} className="btn btn-cta">
                {CONTACT.phoneDisplay}
              </a>
              <a href={mailtoLink({ subject: 'Question' })} className="btn btn-outline">
                Nous écrire
              </a>
            </div>
            <Link href="/devis" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, color: 'var(--color-text-muted)' }}>
              Ou passez directement au devis
              <IconArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
