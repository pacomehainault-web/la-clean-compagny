'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import styles from './doc.module.css'
import { getSupabase } from '@/lib/supabaseClient'
import { BASE_PATH, euros2, formatDate, lineTotal } from '../../_lib/crm'

// Devis / facture prêt à imprimer ou à enregistrer en PDF (Imprimer → PDF).
export default function DocumentPrint() {
  const { id } = useParams()
  const supabase = useMemo(() => getSupabase(), [])
  const [doc, setDoc] = useState(null)
  const [biz, setBiz] = useState({})
  const [state, setState] = useState('loading')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase.from('documents').select('*').eq('id', id).maybeSingle(),
      supabase.from('settings').select('business').eq('id', 1).maybeSingle(),
    ]).then(([d, s]) => {
      if (cancelled) return
      if (!d.data) return setState('missing')
      setDoc(d.data)
      setBiz(s.data?.business || {})
      setState('ok')
      document.title = `${d.data.kind === 'devis' ? 'Devis' : 'Facture'} ${d.data.number} – La Clean Compagny`
    })
    return () => {
      cancelled = true
    }
  }, [supabase, id])

  if (state === 'loading') return <p className={styles.msg}>Chargement…</p>
  if (state === 'missing')
    return (
      <p className={styles.msg}>
        Document introuvable ou session expirée. <a href={BASE_PATH}>Se connecter</a>
      </p>
    )

  const isQuote = doc.kind === 'devis'
  const c = doc.client || {}
  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => window.print()}>
          Imprimer / Enregistrer en PDF
        </button>
        <a href={BASE_PATH}>Retour</a>
      </div>
      <article className={styles.page}>
        <header className={styles.head}>
          <div>
            <span className={styles.logoBox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo/logo-new.png" alt="La Clean Compagny" className={styles.logo} />
            </span>
            <p className={styles.biz}>
              <strong>{biz.name || 'La Clean Compagny'}</strong>
              {biz.owner && <br />}
              {biz.owner}
              {biz.address && <br />}
              {biz.address}
              <br />
              {[biz.phone, biz.email].filter(Boolean).join(' · ')}
              {biz.website && <br />}
              {biz.website}
              {biz.siret && <br />}
              {biz.siret && `SIRET ${biz.siret}`}
            </p>
          </div>
          <div className={styles.meta}>
            <h1>{isQuote ? 'DEVIS' : 'FACTURE'}</h1>
            <p>
              N° <strong>{doc.number}</strong>
              <br />
              Date : {formatDate(doc.issued_at)}
              {doc.due_at && (
                <>
                  <br />
                  {isQuote ? 'Valable jusqu’au' : 'Échéance'} : {formatDate(doc.due_at)}
                </>
              )}
            </p>
          </div>
        </header>

        <section className={styles.client}>
          <span>{isQuote ? 'Devis pour' : 'Facturé à'}</span>
          <strong>{c.name || '—'}</strong>
          {c.company && <span>{c.company}</span>}
          {c.address && <span>{c.address}</span>}
          {(c.phone || c.email) && <span>{[c.phone, c.email].filter(Boolean).join(' · ')}</span>}
          {c.vehicle && <span>Véhicule : {c.vehicle}</span>}
        </section>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Qté</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(doc.lines || []).map((l, i) => (
              <tr key={i}>
                <td>{l.label}</td>
                <td>{l.qty}</td>
                <td>{euros2(l.unit_price)}</td>
                <td>{euros2(lineTotal(l))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total à payer</td>
              <td>{euros2(doc.total)}</td>
            </tr>
          </tfoot>
        </table>
        <p className={styles.vat}>{biz.vat_note || 'TVA non applicable, art. 293 B du CGI'}</p>

        {doc.notes && <p className={styles.notes}>{doc.notes}</p>}

        <footer className={styles.foot}>
          {isQuote ? (
            <>
              <p>Bon pour accord (date et signature du client) :</p>
              <div className={styles.sign} />
            </>
          ) : (
            <>
              {doc.status === 'paye' && doc.paid_at && <p className={styles.paid}>Payée le {formatDate(doc.paid_at)}</p>}
              <p>{biz.payment_terms || 'Paiement à réception de facture.'}</p>
              {biz.iban && <p>IBAN : {biz.iban}</p>}
              <p className={styles.legal}>
                En cas de retard de paiement : pénalités au taux légal en vigueur et, pour les clients professionnels, indemnité
                forfaitaire pour frais de recouvrement de 40 €.
              </p>
            </>
          )}
        </footer>
      </article>
    </div>
  )
}
