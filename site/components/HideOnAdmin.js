'use client'

import { usePathname } from 'next/navigation'

// Masque l'habillage du site public (en-tête, pied de page, boutons flottants,
// bandeau cookies, mesure d'audience) sur le dashboard privé /admin.
export default function HideOnAdmin({ children }) {
  const pathname = usePathname() || ''
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null
  return children
}
