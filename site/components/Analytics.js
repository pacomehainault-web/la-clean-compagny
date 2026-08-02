'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const STORAGE_KEY = 'lcc-cookie-consent'

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    const check = () => setConsented(window.localStorage.getItem(STORAGE_KEY) === 'accepted')
    check()
    window.addEventListener('lcc-consent-change', check)
    return () => window.removeEventListener('lcc-consent-change', check)
  }, [])

  if (!gaId || !consented) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
