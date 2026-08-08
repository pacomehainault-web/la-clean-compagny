import PageHero from '@/components/PageHero'
import ContactForm from '@/components/ContactForm'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import { IconMapPin, IconPhone, IconMail, IconWhatsapp } from '@/components/Icons'
import { CONTACT, telLink, mailtoLink, whatsappLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Contact',
  description:
    "Contactez La Clean Compagny à Angers : téléphone, WhatsApp, email ou formulaire en ligne. Réponse rapide pour organiser votre prestation de detailing automobile.",
  path: '/contact',
})

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Parlons de votre véhicule"
        lead="Une question, un devis, une urgence ? Nous vous répondons rapidement par téléphone, WhatsApp, email ou via le formulaire ci-dessous."
        breadcrumb={[{ label: 'Contact' }]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.layout}>
            <div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <IconMapPin size={20} />
                  <div>
                    <div className={styles.infoTitle}>Zone d&apos;intervention</div>
                    <div className={styles.infoText}>
                      Intervention à domicile à {CONTACT.city} et dans un rayon de{' '}
                      {CONTACT.radiusKm} km
                    </div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <IconPhone size={20} />
                  <div>
                    <div className={styles.infoTitle}>Téléphone</div>
                    <div className={styles.infoText}>
                      <a href={telLink()}>{CONTACT.phoneDisplay}</a>
                    </div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <IconWhatsapp size={20} style={{ color: '#25D366' }} />
                  <div>
                    <div className={styles.infoTitle}>WhatsApp</div>
                    <div className={styles.infoText}>
                      <a href={whatsappLink('Bonjour La Clean Compagny,')} target="_blank" rel="noopener noreferrer">
                        Discuter sur WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <IconMail size={20} />
                  <div>
                    <div className={styles.infoTitle}>Email</div>
                    <div className={styles.infoText}>
                      <a href={mailtoLink({})}>{CONTACT.email}</a>
                    </div>
                  </div>
                </div>
              </div>
              <GoogleMapEmbed height={280} />
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Envoyez-nous un message</h2>
              <p className="lead" style={{ marginBottom: 24 }}>
                Réponse sous 24h ouvrées.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
