'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const STORAGE_KEY = 'lcc-cookie-consent'

// Pixel Meta (Facebook / Instagram) : mesure des demandes venues des pubs.
// Inactif tant que NEXT_PUBLIC_META_PIXEL_ID n'est pas renseigné dans Vercel,
// et chargé seulement si le visiteur a accepté les cookies.
export default function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const pathname = usePathname()
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    const check = () => setConsented(window.localStorage.getItem(STORAGE_KEY) === 'accepted')
    check()
    window.addEventListener('lcc-consent-change', check)
    return () => window.removeEventListener('lcc-consent-change', check)
  }, [])

  // Page vue à chaque changement de page (navigation sans rechargement).
  useEffect(() => {
    if (consented && typeof window.fbq === 'function') window.fbq('track', 'PageView')
  }, [pathname, consented])

  if (!pixelId || !/^\d{6,20}$/.test(pixelId) || !consented) return null

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `}
    </Script>
  )
}
