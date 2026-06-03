import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { useGalerieAuth } from '../context/GalerieAuth'
import TopNav from '../components/TopNav'
import { logGalerie } from '../utils/logEvent'

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ files, index, onClose, onPrev, onNext }) {
  const [dragX,           setDragX]           = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [zoomed,          setZoomed]          = useState(false) // double-tap : saute les contraintes CSS
  const [scale,           setScale]           = useState(1)     // pinch : zoom continu
  const [pan,             setPan]             = useState({ x: 0, y: 0 })
  const [isMouseDown,     setIsMouseDown]     = useState(false)

  const containerRef    = useRef(null)
  const touchStartX     = useRef(null)
  const touchStartY     = useRef(null)
  const dragXRef        = useRef(0)
  const scaleRef        = useRef(1)
  const panAccum        = useRef({ x: 0, y: 0 })
  const panLive         = useRef({ x: 0, y: 0 })
  const lastTapTime     = useRef(0)
  const didSwipe        = useRef(false)
  const didDoubleTap    = useRef(false)
  const pinchStartDist  = useRef(null)
  const pinchStartScale = useRef(1)
  const pinchStartMid   = useRef({ x: 0, y: 0 })
  const pinchStartPan   = useRef({ x: 0, y: 0 })
  const mouseStartPos   = useRef(null)
  const mouseDragged    = useRef(false)
  const curImgRef       = useRef(null)

  const prevFile = index > 0               ? files[index - 1] : null
  const curFile  = files[index]
  const nextFile = index < files.length - 1 ? files[index + 1] : null

  const isPanMode = zoomed || scale > 1  // pan actif (double-tap OU pinch)
  const isZoomed  = zoomed               // contraintes CSS supprimées (double-tap uniquement)

  const resetZoom = () => {
    setZoomed(false)
    setScale(1); scaleRef.current = 1
    setPan({ x: 0, y: 0 })
    panAccum.current = { x: 0, y: 0 }
    panLive.current  = { x: 0, y: 0 }
  }

  useLayoutEffect(() => {
    setZoomed(false)
    setScale(1); scaleRef.current = 1
    setIsTransitioning(false)
    setDragX(0); dragXRef.current = 0
    setPan({ x: 0, y: 0 })
    panAccum.current  = { x: 0, y: 0 }
    panLive.current   = { x: 0, y: 0 }
    setIsMouseDown(false)
    mouseStartPos.current = null
    mouseDragged.current  = false
  }, [index])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  // Bloque le scroll page (passive:false obligatoire pour pouvoir preventDefault)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const prevent = e => e.preventDefault()
    el.addEventListener('touchmove', prevent, { passive: false })
    return () => el.removeEventListener('touchmove', prevent)
  }, [])

  // Suivi du drag souris (desktop pan quand zoomé)
  useEffect(() => {
    function onMouseMove(e) {
      if (!mouseStartPos.current) return
      const dx = e.clientX - mouseStartPos.current.x
      const dy = e.clientY - mouseStartPos.current.y
      if (!mouseDragged.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        mouseDragged.current = true
      }
      if (mouseDragged.current) {
        const maxX = window.innerWidth  * 2
        const maxY = window.innerHeight * 2
        const newX = Math.max(-maxX, Math.min(maxX, panAccum.current.x + dx))
        const newY = Math.max(-maxY, Math.min(maxY, panAccum.current.y + dy))
        panLive.current = { x: newX, y: newY }
        setPan({ x: newX, y: newY })
      }
    }
    function onMouseUp() {
      if (!mouseStartPos.current) return
      if (mouseDragged.current) panAccum.current = { ...panLive.current }
      mouseStartPos.current = null
      setIsMouseDown(false)
      // ne pas réinitialiser mouseDragged ici : onPointerUp le lit juste après
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    }
  }, [])

  // ── Handlers tactiles ─────────────────────────────────────────────────────

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      const t0 = e.touches[0], t1 = e.touches[1]
      pinchStartDist.current  = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
      pinchStartScale.current = scaleRef.current
      pinchStartMid.current   = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 }
      pinchStartPan.current   = { ...panAccum.current }
      touchStartX.current = null
      return
    }
    touchStartX.current  = e.touches[0].clientX
    touchStartY.current  = e.touches[0].clientY
    didSwipe.current     = false
    didDoubleTap.current = false
    if (!zoomed && scaleRef.current === 1) setIsTransitioning(false)
  }

  function handleTouchMove(e) {
    // Pinch-to-zoom avec ancrage au point de contact
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const t0 = e.touches[0], t1 = e.touches[1]
      const mx   = (t0.clientX + t1.clientX) / 2
      const my   = (t0.clientY + t1.clientY) / 2
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
      const newScale = Math.max(1, Math.min(5, pinchStartScale.current * (dist / pinchStartDist.current)))
      const cx   = window.innerWidth  / 2
      const cy   = window.innerHeight / 2
      // Point image fixe (en pixels CSS, relatif au centre image, à scale de départ)
      const lx = (pinchStartMid.current.x - cx - pinchStartPan.current.x) / pinchStartScale.current
      const ly = (pinchStartMid.current.y - cy - pinchStartPan.current.y) / pinchStartScale.current
      // Pan pour que ce point reste sous le milieu actuel des doigts
      const newPanX = mx - cx - newScale * lx
      const newPanY = my - cy - newScale * ly
      scaleRef.current = newScale
      setScale(newScale)
      panLive.current = { x: newPanX, y: newPanY }
      setPan({ x: newPanX, y: newPanY })
      return
    }
    if (touchStartX.current === null) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (zoomed || scaleRef.current > 1) {
      const maxX = window.innerWidth  * 2
      const maxY = window.innerHeight * 2
      const newX = Math.max(-maxX, Math.min(maxX, panAccum.current.x + dx))
      const newY = Math.max(-maxY, Math.min(maxY, panAccum.current.y + dy))
      panLive.current = { x: newX, y: newY }
      setPan({ x: newX, y: newY })
      return
    }

    const clamped = dx > 0 && !prevFile ? dx * 0.15
                  : dx < 0 && !nextFile ? dx * 0.15
                  : dx
    dragXRef.current = clamped
    setDragX(clamped)
  }

  function handleTouchEnd(e) {
    if (pinchStartDist.current !== null && e.touches.length < 2) {
      panAccum.current = { ...panLive.current }
      pinchStartDist.current = null
      return
    }
    if (touchStartX.current === null) return
    const rawDeltaX = e.changedTouches[0].clientX - touchStartX.current
    const currentDX = dragXRef.current
    touchStartX.current = null
    touchStartY.current = null

    // Double-tap → toggle zoom (saute les contraintes CSS, scale revient à 1)
    const now = Date.now()
    if (now - lastTapTime.current < 300 && Math.abs(rawDeltaX) < 10) {
      didDoubleTap.current = true
      if (zoomed || scaleRef.current > 1) {
        resetZoom()
      } else {
        // Zoom centré sur le point du double-tap
        const tapX = e.changedTouches[0].clientX
        const tapY = e.changedTouches[0].clientY
        const cx   = window.innerWidth  / 2
        const cy   = window.innerHeight / 2
        const img  = curImgRef.current
        if (img && img.naturalWidth) {
          const newPanX = (tapX - cx) * (1 - img.naturalWidth  / img.clientWidth)
          const newPanY = (tapY - cy) * (1 - img.naturalHeight / img.clientHeight)
          setPan({ x: newPanX, y: newPanY })
          panAccum.current = { x: newPanX, y: newPanY }
          panLive.current  = { x: newPanX, y: newPanY }
        }
        setZoomed(true)
      }
      setDragX(0); dragXRef.current = 0
      lastTapTime.current = 0
      return
    }
    lastTapTime.current = now

    if (zoomed || scaleRef.current > 1) {
      panAccum.current = { ...panLive.current }
      return
    }

    const W = window.innerWidth
    if (Math.abs(currentDX) > W * 0.25) {
      didSwipe.current = true
      const targetX = currentDX < 0 ? -W : W
      setIsTransitioning(true)
      setDragX(targetX); dragXRef.current = targetX
      setTimeout(() => { if (currentDX < 0) onNext(); else onPrev() }, 280)
    } else {
      setIsTransitioning(true)
      setDragX(0); dragXRef.current = 0
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const panels = [...(prevFile ? [prevFile] : []), curFile, ...(nextFile ? [nextFile] : [])]
  const baseVw  = -(prevFile ? 1 : 0) * 100

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => { if (!didSwipe.current && !didDoubleTap.current) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, overflow: 'hidden',
        background: 'rgba(14,16,13,0.96)' }}
    >
      {/* Strip coulissante */}
      <div style={{
        display: 'flex', height: '100%',
        width: `${panels.length * 100}vw`,
        transform: `translateX(calc(${baseVw}vw + ${dragX}px))`,
        transition: isTransitioning ? 'transform 0.28s ease' : 'none',
        alignItems: 'center',
      }}>
        {panels.map(f => (
          <div key={f.name} onClick={e => e.stopPropagation()}
            style={{ width: '100vw', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center' }}>
            {f.type === 'video' ? (
              <video controls autoPlay={f === curFile} style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
                <source src={f.url} />
              </video>
            ) : (
              <img src={f.url} alt={f.name} className="no-protect"
                ref={f === curFile ? curImgRef : null}
                onMouseDown={f === curFile && isPanMode ? e => {
                  e.preventDefault()
                  mouseStartPos.current = { x: e.clientX, y: e.clientY }
                  mouseDragged.current  = false
                  setIsMouseDown(true)
                } : undefined}
                onPointerUp={f === curFile ? e => {
                  if (e.pointerType !== 'mouse') return
                  const wasDragging = mouseDragged.current
                  mouseDragged.current = false
                  if (wasDragging) return
                  e.stopPropagation()
                  if (zoomed || scaleRef.current > 1) {
                    resetZoom()
                  } else {
                    setZoomed(true)
                  }
                } : undefined}
                style={f === curFile && isPanMode ? {
                  ...(isZoomed
                    ? { maxWidth: 'none', maxHeight: 'none' }
                    : { maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }),
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                  transformOrigin: 'center center',
                  cursor: isMouseDown ? 'grabbing' : 'grab',
                  userSelect: 'none',
                } : {
                  maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain',
                  transition: 'transform 0.3s ease',
                  cursor: f === curFile ? 'zoom-in' : 'default',
                  userSelect: 'none',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <button onClick={e => { e.stopPropagation(); onClose() }} style={{
        position: 'absolute', top: 20, right: 24, zIndex: 10,
        background: 'none', border: 'none', color: 'var(--ivory)',
        fontSize: 28, cursor: 'pointer', opacity: 0.7, lineHeight: 1,
      }}>✕</button>

      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); onPrev() }} style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
          background: 'none', border: 'none', color: 'var(--ivory)',
          fontSize: 36, cursor: 'pointer', opacity: 0.7, padding: '16px 12px',
        }}>‹</button>
      )}
      {index < files.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNext() }} style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
          background: 'none', border: 'none', color: 'var(--ivory)',
          fontSize: 36, cursor: 'pointer', opacity: 0.7, padding: '16px 12px',
        }}>›</button>
      )}

      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'rgba(243,237,226,0.5)',
      }}>
        {index + 1} / {files.length}
      </div>
    </div>
  )
}

