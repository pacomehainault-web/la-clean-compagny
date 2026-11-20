// Police de l'espace équipe : Archivo variable avec l'axe de largeur
// (étendue pour les titres et les chiffres, normale pour le texte), auto-hébergée.
import '@fontsource-variable/archivo/wdth.css'

// Espace privé : jamais indexé, jamais en cache partagé.
// Le manifest et les icônes permettent d'installer l'espace sur l'écran d'accueil
// (indispensable pour recevoir les notifications sur iPhone).
export const metadata = {
  title: 'Espace équipe',
  robots: { index: false, follow: false },
  manifest: '/equipe-15d6wpvzsq/manifest.webmanifest',
  icons: {
    icon: [{ url: '/images/app/equipe-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/images/app/equipe-apple-180.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'La Clean',
    statusBarStyle: 'black-translucent',
  },
}

// viewportFit « cover » : en app installée, la barre bleu nuit passe sous l'heure et la batterie
// (les marges de sécurité sont gérées dans admin.module.css).
export const viewport = {
  themeColor: '#0F1B33',
  viewportFit: 'cover',
}

export default function TeamLayout({ children }) {
  return children
}
