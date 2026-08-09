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
    label: 'Camion',
    description: 'Camions et poids lourds',
    examples: 'Porteur, benne, semi-remorque…',
  },
  {
    id: 'tracteur',
    label: 'Tracteur',
    description: 'Tracteurs et engins agricoles',
    examples: 'Tracteur, moissonneuse, télescopique…',
  },
  {
    id: 'pelleteuse',
    label: 'Pelleteuse',
    description: 'Engins de chantier',
    examples: 'Pelleteuse, mini-pelle, chargeuse…',
  },
]

export function getVehicleType(id) {
  return VEHICLE_TYPES.find((v) => v.id === id)
}
