import { useEffect } from 'react'

export default function usePageMeta({ title, description, schema }) {
  useEffect(() => {
    document.title = title
    const el = document.querySelector('meta[name="description"]')
    if (el) el.setAttribute('content', description)

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
  }, [title, description, schema])
}
