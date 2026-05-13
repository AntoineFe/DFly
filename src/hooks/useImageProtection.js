import { useEffect } from 'react'

export default function useImageProtection() {
  useEffect(() => {
    const isProtected = el => el.tagName === 'IMG' && !el.classList.contains('no-protect')

    const onContextMenu = e => {
      if (isProtected(e.target)) e.preventDefault()
    }

    const onDragStart = e => {
      if (isProtected(e.target)) e.preventDefault()
    }

    const onKeyDown = e => {
      const ctrl = e.ctrlKey || e.metaKey
      if (
        (ctrl && 'sSuUpP'.includes(e.key)) ||
        e.key === 'F12'
      ) e.preventDefault()
    }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('dragstart', onDragStart)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('dragstart', onDragStart)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])
}
