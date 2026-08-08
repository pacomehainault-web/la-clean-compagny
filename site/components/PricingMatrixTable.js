import styles from './PricingMatrixTable.module.css'
import { VEHICLE_TIERS, PRICED_TIER_IDS } from '@/lib/data/pricing'

const PRICED_TIERS = VEHICLE_TIERS.filter((t) => PRICED_TIER_IDS.includes(t.id))

export default function PricingMatrixTable({ services }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.serviceHeader}>Prestation</th>
            {PRICED_TIERS.map((tier) => (
              <th key={tier.id}>
                <span aria-hidden="true">{tier.emoji}</span>
                <span className={styles.tierLabel}>{tier.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td className={styles.serviceCell}>
                <div className={styles.serviceName}>{s.name}</div>
                {s.tagline && <div className={styles.serviceTagline}>{s.tagline}</div>}
                {s.includes && <div className={styles.serviceIncludes}>{s.includes.join(' · ')}</div>}
              </td>
              {PRICED_TIER_IDS.map((tierId) => (
                <td key={tierId} className={styles.priceCell}>
                  {s.prices[tierId]} €
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
