// Espace privé : jamais indexé, jamais en cache partagé.
export const metadata = {
  title: 'Espace équipe',
  robots: { index: false, follow: false },
}

export default function TeamLayout({ children }) {
  return children
}
