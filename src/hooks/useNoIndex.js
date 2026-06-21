import { useEffect } from 'react'

export default function useNoIndex() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    const created = !meta
    if (created) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    const previousContent = meta.getAttribute('content')
    meta.setAttribute('content', 'noindex, nofollow')

    return () => {
      if (created) {
        meta.remove()
      } else if (previousContent) {
        meta.setAttribute('content', previousContent)
      } else {
        meta.removeAttribute('content')
      }
    }
  }, [])
}