import PageHero from '@/components/PageHero'
import { SITE, CONTACT } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from '../legal.module.css'

export const metadata = buildMetadata({
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et protection des données personnelles de La Clean Compagny.',
  path: '/politique-de-confidentialite',
})

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Vos données"
        title="Politique de confidentialité"
        breadcrumb={[{ label: 'Politique de confidentialité' }]}
      />
      <section className="section">
        <div className="container">
          <div className={styles.prose}>
            <p className={styles.updated}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>

            <h2>Responsable de traitement</h2>
            <p>
              {SITE.legalName}, représentée par {SITE.gerant}, est responsable du traitement des
              données personnelles collectées sur ce site. Vous pouvez nous contacter à{' '}
              {CONTACT.email} ou au {CONTACT.phoneDisplay}.
            </p>

            <h2>Données collectées</h2>
            <p>
              Lorsque vous utilisez notre formulaire de devis, notre formulaire de contact ou nos
              liens WhatsApp/email, nous sommes amenés à collecter les données suivantes :
            </p>
            <ul>
              <li>Nom et prénom</li>
              <li>Numéro de téléphone</li>
              <li>Adresse email</li>
              <li>Contenu de votre message et informations relatives à votre véhicule</li>
            </ul>
            <p>
              Ces données sont transmises directement via votre application WhatsApp ou votre
              messagerie email lorsque vous cliquez sur les boutons d&apos;envoi : elles ne
              transitent pas par un serveur intermédiaire ni par une base de données de ce site.
            </p>

            <h2>Finalité du traitement</h2>
            <p>
              Ces données sont utilisées exclusivement pour répondre à vos demandes de devis ou
              d&apos;information, organiser nos prestations et assurer le suivi de la relation
              client. Elles ne font l&apos;objet d&apos;aucune cession ou vente à des tiers.
            </p>

            <h2>Base légale</h2>
            <p>
              Le traitement de vos données repose sur votre consentement (envoi volontaire d&apos;un
              formulaire) et sur l&apos;intérêt légitime de {SITE.legalName}{' '}à répondre à vos
              demandes commerciales.
            </p>

            <h2>Durée de conservation</h2>
            <p>
              Vos données sont conservées le temps nécessaire au traitement de votre demande et,
              le cas échéant, à la durée de la relation commerciale, augmentée des délais légaux
              de prescription applicables.
            </p>

            <h2>Cookies</h2>
            <p>
              Ce site peut utiliser des cookies de mesure d&apos;audience (statistiques de
              visite) afin de comprendre l&apos;utilisation du site et l&apos;améliorer. Ces
              cookies ne sont déposés qu&apos;après votre consentement explicite, recueilli via
              le bandeau affiché lors de votre première visite. Vous pouvez à tout moment modifier
              votre choix en réinitialisant les données de ce site dans votre navigateur.
            </p>

            <h2>Vos droits</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de
              rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité
              de vos données. Pour exercer ces droits, contactez-nous à {CONTACT.email}.
            </p>
            <p>
              Vous disposez également du droit d&apos;introduire une réclamation auprès de la
              Commission Nationale de l&apos;Informatique et des Libertés (CNIL) —{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
                www.cnil.fr
              </a>
              .
            </p>

            <h2>Sécurité</h2>
            <p>
              Nous mettons en œuvre les mesures raisonnables nécessaires pour préserver la
              sécurité et la confidentialité de vos données et empêcher tout accès non autorisé.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
