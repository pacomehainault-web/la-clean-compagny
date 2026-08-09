export const VEHICLE_TYPES = [
  {
    id: 'citadine',
    label: 'Citadine',
    description: 'Petites voitures urbaines',
    examples: 'Clio, 208, Twingo, Polo…',
    priceMultiplier: 1,
  },
  {
    id: 'berline',
    label: 'Berline',
    description: 'Compactes et berlines',
    examples: 'Golf, Mégane, Série 3, A4…',
    priceMultiplier: 1.15,
  },
  {
    id: 'suv',
    label: 'SUV',
    description: 'SUV et crossovers',
    examples: 'X3, Tiguan, Q5, GLC…',
    priceMultiplier: 1.3,
  },
  {
    id: 'monospace',
    label: 'Monospace',
    description: 'Monospaces et grands gabarits',
    examples: 'Scenic, 5008, Touran…',
    priceMultiplier: 1.35,
  },
  {
    id: 'moto',
    label: 'Moto',
    description: 'Motos et scooters',
    examples: 'Roadster, trail, custom, scooter…',
    priceMultiplier: 0.6,
  },
  {
    id: 'utilitaire',
    label: 'Utilitaire',
    description: 'Fourgons et utilitaires',
    examples: 'Trafic, Jumpy, Transit…',
    priceMultiplier: 1.5,
  },
  {
    id: 'camion',
    label: 'Camion',
    description: 'Camions et poids lourds',
    examples: 'Porteur, benne, semi-remorque…',
    priceMultiplier: 1.8,
  },
  {
    id: 'tracteur',
    label: 'Tracteur',
    description: 'Tracteurs et engins agricoles',
    examples: 'Tracteur, moissonneuse, télescopique…',
    priceMultiplier: 2,
  },
  {
    id: 'pelleteuse',
    label: 'Pelleteuse',
    description: 'Engins de chantier',
    examples: 'Pelleteuse, mini-pelle, chargeuse…',
    priceMultiplier: 2.2,
  },
]

export function getVehicleType(id) {
  return VEHICLE_TYPES.find((v) => v.id === id)
}
