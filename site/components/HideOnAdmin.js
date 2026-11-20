'use client'

import { usePathname } from 'next/navigation'

// Masque l'habillage du site public (en-tête, pied de page, boutons flottants,
// bandeau cookies, mesure d'audience) sur l'espace équipe (dashboard privé)
// et sur les pages de suivi client (écran type application).
export default function HideOnAdmin({ children }) {
  const pathname = usePathname() || ''
  if (pathname.startsWith('/equipe-') || pathname.startsWith('/admin') || pathname.startsWith('/suivi/')) return null
  return children
}
