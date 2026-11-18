export const VEHICLE_TYPES = [
  {
    id: 'citadine',
    label: 'Citadine',
    description: 'Petites voitures urbaines',
    examples: 'Clio, 208, Twingo, Polo…',
  },
  {
    id: 'berline',
    label: 'Berline',
    description: 'Compactes et berlines',
    examples: 'Golf, Mégane, Série 3, A4…',
  },
  {
    id: 'suv',
    label: 'SUV',
    description: 'SUV et crossovers',
    examples: 'X3, Tiguan, Q5, GLC…',
  },
  {
    id: 'monospace',
    label: 'Monospace',
    description: 'Monospaces et grands gabarits',
    examples: 'Scenic, 5008, Touran…',
  },
  {
    id: 'moto',
    label: 'Moto',
    description: 'Motos et scooters',
    examples: 'Roadster, trail, custom, scooter…',
  },
  {
    id: 'utilitaire',
    label: 'Utilitaire',
    description: 'Fourgons et utilitaires',
    examples: 'Trafic, Jumpy, Transit…',
  },
  {
    id: 'camion',
    proOnly: true,
    label: 'Camion',
    description: 'Camions et poids lourds',
    examples: 'Porteur, benne, semi-remorque…',
  },
  {
    id: 'tracteur',
    proOnly: true,
    label: 'Tracteur',
    description: 'Tracteurs et engins agricoles',
    examples: 'Tracteur, moissonneuse, télescopique…',
  },
  {
    id: 'pelleteuse',
    proOnly: true,
    label: 'Pelleteuse',
    description: 'Engins de chantier',
    examples: 'Pelleteuse, mini-pelle, chargeuse…',
  },
]

// Gabarits affichés aux particuliers (page d'accueil) : les poids lourds,
// engins agricoles et engins de chantier (`proOnly`) ne sont présentés que sur
// /pro — sur l'accueil, ils brouillaient le message « nettoyage de voiture ».
// Le configurateur de devis (QuoteWizard) continue de tous les proposer.
export const PRIVATE_VEHICLE_TYPES = VEHICLE_TYPES.filter((v) => !v.proOnly)

export function getVehicleType(id) {
  return VEHICLE_TYPES.find((v) => v.id === id)
}