// ── HD Download ───────────────────────────────────────────────────────────────

const BATCH_SIZE = 30

function HdDownloadSection({ files, ent, path, authFetch }) {
  const hdFiles  = files.filter(f => f.hdUrl)
  const [downloading, setDownloading] = useState({})

  if (hdFiles.length === 0) return null

  const batches = Math.ceil(hdFiles.length / BATCH_SIZE)

  async function download(offset, batchIndex) {
    const key = `${offset}`
    setDownloading(prev => ({ ...prev, [key]: true }))
    try {
      const qs = new URLSearchParams({ ent, path, offset, limit: BATCH_SIZE })
      const res = await authFetch(`galerie-download.php?${qs}`)
      if (!res.ok) throw new Error('Erreur serveur')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const folderName = path ? path.split('/').pop() : ent
      const suffix = batches > 1 ? `_lot${batchIndex + 1}` : ''
      a.href     = url
      a.download = `${folderName}${suffix}_HD.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Le téléchargement a échoué. Veuillez réessayer.')
    } finally {
      setDownloading(prev => ({ ...prev, [key]: false }))
    }
  }

  return (
    <div style={{ marginTop: 64, paddingTop: 40, borderTop: '1px solid var(--line)' }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em',
        textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 16 }}>
        Photos HD — {hdFiles.length} fichier{hdFiles.length > 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {Array.from({ length: batches }).map((_, i) => {
          const offset = i * BATCH_SIZE
          const count  = Math.min(BATCH_SIZE, hdFiles.length - offset)
          const key    = `${offset}`
          const busy   = !!downloading[key]
          return (
            <button key={i} onClick={() => download(offset, i)} disabled={busy} style={{
              fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em',
              textTransform: 'uppercase', padding: '10px 20px',
              border: '1px solid var(--fg)', background: 'none',
              color: busy ? 'var(--fg-muted)' : 'var(--fg)',
              cursor: busy ? 'default' : 'pointer', whiteSpace: 'nowrap',
            }}>
              {busy ? 'Préparation…' : (
                batches > 1
                  ? `Télécharger lot ${i + 1} (${count} photos)`
                  : `Télécharger les ${count} photos HD`
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Header meta ───────────────────────────────────────────────────────────────

function AlbumHeader({ meta }) {
  if (!meta) return null
  const { title, subtitle, message, videoHtml, printUrl, printLabel } = meta
  if (!title && !subtitle && !message && !videoHtml && !printUrl) return null

  return (
    <div style={{ marginBottom: 60, paddingBottom: 48, borderBottom: '1px solid var(--line)' }}>
      {title && (
        <h1 style={{ fontFamily: 'var(--serif-display)', fontWeight: 400,
          fontSize: 'clamp(28px, 3.5vw, 48px)', marginBottom: 8 }}>
          {title}
        </h1>
      )}
      {subtitle && (
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic',
          fontSize: 18, color: 'var(--fg-muted)', marginBottom: 24 }}>
          {subtitle}
        </div>
      )}
      {message && (
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.7,
          color: 'var(--fg-muted)', maxWidth: 600, marginBottom: 24 }}>
          {message}
        </p>
      )}
      {videoHtml && (
        <div style={{ marginBottom: 24 }}
          dangerouslySetInnerHTML={{ __html: videoHtml }} />
      )}
      {printUrl && (
        <a href={printUrl} target="_blank" rel="noopener noreferrer" style={{
          fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.32em',
          textTransform: 'uppercase', color: 'var(--fg)',
          borderBottom: '1px solid var(--fg)', paddingBottom: 4,
        }}>
          {printLabel || 'Commander des tirages'} →
        </a>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function GalerieAlbums() {
  const { authFetch, user, logout, changePassword } = useGalerieAuth()
  const navigate       = useNavigate()
  const { entId }      = useParams()
  const [searchParams] = useSearchParams()
  const pathParam      = searchParams.get('path') || ''

  const entIdParam     = searchParams.get('i') || ''

  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [lightbox,    setLightbox]    = useState(null)
  const [selectMode,  setSelectMode]  = useState(false)
  const [selected,    setSelected]    = useState(new Set())
  const [dlBusy,      setDlBusy]      = useState(null) // 'hd' | 'web' | null
  const longPressTimer = useRef(null)
  const [selectedEnt, setSelectedEnt] = useState(() => {
    if (entId) return entId
    if (entIdParam && user?.ents) {
      const found = user.ents.find(e => String(e.id) === entIdParam)
      return found?.shortDesc || null
    }
    return null
  })
  const defaultCols = () => {
    const available = Math.min(window.innerWidth, 1200) - 80
    return Math.max(2, Math.floor(available / 200))
  }

  const clampCols = (n) => Math.max(2, Math.min(n, defaultCols() + 2))

  const [colsDirs,   setColsDirs]   = useState(() => clampCols(parseInt(localStorage.getItem('galerie_grid_cols_dirs'))   || defaultCols()))
  const [colsPhotos, setColsPhotos] = useState(() => clampCols(parseInt(localStorage.getItem('galerie_grid_cols_photos')) || defaultCols()))

  const gridDirsRef   = useRef(null)
  const gridPhotosRef = useRef(null)

  function useGridPinch(ref, cols, setCols, maxCols, storageKey) {
    const pinch = useRef({ active: false, startDist: 0, startCols: cols })
    useEffect(() => {
      const el = ref.current
      if (!el) return
      const onStart = e => {
        if (e.touches.length !== 2) return
        pinch.current.active    = true
        pinch.current.startDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY)
        pinch.current.startCols = cols
      }
      const onMove = e => {
        if (!pinch.current.active || e.touches.length !== 2) return
        e.preventDefault()
        const dist   = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY)
        const offset = Math.round(Math.log(dist / pinch.current.startDist) / Math.log(1.5))
        setCols(Math.max(2, Math.min(maxCols, pinch.current.startCols - offset)))
      }
      const onEnd = () => {
        if (!pinch.current.active) return
        pinch.current.active = false
        setCols(c => { localStorage.setItem(storageKey, c); return c })
      }
      el.addEventListener('touchstart',  onStart, { passive: true })
      el.addEventListener('touchmove',   onMove,  { passive: false })
      el.addEventListener('touchend',    onEnd,   { passive: true })
      el.addEventListener('touchcancel', onEnd,   { passive: true })
      return () => {
        el.removeEventListener('touchstart',  onStart)
        el.removeEventListener('touchmove',   onMove)
        el.removeEventListener('touchend',    onEnd)
        el.removeEventListener('touchcancel', onEnd)
      }
    }, [cols, data]) // eslint-disable-line react-hooks/exhaustive-deps
  }

  useGridPinch(gridDirsRef,   colsDirs,   setColsDirs,   6, 'galerie_grid_cols_dirs')
  useGridPinch(gridPhotosRef, colsPhotos, setColsPhotos, 8, 'galerie_grid_cols_photos')

  // Si multi-entreprises et pas d'ent sélectionnée → choix
  const multiEnt = user?.ents?.length > 1
  const activeEnt = selectedEnt || (multiEnt ? null : user?.shortDescEnt)

  const load = useCallback(() => {
    if (!activeEnt) return
    setLoading(true)
    const qs = new URLSearchParams({ ent: activeEnt, path: pathParam })
    authFetch(`galerie-browse.php?${qs}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setData(d)
          logGalerie(`album : ${activeEnt}${pathParam ? ' / ' + pathParam : ''}`)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeEnt, pathParam, authFetch])

  useEffect(() => { load() }, [load])

  function entQs() {
    if (!selectedEnt || entId) return ''
    const found = user?.ents?.find(e => e.shortDesc === selectedEnt)
    return found ? `&i=${found.id}` : ''
  }

  function openDir(name) {
    const newPath = pathParam ? `${pathParam}/${name}` : name
    navigate(`/galerie/albums${entId ? `/${entId}` : ''}?path=${encodeURIComponent(newPath)}${entQs()}`)
  }

  function goUp() {
    const parts = pathParam.split('/').filter(Boolean)
    parts.pop()
    const newPath = parts.join('/')
    navigate(`/galerie/albums${entId ? `/${entId}` : ''}?path=${encodeURIComponent(newPath)}${entQs()}`)
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelected(new Set())
  }

  function toggleSelect(name) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function handleLongPressStart(name) {
    longPressTimer.current = setTimeout(() => {
      navigator.vibrate?.(50)
      setSelectMode(true)
      setSelected(new Set([name]))
    }, 500)
  }

  function handleLongPressCancel() {
    clearTimeout(longPressTimer.current)
  }

  async function downloadSelected(version) {
    if (selected.size === 0) return
    setDlBusy(version)
    try {
      const res = await authFetch('galerie-download-selection.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ent: activeEnt, path: pathParam, files: [...selected], version }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = (selected.size === 1 ? [...selected][0].replace(/\.[^.]+$/, '') : (pathParam ? pathParam.split('/').pop() : activeEnt))
                 + (version === 'hd' ? '_HD' : '_1440p') + (selected.size > 1 ? '.zip' : '.' + [...selected][0].split('.').pop())
      a.click()
      URL.revokeObjectURL(url)
      exitSelectMode()
    } catch {
      alert('Le téléchargement a échoué.')
    } finally {
      setDlBusy(null)
    }
  }

  async function downloadAll(version) {
    const allImages = (data?.files || []).filter(f => f.type === 'image').map(f => f.name)
    if (!allImages.length) return
    const key = version === 'hd' ? 'all-hd' : 'all-web'
    setDlBusy(key)
    try {
      const res = await authFetch('galerie-download-selection.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ent: activeEnt, path: pathParam, files: allImages, version }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const label = pathParam ? pathParam.split('/').pop() : activeEnt
      a.href     = url
      a.download = label + (version === 'hd' ? '_HD' : '_1440p') + '.zip'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Le téléchargement a échoué.')
    } finally {
      setDlBusy(null)
    }
  }

  // ── Sélection entreprise ──────────────────────────────────────────────────
  const [entSearch, setEntSearch] = useState('')

  if (multiEnt && !selectedEnt) {
    const q = entSearch.trim().toLowerCase()
    const filteredEnts = q
      ? user.ents.filter(e => e.raiSoc.toLowerCase().includes(q) || e.shortDesc.toLowerCase().includes(q))
      : user.ents

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <TopNav minimal />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px var(--gutter) 80px' }}>
          <h2 style={{ fontFamily: 'var(--serif-display)', fontWeight: 400, fontSize: 32, marginBottom: 24 }}>
            Choisir un client
          </h2>
          <input
            type="search"
            placeholder="Rechercher…"
            value={entSearch}
            onChange={e => setEntSearch(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '10px 14px', marginBottom: 32,
              border: '1px solid var(--line)', background: 'var(--bg)',
              color: 'var(--fg)', fontSize: 15, fontFamily: 'var(--sans)',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filteredEnts.map(e => (
              <button key={e.id} onClick={() => { setSelectedEnt(e.shortDesc); navigate(`/galerie/albums?i=${e.id}`) }} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 0',
                background: 'none', border: 'none', borderBottom: '1px solid var(--line)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--serif-display)', fontSize: 22, color: 'var(--fg)' }}>{e.raiSoc}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)',
                    letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>{e.shortDesc}</div>
                </div>
                <span style={{ color: 'var(--fg-muted)', fontSize: 20 }}>→</span>
              </button>
            ))}
            {filteredEnts.length === 0 && (
              <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--fg-muted)', padding: '20px 0' }}>
                Aucun résultat
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const imageFiles = (data?.files || []).filter(f => f.type === 'image')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav minimal />
      <div style={{ padding: '80px var(--gutter) 120px' }}>

        {/* Fil d'ariane */}
        <nav style={{ marginBottom: 48, display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
          <button onClick={() => { setSelectedEnt(null); navigate('/galerie/albums', { replace: true }) }} style={crumbBtn}>
            {multiEnt ? 'Clients' : 'Albums'}
          </button>
          {activeEnt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ opacity: 0.4 }}>›</span>
              {pathParam ? (
                <button onClick={() => {
                  const qs = entQs()
                  navigate(`/galerie/albums${entId ? `/${entId}` : ''}${qs ? '?' + qs.slice(1) : ''}`)
                }} style={crumbBtn}>
                  {activeEnt}
                </button>
              ) : (
                <span style={{ color: 'var(--fg)' }}>{activeEnt}</span>
              )}
            </span>
          )}
          {pathParam.split('/').filter(Boolean).map((part, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ opacity: 0.4 }}>›</span>
              {i < arr.length - 1 ? (
                <button onClick={() => {
                  const p = arr.slice(0, i + 1).join('/')
                  navigate(`/galerie/albums?path=${encodeURIComponent(p)}${entQs()}`)
                }} style={crumbBtn}>{part}</button>
              ) : (
                <span style={{ color: 'var(--fg)' }}>{part}</span>
              )}
            </span>
          ))}
        </nav>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)',
            fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Chargement…</div>
        )}

        {/* Barre sélection desktop (sticky sous TopNav) */}
        {data?.files?.filter(f => f.type === 'image').length > 0 && (
          <div style={{
            position: 'sticky', top: 57, zIndex: 90,
            background: 'var(--bg)', borderBottom: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', marginBottom: 24,
          }} className="select-bar-desktop">
            {!selectMode ? (
              <>
                <button onClick={() => downloadAll('hd')} disabled={!!dlBusy} style={selBtn}>
                  {dlBusy === 'all-hd' ? 'Préparation…' : 'Tout télécharger HD'}
                </button>
                <button onClick={() => downloadAll('web')} disabled={!!dlBusy} style={selBtn}>
                  {dlBusy === 'all-web' ? 'Préparation…' : 'Tout télécharger 1440p'}
                </button>
                <button onClick={() => setSelectMode(true)} disabled={!!dlBusy} style={{ ...selBtn, borderColor: 'var(--line)', color: 'var(--fg-muted)' }}>
                  Sélectionner
                </button>
                {dlBusy && (
                  <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic',
                    fontSize: 13, color: 'var(--fg-muted)' }}>
                    Préparation du téléchargement…
                  </span>
                )}
              </>
            ) : (
              <>
                <button onClick={exitSelectMode} style={selBtn}>Annuler</button>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 11,
                  letterSpacing: '0.2em', color: 'var(--fg-muted)' }}>
                  {selected.size} photo{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
                </span>
                {selected.size > 0 && (
                  <>
                    <button onClick={() => downloadSelected('hd')} disabled={!!dlBusy} style={selBtn}>
                      Télécharger HD
                    </button>
                    <button onClick={() => downloadSelected('web')} disabled={!!dlBusy} style={selBtn}>
                      Télécharger 1440p
                    </button>
                  </>
                )}
                {dlBusy && (
                  <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic',
                    fontSize: 13, color: 'var(--fg-muted)' }}>
                    Préparation du téléchargement…
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {!loading && data && (
          <>
            <AlbumHeader meta={data.meta} />

            {/* Dossiers */}
            {data.dirs.length > 0 && (
              <div ref={gridDirsRef} style={{ marginBottom: 60 }}>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colsDirs}, 1fr)`, gap: 12 }}>
                  {data.dirs.map(dir => (
                    <button key={dir.name} onClick={() => openDir(dir.name)} style={{
                      background: 'none', border: '1px solid var(--line)',
                      cursor: 'pointer', textAlign: 'left', padding: 0,
                      width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column',
                    }}>
                      <div style={{ aspectRatio: '4/3', width: '100%', overflow: 'hidden', background: 'var(--bg-alt)' }}>
                        {dir.cover
                          ? <img src={dir.cover} alt="" className="no-protect" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', opacity: 0.2, fontSize: 40 }}>📁</div>
                        }
                      </div>
                      <div style={{ padding: '8px 10px', minHeight: 44 }}>
                        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.04em',
                          color: 'var(--fg)', lineHeight: 1.35,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {dir.meta?.title || dir.name}
                        </div>
                        {dir.meta?.subtitle && (
                          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)',
                            marginTop: 2, opacity: 0.7,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dir.meta.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {data.files.length > 0 && (() => {
              // Répartition masonry gauche→droite, colonne la plus courte en premier
              const DEFAULT_RATIO = 1.5
              const colHeights = Array(colsPhotos).fill(0)
              const colItems   = Array.from({ length: colsPhotos }, () => [])
              data.files.forEach(file => {
                const ratio  = file.ratio || DEFAULT_RATIO
                const col    = colHeights.indexOf(Math.min(...colHeights))
                colHeights[col] += 1 / ratio
                colItems[col].push(file)
              })
              return (
              <div ref={gridPhotosRef} style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                {colItems.map((col, ci) => (
                  <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    {col.map(file => {
                  const imgIndex   = imageFiles.indexOf(file)
                  const isSelected = selected.has(file.name)
                  return (
                    <div key={file.name}
                      onClick={() => {
                        if (selectMode && file.type === 'image') toggleSelect(file.name)
                        else if (!selectMode) setLightbox(imgIndex >= 0 ? imgIndex : null)
                      }}
                      onTouchStart={e => {
                        if (e.touches.length > 1) { handleLongPressCancel(); return }
                        file.type === 'image' && handleLongPressStart(file.name)
                      }}
                      onTouchEnd={handleLongPressCancel}
                      onTouchMove={handleLongPressCancel}
                      onContextMenu={e => e.preventDefault()}
                      style={{ breakInside: 'avoid', marginBottom: 4, cursor: 'pointer',
                        overflow: 'hidden', background: 'var(--bg-alt)', position: 'relative' }}>
                      {file.type === 'video' ? (
                        <div style={{ aspectRatio: '16/9', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          background: 'var(--bg-deep)', color: 'var(--ivory)' }}>
                          <span style={{ fontSize: 40, opacity: 0.6 }}>▶</span>
                        </div>
                      ) : (
                        <img src={file.thumbUrl} alt={file.name} className="no-protect" loading="lazy"
                          style={{ width: '100%', height: 'auto', display: 'block',
                            transition: 'transform .3s ease',
                            opacity: selectMode && !isSelected ? 0.5 : 1 }}
                          onMouseEnter={e => !selectMode && (e.currentTarget.style.transform = 'scale(1.04)')}
                          onMouseLeave={e => !selectMode && (e.currentTarget.style.transform = 'scale(1)')}
                          onContextMenu={e => e.preventDefault()}
                        />
                      )}
                      {selectMode && file.type === 'image' && (
                        <div style={{
                          position: 'absolute', top: 8, left: 8,
                          width: 22, height: 22, borderRadius: '50%',
                          border: '2px solid white',
                          background: isSelected ? 'var(--fg)' : 'rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        }}>
                          {isSelected && <span style={{ color: 'var(--bg)', fontSize: 13, lineHeight: 1 }}>✓</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
                  </div>
                ))}
              </div>
              )
            })()}

            {/* Barre sélection mobile (sticky en bas) */}
            {selectMode && (
              <div className="select-bar-mobile" style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
                background: 'var(--bg)', borderTop: '1px solid var(--line)',
                padding: '12px var(--gutter)', display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {dlBusy && (
                  <div style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic',
                    fontSize: 13, color: 'var(--fg-muted)' }}>
                    Préparation du téléchargement…
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 11,
                    letterSpacing: '0.2em', color: 'var(--fg-muted)', flex: 1 }}>
                    {selected.size} photo{selected.size > 1 ? 's' : ''}
                  </span>
                  {selected.size > 0 && (
                    <>
                      <button onClick={() => downloadSelected('hd')} disabled={!!dlBusy} style={selBtn}>
                        {dlBusy === 'hd' ? '…' : 'HD'}
                      </button>
                      <button onClick={() => downloadSelected('web')} disabled={!!dlBusy} style={selBtn}>
                        {dlBusy === 'web' ? '…' : '1440p'}
                      </button>
                    </>
                  )}
                  <button onClick={exitSelectMode} disabled={!!dlBusy} style={{ ...selBtn, borderColor: 'var(--fg-muted)', color: 'var(--fg-muted)' }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {data.dirs.length === 0 && data.files.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)',
                fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                Ce dossier est vide.
              </div>
            )}

            <HdDownloadSection
              files={data.files}
              ent={activeEnt}
              path={pathParam}
              authFetch={authFetch}
            />

          </>
        )}
      </div>

      {lightbox !== null && (
        <Lightbox
          files={imageFiles}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox(i => Math.max(0, i - 1))}
          onNext={() => setLightbox(i => Math.min(imageFiles.length - 1, i + 1))}
        />
      )}
    </div>
  )
}


const selBtn = {
  fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.22em',
  textTransform: 'uppercase', padding: '7px 16px',
  border: '1px solid var(--fg)', background: 'none',
  color: 'var(--fg)', cursor: 'pointer', whiteSpace: 'nowrap',
}

const crumbBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em',
  textTransform: 'uppercase', color: 'var(--fg-muted)', padding: 0,
  textDecoration: 'underline', textUnderlineOffset: 3,
}
