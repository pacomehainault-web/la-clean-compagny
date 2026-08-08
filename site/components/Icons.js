function VehicleBase({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 120 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconCitadine(props) {
  return (
    <VehicleBase {...props}>
      <path d="M14,46 L14,34 C14,26 20,20 28,19 L34,13 C38,9.5 44,7.5 50,7.5 L64,7.5 C69,7.5 73,10 75,15 L79,20 C89,21 98,26 104,34 L104,46 Z" />
      <line x1="14" y1="46" x2="104" y2="46" />
      <circle cx="32" cy="46" r="7.5" fill="currentColor" stroke="none" />
      <circle cx="90" cy="46" r="7.5" fill="currentColor" stroke="none" />
    </VehicleBase>
  )
}

export function IconBerline(props) {
  return (
    <VehicleBase {...props}>
      <path d="M8,46 L8,36 C8,30 12,26 18,25 L28,15 C32,11 38,9 44,9 L60,9 C65,9 69,11.5 72,16 L78,24 L96,26 C103,27 110,31 111,37 L111,46 Z" />
      <line x1="8" y1="46" x2="111" y2="46" />
      <line x1="18" y1="25" x2="78" y2="24" />
      <circle cx="28" cy="46" r="7.5" fill="currentColor" stroke="none" />
      <circle cx="94" cy="46" r="7.5" fill="currentColor" stroke="none" />
    </VehicleBase>
  )
}

export function IconSUV(props) {
  return (
    <VehicleBase {...props}>
      <path d="M13,46 L13,28 L23,15 L96,15 C104,15 111,21 111,29 L111,46 Z" />
      <line x1="13" y1="46" x2="111" y2="46" />
      <line x1="23" y1="15" x2="23" y2="46" />
      <circle cx="32" cy="46" r="8.5" fill="currentColor" stroke="none" />
      <circle cx="92" cy="46" r="8.5" fill="currentColor" stroke="none" />
    </VehicleBase>
  )
}

export function IconMonospace(props) {
  return (
    <VehicleBase {...props}>
      <path d="M12,46 L12,22 C12,14 18,9.5 26,9.5 L96,9.5 C104,9.5 111,14 111,22 L111,46 Z" />
      <line x1="12" y1="46" x2="111" y2="46" />
      <line x1="70" y1="9.5" x2="70" y2="46" />
      <circle cx="31" cy="46" r="7.5" fill="currentColor" stroke="none" />
      <circle cx="94" cy="46" r="7.5" fill="currentColor" stroke="none" />
    </VehicleBase>
  )
}

export function IconUtilitaire(props) {
  return (
    <VehicleBase {...props}>
      <path d="M8,46 L8,24 C8,15.5 15,11 23,11 L99,11 C107,11 113,16.5 113,25 L113,46 Z" />
      <rect x="15" y="18" width="15" height="12" rx="1.5" />
      <line x1="8" y1="46" x2="113" y2="46" />
      <line x1="36" y1="11" x2="36" y2="46" />
      <circle cx="26" cy="46" r="7.5" fill="currentColor" stroke="none" />
      <circle cx="97" cy="46" r="7.5" fill="currentColor" stroke="none" />
    </VehicleBase>
  )
}

export function IconCamion(props) {
  return (
    <VehicleBase {...props}>
      <path d="M8,46 L8,30 C8,25 12,21 17,21 L26,21 L32,12 C34,9.5 37,8 40,8 L48,8 L48,46 Z" />
      <rect x="48" y="10" width="60" height="36" />
      <line x1="8" y1="46" x2="108" y2="46" />
      <circle cx="26" cy="46" r="7" fill="currentColor" stroke="none" />
      <circle cx="90" cy="46" r="7" fill="currentColor" stroke="none" />
    </VehicleBase>
  )
}

export function IconTracteur(props) {
  return (
    <VehicleBase {...props}>
      <path d="M10,48 L10,40 L26,26 L26,14 L48,14 L48,34 L64,34" />
      <line x1="30" y1="26" x2="30" y2="12" />
      <line x1="27" y1="12" x2="33" y2="12" />
      <line x1="4" y1="48" x2="94" y2="48" />
      <circle cx="21" cy="48" r="8" fill="currentColor" stroke="none" />
      <circle cx="72" cy="44" r="13" fill="currentColor" stroke="none" />
    </VehicleBase>
  )
}

export function IconPelleteuse(props) {
  return (
    <VehicleBase {...props}>
      <rect x="8" y="42" width="60" height="10" rx="5" />
      <circle cx="18" cy="52" r="3" fill="currentColor" stroke="none" />
      <circle cx="30" cy="52" r="3" fill="currentColor" stroke="none" />
      <circle cx="46" cy="52" r="3" fill="currentColor" stroke="none" />
      <circle cx="58" cy="52" r="3" fill="currentColor" stroke="none" />
      <path d="M18,42 L18,26 C18,23 20,21 23,21 L42,21 C45,21 47,23 47,26 L47,42 Z" />
      <path d="M38,24 L66,8 L92,20" />
      <path d="M92,19 L101,25 L93,34 L83,29 Z" fill="currentColor" stroke="none" />
    </VehicleBase>
  )
}

export const VEHICLE_ICONS = {
  citadine: IconCitadine,
  berline: IconBerline,
  suv: IconSUV,
  monospace: IconMonospace,
  utilitaire: IconUtilitaire,
  camion: IconCamion,
  tracteur: IconTracteur,
  pelleteuse: IconPelleteuse,
}

function UiBase({ children, size = 22, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconCheck(props) {
  return (
    <UiBase {...props}>
      <polyline points="20 6 9 17 4 12" />
    </UiBase>
  )
}

export function IconChevronDown(props) {
  return (
    <UiBase {...props}>
      <polyline points="6 9 12 15 18 9" />
    </UiBase>
  )
}

export function IconChevronRight(props) {
  return (
    <UiBase {...props}>
      <polyline points="9 6 15 12 9 18" />
    </UiBase>
  )
}

export function IconArrowRight(props) {
  return (
    <UiBase {...props}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </UiBase>
  )
}

export function IconMenu(props) {
  return (
    <UiBase {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </UiBase>
  )
}

export function IconClose(props) {
  return (
    <UiBase {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </UiBase>
  )
}

export function IconPhone(props) {
  return (
    <UiBase {...props}>
      <path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 2 6a2 2 0 0 1 2-2Z" />
    </UiBase>
  )
}

export function IconMapPin(props) {
  return (
    <UiBase {...props}>
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </UiBase>
  )
}

export function IconClock(props) {
  return (
    <UiBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </UiBase>
  )
}

export function IconShield(props) {
  return (
    <UiBase {...props}>
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3Z" />
      <polyline points="9 12 11.5 14.5 15.5 9.5" />
    </UiBase>
  )
}

export function IconDroplet(props) {
  return (
    <UiBase {...props}>
      <path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12Z" />
    </UiBase>
  )
}

export function IconSparkle(props) {
  return (
    <UiBase {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
    </UiBase>
  )
}

export function IconStar(props) {
  return (
    <UiBase fill="currentColor" stroke="none" {...props}>
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6 6.1 20.6l1.3-6.6-4.9-4.6 6.6-.8L12 2.5Z" />
    </UiBase>
  )
}

export function IconLeaf(props) {
  return (
    <UiBase {...props}>
      <path d="M5 20c9 0 14-5 14-14V4h-2C8 4 5 11 5 19v1Z" />
      <line x1="5" y1="20" x2="14" y2="11" />
    </UiBase>
  )
}

export function IconEye(props) {
  return (
    <UiBase {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </UiBase>
  )
}

export function IconTarget(props) {
  return (
    <UiBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </UiBase>
  )
}

export function IconGift(props) {
  return (
    <UiBase {...props}>
      <rect x="3" y="9" width="18" height="12" rx="1.5" />
      <line x1="3" y1="14" x2="21" y2="14" />
      <line x1="12" y1="9" x2="12" y2="21" />
      <path d="M12 9C12 6 9.5 4 7.5 4S4 5.5 4 7.5 6 9 12 9Z" />
      <path d="M12 9c0-3 2.5-5 4.5-5S20 5.5 20 7.5 18 9 12 9Z" />
    </UiBase>
  )
}

export function IconInvoice(props) {
  return (
    <UiBase {...props}>
      <path d="M6 2h9l3 3v17H6z" />
      <path d="M15 2v3h3" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </UiBase>
  )
}

export function IconPercent(props) {
  return (
    <UiBase {...props}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </UiBase>
  )
}

export function IconMail(props) {
  return (
    <UiBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </UiBase>
  )
}

// Logo officiel WhatsApp (glyphe exact, source : Simple Icons, licence CC0/MIT — https://simpleicons.org)
export function IconWhatsapp(props) {
  return (
    <UiBase fill="currentColor" stroke="none" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </UiBase>
  )
}

export function IconInstagram(props) {
  return (
    <UiBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </UiBase>
  )
}

export function IconTiktok(props) {
  return (
    <UiBase fill="currentColor" stroke="none" {...props}>
      <path d="M14 3c.4 2 2 3.5 4 3.8V10c-1.4 0-2.8-.4-4-1.2v6.3a5.6 5.6 0 1 1-5.6-5.6c.3 0 .5 0 .8.1v3.1a2.5 2.5 0 1 0 1.8 2.4V3h3Z" />
    </UiBase>
  )
}

export function IconFacebook(props) {
  return (
    <UiBase fill="currentColor" stroke="none" {...props}>
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.8h2.5V21h3Z" />
    </UiBase>
  )
}

export function IconUpload(props) {
  return (
    <UiBase {...props}>
      <path d="M12 16V4" />
      <polyline points="7 9 12 4 17 9" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </UiBase>
  )
}

export function IconMotion(props) {
  return (
    <UiBase {...props}>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
      <path d="M3 9c-.7 1-1 2-1 3s.3 2 1 3" strokeLinecap="round" />
      <path d="M21 9c.7 1 1 2 1 3s-.3 2-1 3" strokeLinecap="round" />
    </UiBase>
  )
}

export function IconSlideArrows(props) {
  return (
    <UiBase {...props} strokeWidth="2.4">
      <path d="M8 6L2 12L8 18" />
      <path d="M16 6L22 12L16 18" />
    </UiBase>
  )
}

export function IconGoogleG({ size = 22, ...props }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v9h11.9c-.5 2.8-2.1 5.1-4.4 6.7v5.6h7.1c4.2-3.9 6.5-9.6 6.5-16.7Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.6c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9.1H4.5v5.7C8.1 41.1 15.4 46 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.8 28.1c-.4-1.3-.7-2.7-.7-4.1s.2-2.8.7-4.1v-5.7H4.5C3 17.1 2.2 20.4 2.2 24s.8 6.9 2.3 9.8l7.3-5.7Z"
      />
      <path
        fill="#EA4335"
        d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.2l7.3 5.7c1.7-5.3 6.5-9.1 12.2-9.1Z"
      />
    </svg>
  )
}

export function IconLinkedin(props) {
  return (
    <UiBase fill="currentColor" stroke="none" {...props}>
      <path d="M6.9 8.6H3.9V20h3V8.6ZM5.4 4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.1 20h-3v-6c0-1.4-.5-2.4-1.8-2.4-1 0-1.6.7-1.9 1.3-.1.2-.1.6-.1.9v6.2h-3s.1-10.4 0-11.4h3v1.6c.4-.6 1.1-1.5 2.8-1.5 2.1 0 3.6 1.4 3.6 4.3V20Z" />
    </UiBase>
  )
}
