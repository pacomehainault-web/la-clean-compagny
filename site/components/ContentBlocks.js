import Link from 'next/link'
import styles from './ContentBlocks.module.css'

// Ancre stable dérivée du texte du H2 — utilisée à la fois par ContentBlocks
// (id réel posé sur le <h2>) et par TableOfContents (lien #ancre), pour que
// les deux ne puissent jamais diverger même si le texte change.
export function headingId(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Rendu du contenu long (articles, pages services) à partir d'une liste de
// blocs typés, avec prise en charge, directement dans le texte, de deux
// syntaxes Markdown minimales : les liens internes `[ancre descriptive](/chemin)`
// — ce qui permet à chaque article/page service de lier naturellement vers
// d'autres pages du site, sans jamais passer par un texte de lien générique du
// type « cliquez ici » — et le gras `**texte**` pour mettre en valeur un terme
// dans une liste, sans balisage séparé par item.
function renderInline(text) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      const [, label, href] = linkMatch
      if (href.startsWith('/')) {
        return (
          <Link href={href} className={styles.inlineLink} key={i}>
            {label}
          </Link>
        )
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={styles.inlineLink} key={i}>
          {label}
        </a>
      )
    }
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/)
    if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>
    return part || null
  })
}

export default function ContentBlocks({ blocks }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={index} id={headingId(block.text)}>
                {block.text}
              </h2>
            )
          case 'p':
            return <p key={index}>{renderInline(block.text)}</p>
          case 'ul':
            return (
              <ul key={index} className={styles.list}>
                {block.items.map((item, i) => (
                  <li key={i}>{renderInline(item)}</li>
                ))}
              </ul>
            )
          case 'table':
            return (
              <div className={styles.tableWrap} key={index}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {block.headers.map((h, i) => (
                        <th key={i} scope="col">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          default:
            return null
        }
      })}
    </>
  )
}

// Sommaire généré à partir des blocs h2 (ids déjà posés par ContentBlocks ci-dessus).
export function TableOfContents({ blocks }) {
  const headings = blocks.filter((b) => b.type === 'h2')
  if (headings.length < 2) return null

  return (
    <nav className={styles.toc} aria-label="Sommaire">
      <span className={styles.tocTitle}>Sommaire</span>
      <ol>
        {headings.map((h) => (
          <li key={h.text}>
            <a href={`#${headingId(h.text)}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
