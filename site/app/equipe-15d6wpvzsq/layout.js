// Police de l'espace équipe : Archivo variable avec l'axe de largeur
// (étendue pour les titres et les chiffres, normale pour le texte), auto-hébergée.
import '@fontsource-variable/archivo/wdth.css'

// Espace privé : jamais indexé, jamais en cache partagé.
export const metadata = {
  title: 'Espace équipe',
  robots: { index: false, follow: false },
}

export const viewport = {
  themeColor: '#0F1B33',
}

export default function TeamLayout({ children }) {
  return children
}
