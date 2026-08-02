import { CONTACT } from '@/lib/constants'

export default function GoogleMapEmbed({ height = 400 }) {
  return (
    <iframe
      src={CONTACT.mapEmbedSrc}
      title={`Localisation de ${CONTACT.fullAddress}`}
      width="100%"
      height={height}
      style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
