import PageHero from '@/components/PageHero'
import { SITE, CONTACT } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from '../legal.module.css'

export const metadata = buildMetadata({
  title: 'Mentions légales',
  description: 'Mentions légales de La Clean Compagny.',
  path: '/mentions-legales',
})

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero eyebrow="Informations légales" title="Mentions légales" breadcrumb={[{ label: 'Mentions légales' }]} />
      <section className="section">
        <div className="container">
          <div className={styles.prose}>
            <p className={styles.updated}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>

            <h2>Éditeur du site</h2>
            <p>
              Le présent site est édité par <strong>{SITE.legalName}</strong>, micro-entreprise
              individuelle représentée par <strong>{SITE.gerant}</strong>, gérant.
            </p>
            <ul>
              <li>SIREN : {SITE.siren}</li>
              <li>Zone d&apos;intervention : {CONTACT.city} et {CONTACT.radiusKm} km alentour</li>
              <li>Téléphone : {CONTACT.phoneDisplay}</li>
              <li>Email : {CONTACT.email}</li>
              <li>{SITE.vatNote}</li>
            </ul>

            <h2>Directeur de la publication</h2>
            <p>{SITE.gerant}, en qualité de gérant de {SITE.legalName}.</p>

            <h2>Hébergement</h2>
            <p>
              Le site est hébergé par une plateforme d&apos;hébergement web tiers. Les
              coordonnées complètes de l&apos;hébergeur seront communiquées sur simple demande à
              l&apos;adresse {CONTACT.email}, conformément à la réglementation en vigueur.
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes, photographies, logos,
              identité visuelle) est la propriété exclusive de {SITE.legalName}, sauf mention
              contraire. Toute reproduction, représentation, modification ou exploitation, totale
              ou partielle, sans autorisation préalable écrite, est interdite.
            </p>

            <h2>Liens hypertextes</h2>
            <p>
              Ce site peut contenir des liens vers des sites tiers (réseaux sociaux, avis Google,
              cartographie). {SITE.legalName} n&apos;exerce aucun contrôle sur ces sites et
              décline toute responsabilité quant à leur contenu.
            </p>

            <h2>Droit applicable</h2>
            <p>
              Le présent site et les présentes mentions légales sont soumis au droit français. En
              cas de litige, et à défaut de résolution amiable, les tribunaux français seront
              seuls compétents.
            </p>

            <h2>Contact</h2>
            <p>
              Pour toute question relative au site, vous pouvez nous contacter à l&apos;adresse{' '}
              {CONTACT.email} ou par téléphone au {CONTACT.phoneDisplay}.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
