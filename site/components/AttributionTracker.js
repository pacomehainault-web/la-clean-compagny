'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureAttribution } from '@/lib/attribution'
import { trackContact } from '@/lib/track'

// Garde l'origine de la visite (pub, Google, réseaux…) pour la joindre au
// formulaire, et compte les clics sur « Appeler » et WhatsApp partout sur le site.
export default function AttributionTracker() {
  const pathname = usePathname()

  useEffect(() => {
    captureAttribution()
  }, [pathname])

  useEffect(() => {
    function onClick(e) {
      const a = e.target?.closest?.('a[href]')
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (href.startsWith('tel:')) trackContact('call')
      else if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) trackContact('whatsapp')
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  return null
}
