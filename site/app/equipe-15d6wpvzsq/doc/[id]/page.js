'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import styles from './doc.module.css'
import { getSupabase } from '@/lib/supabaseClient'
import { BASE_PATH } from '../../_lib/crm'
import { DOC_LABEL, displayNumber } from '@/lib/invoice'

// Aperçu du PDF d'un devis / d'une facture : exactement le fichier envoyé au client.
export default function DocumentPreview() {
  const { id } = useParams()
  const supabase = useMemo(() => getSupabase(), [])
  const [state, setState] = useState('loading')
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')

  useEffect(() => {
    let alive = true
    let objectUrl = ''
    Promise.all([
      supabase.from('documents').select('*').eq('id', id).maybeSingle(),
      supabase.from('settings').select('business').eq('id', 1).maybeSingle(),
    ]).then(async ([d, s]) => {
      if (!alive) return
      if (!d.data) return setState('missing')
      document.title = `${DOC_LABEL[d.data.kind] || 'Document'} ${displayNumber(d.data)} – La Clean Compagny`
      try {
        const { docPdfFile } = await import('@/lib/docPdfClient')
        const f = await docPdfFile(d.data, s.data?.business || {})
        if (!alive) return
        objectUrl = URL.createObjectURL(f)
        setFile(f)
        setUrl(objectUrl)
        setState('ok')
      } catch {
        setState('error')
      }
    })
    return () => {
      alive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [supabase, id])

  async function share() {
    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: file.name })
      } catch {}
    }
  }

  if (state === 'loading') return <p className={styles.msg}>Création du PDF…</p>
  if (state === 'error') return <p className={styles.msg}>Le PDF n’a pas pu être créé. Actualisez la page.</p>
  if (state === 'missing')
    return (
      <p className={styles.msg}>
        Document introuvable ou session expirée. <a href={BASE_PATH}>Se connecter</a>
      </p>
    )

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <a href={BASE_PATH}>← Retour</a>
        <span className={styles.toolBtns}>
          <a className={styles.btn} href={url} download={file.name}>
            Télécharger
          </a>
          <a className={styles.btnGhost} href={url}>
            Plein écran
          </a>
          {typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] }) && (
            <button type="button" onClick={share}>
              Partager
            </button>
          )}
        </span>
      </div>
      <iframe className={styles.frame} src={url} title={file.name} />
    </div>
  )
}
