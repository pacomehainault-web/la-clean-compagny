'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function ParallaxImage({ src, alt, priority = false, speed = 0.12 }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = wrapRef.current
    if (!el) return

    let ticking = false

    function update() {
      const rect = el.parentElement.getBoundingClientRect()
      const center = rect.top + rect.height / 2 - window.innerHeight / 2
      const offset = Math.max(-40, Math.min(40, -center * speed))
      el.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`
      ticking = false
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [speed])

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
      <Image src={src} alt={alt} fill sizes="(max-width: 900px) 90vw, 480px" priority={priority} />
    </div>
  )
}
