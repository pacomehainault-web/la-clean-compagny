import { SITE, CONTACT, SOCIALS } from '@/lib/constants'
import { FORMULAS, COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT } from '@/lib/data/services'
import { SERVICE_PAGES } from '@/lib/data/servicePages'
import { CITIES } from '@/lib/data/cities'
import { FAQ_ITEMS } from '@/lib/data/faq'

export const dynamic = 'force-static'

// /llms.txt : fiche d'identité lisible par les IA (ChatGPT, Perplexity, Claude, Gemini…).
// Générée à partir des mêmes données que le site : prix et zones toujours à jour.
export function GET() {
  const u = (p) => new URL(p, SITE.url).toString()
  const price = (n) => (n ? `à partir de ${n} € TTC` : 'sur devis')
  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.name} est une entreprise de nettoyage et de detailing automobile à domicile basée à Angers (Maine-et-Loire, 49), fondée en ${SITE.foundedYear} par ${SITE.gerant}. Intervention chez le client ou sur son lieu de travail, sans frais de déplacement dans un rayon de ${CONTACT.radiusKm} km autour d'Angers, du lundi au samedi sur rendez-vous.`,
    '',
    '## Infos clés',
    `- Activité : nettoyage intérieur et extérieur de voiture à domicile, lustrage, polissage, traitement céramique, rénovation des optiques, désinfection à l'ozone, nettoyage de moto, canapés et matelas`,
    `- Zone : Angers et ${CITIES.filter((c) => c.slug !== 'angers').map((c) => c.name).join(', ')}`,
    `- Téléphone : ${CONTACT.phoneDisplay} · Email : ${CONTACT.email}`,
    `- Réservation en ligne : ${u('/reserver')}`,
    `- Avis Google : ${CONTACT.googleBusinessUrl}`,
    `- Entreprise : ${SITE.legalName}, SIRET ${SITE.siret}, TVA ${SITE.vatNumber}. ${SITE.vatNote}.`,
    `- Nom parfois écrit « La Clean Company » : il s'agit de la même entreprise.`,
    '',
    '## Formules et tarifs (prix de départ, selon le gabarit du véhicule)',
    ...FORMULAS.map((f) => `- ${f.name} : ${price(f.basePrice)}${f.duration ? `, durée ${f.duration}` : ''}. ${f.tagline || ''}`.trim()),
    ...[...COMPLEMENTARY_SERVICES, OPTICS_RENOVATION, OZONE_TREATMENT].map((s) => `- ${s.name} : ${price(s.basePrice)}`),
    '',
    '## Pages principales',
    `- [Accueil](${u('/')})`,
    `- [Tarifs et prestations](${u('/prestations')})`,
    ...SERVICE_PAGES.map((s) => `- [${s.name}](${u(`/prestations/${s.slug}`)})`),
    `- [Zone d'intervention](${u('/zone-intervention')})`,
    `- [Avis clients](${u('/avis')})`,
    `- [Questions fréquentes](${u('/faq')})`,
    `- [Espace professionnels et garages](${u('/pro')})`,
    `- [Conseils d'entretien](${u('/conseils')})`,
    '',
    '## Questions fréquentes',
    ...FAQ_ITEMS.slice(0, 8).flatMap((q) => [`### ${q.question}`, q.answer, '']),
    '## Réseaux',
    ...Object.entries(SOCIALS).map(([k, v]) => `- ${k} : ${v}`),
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
