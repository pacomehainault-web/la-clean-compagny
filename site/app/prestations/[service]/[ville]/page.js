import { notFound } from "next/navigation";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import FAQAccordion from "@/components/FAQAccordion";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import ComparisonTable from "@/components/ComparisonTable";
import ReviewCards from "@/components/ReviewCards";
import PricingMatrixTable from "@/components/PricingMatrixTable";
import { IconArrowRight, IconCheck } from "@/components/Icons";
import {
  FORMULAS_PRICING,
  EXTERIOR_PRICING,
  CORRECTION_PRICING,
} from "@/lib/data/pricing";
import { getServicePage } from "@/lib/data/servicePages";
import { getCity, cityHref } from "@/lib/data/cities";
import { getCityContent } from "@/lib/data/cityContent";
import {
  SERVICE_CITY_PAGES,
  getServiceCityPage,
  serviceCityHref,
} from "@/lib/data/serviceCityPages";
import { CONTACT, telLink } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import { faqPageSchema, breadcrumbSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/seo";
import styles from "../page.module.css";

// Page « prestation + commune » : une prestation précise dans une commune
// précise (cf. lib/data/serviceCityPages.js pour le texte propre à chaque page).

const PRICE_GRIDS = {
  "nettoyage-interieur-voiture": FORMULAS_PRICING,
  "lavage-exterieur-domicile": EXTERIOR_PRICING,
  "lustrage-polissage": CORRECTION_PRICING,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_CITY_PAGES.map((p) => ({ service: p.service, ville: p.city }));
}

function resolve(params) {
  const page = getServiceCityPage(params.service, params.ville);
  if (!page) return null;
  const service = getServicePage(page.service);
  const city = getCity(page.city);
  if (!service || !city) return null;
  return { page, service, city };
}

export async function generateMetadata({ params }) {
  const data = resolve(await params);
  if (!data) return {};
  const { page, service, city } = data;
  return buildMetadata({
    title: `${service.name} à ${city.name} dès ${service.fromPrice} €`,
    description: `${service.name} à domicile à ${city.name} dès ${service.fromPrice} €, déplacement inclus. Intervention chez vous ou au travail, devis en ligne, réponse sous 24h ouvrées.`,
    path: serviceCityHref(page),
  });
}

export default async function ServiceCityPage({ params }) {
  const data = resolve(await params);
  if (!data) notFound();
  const { page, service, city } = data;
  const local = getCityContent(city.slug);
  const prices = PRICE_GRIDS[service.slug];
  const pairs = service.realisations?.pairs || [];
  const offset = city.slug.length % Math.max(1, pairs.length);
  const shownPairs = pairs.map((_, i) => pairs[(i + offset) % pairs.length]);
  const title = `${service.name} à ${city.name}`;

  const checks = [
    `Chez vous ou au travail, à ${city.name}`,
    "Sans frais de déplacement",
    "Réponse sous 24h ouvrées",
    "Prix fixé au devis, sans surprise",
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    serviceType: service.name,
    url: absoluteUrl(serviceCityHref(page)),
    provider: { "@id": absoluteUrl("/#business") },
    areaServed: { "@type": "City", name: city.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: service.fromPrice,
        minPrice: service.fromPrice,
        priceCurrency: "EUR",
      },
    },
  };

  return (
    <>
      <JsonLd data={schema} />
      <JsonLd data={faqPageSchema(page.faq)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Prestations", path: "/prestations" },
          { name: service.name, path: `/prestations/${service.slug}` },
          { name: city.name, path: serviceCityHref(page) },
        ])}
      />

      <PageHero
        eyebrow={`${service.name} · ${service.priceLine}`}
        title={title}
        lead={page.lead}
        breadcrumb={[
          { label: "Prestations", href: "/prestations" },
          { label: service.name, href: `/prestations/${service.slug}` },
          { label: city.name },
        ]}
      />

      <section className={`section-tight ${styles.formBand}`}>
        <div className={`container ${styles.formBandInner}`}>
          <div className={styles.formBandText}>
            <span className={styles.formBandPrice}>
              {title} · {service.priceLine}
            </span>
            <ul className={styles.quickChecks}>
              {checks.map((c) => (
                <li key={c}>
                  <IconCheck size={18} />
                  {c}
                </li>
              ))}
            </ul>
            <div className={styles.formBandCtas}>
              <Link href="/devis" className="btn btn-cta">
                Réserver en ligne
                <IconArrowRight size={18} />
              </Link>
              <a href={telLink()} className="btn btn-outline">
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>
          <div className={styles.formBandForm}>
            <LeadForm
              source={`prestation-${service.slug}-${city.slug}`}
              title={`${city.name} : être rappelé`}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className={styles.prose}>
            <h2>
              {service.name} à domicile à {city.name}
            </h2>
            {page.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            {local?.sectors?.length > 0 && (
              <p>
                <strong>Secteurs desservis à {city.name} :</strong>{" "}
                {local.sectors.join(", ")}.
              </p>
            )}
            <p>
              Tout le détail de la prestation est sur la page{" "}
              <Link
                href={`/prestations/${service.slug}`}
                className={styles.inlineLink}
              >
                {service.name.toLowerCase()}
              </Link>
              , et toutes nos prestations à {city.name} sur la page{" "}
              <Link href={cityHref(city)} className={styles.inlineLink}>
                nettoyage voiture à {city.name}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {prices && (
        <section className="section section-alt">
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="eyebrow">Tarifs à {city.name}</span>
              <h2>Les mêmes prix qu&apos;à Angers, déplacement inclus</h2>
            </div>
            <PricingMatrixTable services={prices} />
            <p className={styles.priceNote}>
              Prix de départ selon le gabarit du véhicule. Le prix exact est
              confirmé au devis selon l&apos;état du véhicule.
            </p>
          </div>
        </section>
      )}

      {shownPairs.length > 0 && (
        <section className="section">
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="eyebrow">La preuve par l&apos;image</span>
              <h2>Nos réalisations en nettoyage intérieur</h2>
            </div>
            <div className={styles.realisationsGrid}>
              {shownPairs.map((pair) => (
                <div className={styles.realisationCard} key={pair.before}>
                  <BeforeAfterSlider
                    before={pair.before}
                    after={pair.after}
                    alt={pair.alt}
                  />
                  <p className={styles.realisationCaption}>{pair.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Avis clients</span>
            <h2>Ils nous ont confié leur voiture</h2>
          </div>
          <ReviewCards offset={city.slug.length} />
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1000 }}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Comparer avant de choisir</span>
            <h2>À domicile, en station ou vous-même ?</h2>
          </div>
          <ComparisonTable />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2>{title} : vos questions</h2>
          </div>
          <FAQAccordion items={page.faq} />
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.finalGrid}`}>
          <div className={styles.finalText}>
            <span className="eyebrow">
              {city.name} · {city.distanceKm} km d&apos;Angers
            </span>
            <h2 style={{ marginTop: 14 }}>
              Réservez votre {service.name.toLowerCase()} à {city.name}
            </h2>
            <div
              style={{
                marginTop: 28,
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <Link href="/devis" className="btn btn-cta">
                Voir les tarifs et réserver
                <IconArrowRight size={18} />
              </Link>
              <a href={telLink()} className="btn btn-outline">
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>
          <div className={styles.finalForm}>
            <LeadForm
              variant="dark"
              source={`prestation-${service.slug}-${city.slug}-bas`}
              title="Recevoir mon prix"
              subtitle="Laissez votre numéro, Enzo vous rappelle sous 24h ouvrées."
              withVehicle
            />
          </div>
        </div>
      </section>
    </>
  );
}
