import { CONTACT } from '@/lib/constants'

export default function GoogleMapEmbed({ height = 400 }) {
  return (
    <iframe
      src={CONTACT.mapEmbedSrc}
      title={`Zone d'intervention de La Clean Compagny à ${CONTACT.city}`}
      width="100%"
      height={height}
      style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
