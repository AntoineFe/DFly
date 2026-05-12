import { useEffect } from 'react'

export default function usePageMeta({ title, description }) {
  useEffect(() => {
    document.title = title
    const el = document.querySelector('meta[name="description"]')
    if (el) el.setAttribute('content', description)
  }, [title, description])
}
