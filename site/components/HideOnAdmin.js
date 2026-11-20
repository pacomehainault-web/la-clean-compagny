'use client'

import { usePathname } from 'next/navigation'

// Masque l'habillage du site public (en-tête, pied de page, boutons flottants,
// bandeau cookies, mesure d'audience) sur l'espace équipe (dashboard privé).
export default function HideOnAdmin({ children }) {
  const pathname = usePathname() || ''
  if (pathname.startsWith('/equipe-') || pathname.startsWith('/admin')) return null
  return children
}
