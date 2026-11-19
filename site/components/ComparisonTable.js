import styles from './ComparisonTable.module.css'

// Comparatif « à domicile / station de lavage / vous-même », utilisé sur
// l'accueil et sur chaque page commune.
const ROWS = [
  { label: 'Déplacement', us: 'Nous venons chez vous ou au travail', station: 'Vous vous déplacez', diy: 'Aucun' },
  { label: 'Votre temps', us: 'Aucun : vous nous confiez les clés', station: "30 min à 1h d'attente et de travail", diy: 'Une demi-journée' },
  { label: 'Intérieur', us: 'Aspiration, plastiques, vitres, tapis, recoins', station: 'Aspirateur à jetons', diy: 'Selon votre matériel' },
  { label: 'Produits et méthode', us: 'Produits pro adaptés à chaque surface', station: 'Rouleaux et haute pression', diy: 'Produits grand public' },
  { label: 'Résultat', us: 'Contrôle qualité avec vous avant de partir', station: 'Non garanti', diy: 'Non garanti' },
]

export default function ComparisonTable({ usLabel = 'La Clean Compagny' }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Critère</span>
            </th>
            <th scope="col" className={styles.usHead}>
              {usLabel}
            </th>
            <th scope="col">Station de lavage</th>
            <th scope="col">Vous-même</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td className={styles.us}>{row.us}</td>
              <td>{row.station}</td>
              <td>{row.diy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
