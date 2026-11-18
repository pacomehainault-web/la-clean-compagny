import Image from 'next/image'
import styles from './HeroMedia.module.css'

// Image plein cadre du hero de l'accueil. Elle était auparavant animée en
// synchronisation avec l'écran d'intro (Preloader / IntroSequence), supprimé en
// novembre 2026 : le visiteur voit désormais directement la page, et l'image
// (élément LCP) s'affiche sans attendre de JavaScript.
export default function HeroMedia({ src, alt }) {
  return (
    <div className={styles.wrap}>
      <Image src={src} alt={alt} fill sizes="100vw" priority quality={85} className={styles.image} />
    </div>
  )
}
