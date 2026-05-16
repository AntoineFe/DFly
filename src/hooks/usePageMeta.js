import { useEffect } from 'react'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://dfly.fr'

export default function usePageMeta({ title, description, ogImage, schema }) {
  useEffect(() => {
    document.title = title
    const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val) }
    setMeta('meta[name="description"]', description)

    if (ogImage) {
      const url = `${SITE_URL}/assets/${ogImage}`
      setMeta('meta[property="og:image"]', url)
      setMeta('meta[name="twitter:image"]', url)
    }

    let scriptEl = document.getElementById('page-schema')
    if (schema) {
      if (!scriptEl) {
        scriptEl = document.createElement('script')
        scriptEl.id = 'page-schema'
        scriptEl.type = 'application/ld+json'
        document.head.appendChild(scriptEl)
      }
      scriptEl.textContent = JSON.stringify(schema)
    } else if (scriptEl) {
      scriptEl.remove()
    }
  }, [title, description, ogImage, schema])
}
