import PageHero from '@/components/PageHero'
import { SITE, CONTACT } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from '../legal.module.css'

export const metadata = buildMetadata({
  title: 'Conditions générales de vente',
  description: 'Conditions générales de vente des prestations de La Clean Compagny.',
  path: '/cgv',
})

export default function CGVPage() {
  return (
    <>
      <PageHero
        eyebrow="Conditions générales"
        title="Conditions générales de vente"
        breadcrumb={[{ label: 'CGV' }]}
      />
      <section className="section">
        <div className="container">
          <div className={styles.prose}>
            <p className={styles.updated}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>

            <h2>Article 1 — Objet</h2>
            <p>
              Les présentes conditions générales de vente régissent les prestations de detailing
              et de nettoyage automobile proposées par {SITE.legalName}{' '}({SITE.gerant}),
              micro-entreprise immatriculée sous le SIREN {SITE.siren}, {SITE.vatNote}.
            </p>

            <h2>Article 2 — Prestations</h2>
            <p>
              {SITE.legalName}{' '}propose des prestations de nettoyage intérieur et extérieur, de
              rénovation esthétique (polissage, lustrage, traitement céramique, décontamination,
              rénovation d&apos;optiques, désinfection à l&apos;ozone) sur véhicules du quotidien,
              utilitaires et véhicules de prestige, réalisées à domicile ou sur tout lieu convenu
              avec le client, dans un rayon de {CONTACT.radiusKm} km autour d&apos;Angers.
            </p>

            <h2>Article 3 — Devis et tarifs</h2>
            <p>
              Les tarifs affichés pour les formules Coup de Propre et Sortie de Concession sont
              indiqués « à partir de » et peuvent varier selon le gabarit et l&apos;état du
              véhicule. Les prestations complémentaires font systématiquement l&apos;objet
              d&apos;un devis préalable, communiqué avant toute intervention. Toute intervention
              débute uniquement après acceptation du devis par le client.
            </p>

            <h2>Article 4 — Réservation</h2>
            <p>
              La réservation s&apos;effectue par téléphone, WhatsApp, email ou via le formulaire
              de devis en ligne. Un rendez-vous est confirmé après échange avec {SITE.legalName}{' '}
              sur la date, le lieu et la nature de la prestation.
            </p>

            <h2>Article 5 — Exécution de la prestation</h2>
            <p>
              Le client s&apos;engage à mettre à disposition un accès approprié (eau, électricité
              si nécessaire) sur le lieu convenu. Le client est invité à retirer tout objet de
              valeur ou personnel du véhicule avant l&apos;intervention ; {SITE.legalName}{' '}
              décline toute responsabilité concernant les objets laissés à bord.
            </p>

            <h2>Article 6 — Paiement</h2>
            <p>
              Le règlement s&apos;effectue à l&apos;issue de la prestation, en espèces ou par
              virement bancaire, sauf accord contraire convenu au préalable.
            </p>

            <h2>Article 7 — Annulation et report</h2>
            <p>
              Toute annulation ou demande de report doit être signalée à {SITE.legalName}{' '}
              au minimum 24 heures à l&apos;avance, par téléphone ou WhatsApp.
            </p>
            <p>
              En cas d&apos;annulation ou de report effectué moins de 24 heures avant le
              rendez-vous, {SITE.legalName}{' '}se réserve le droit de facturer la prestation ou
              de retenir des frais d&apos;annulation.
            </p>
            <p>En cas d&apos;absence du client sans préavis, la prestation pourra être considérée comme due.</p>

            <h2>Article 8 — Responsabilité</h2>
            <p>
              {SITE.legalName}{' '}met en œuvre des produits et méthodes adaptés à chaque type de
              véhicule et de matière. Sa responsabilité ne saurait être engagée en cas de défaut
              préexistant du véhicule (usure, dommage antérieur, défaut de fabrication) non lié à
              la prestation réalisée.
            </p>

            <h2>Article 9 — Droit de rétractation</h2>
            <p>
              Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de
              rétractation ne s&apos;applique pas aux prestations de services pleinement exécutées
              avant la fin du délai de rétractation, lorsque leur exécution a commencé avec
              l&apos;accord préalable exprès du consommateur.
            </p>

            <h2>Article 10 — Réclamations</h2>
            <p>
              Toute réclamation peut être adressée à {SITE.legalName} par email à{' '}
              {CONTACT.email} ou par téléphone au {CONTACT.phoneDisplay}. Nous nous engageons à
              apporter une réponse dans les meilleurs délais.
            </p>

            <h2>Article 11 — Droit applicable</h2>
            <p>
              Les présentes conditions générales de vente sont soumises au droit français. Tout
              litige relève, à défaut de résolution amiable, de la compétence des tribunaux
              français.
            </p>

            <h2 id="bons-cadeaux">Article 12 — Bons cadeaux</h2>
            <p>
              Les bons cadeaux émis par {SITE.legalName}{' '}sont valables 1 an à compter de leur
              date d&apos;émission. Passé ce délai, ils ne peuvent plus être utilisés.
            </p>
            <p>
              Les bons cadeaux ne sont ni remboursables, ni échangeables contre de l&apos;argent,
              en tout ou partie. Ils sont utilisables en une ou plusieurs fois dans la limite du
              montant disponible et de leur durée de validité, sur l&apos;ensemble des prestations
              proposées par {SITE.legalName}.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
