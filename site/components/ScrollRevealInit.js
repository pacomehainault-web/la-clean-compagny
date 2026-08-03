'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollRevealInit() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    const elements = document.querySelectorAll('.reveal:not(.is-visible)')
    elements.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [pathname])

  return null
}
