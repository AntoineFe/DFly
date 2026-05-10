import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useGalerieAuth } from '../context/GalerieAuth'
import DflyMonogram from '../components/DflyMonogram'

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ files, index, onClose, onPrev, onNext }) {
  const [dragX,           setDragX]           = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scale,           setScale]           = useState(1)
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
  const mouseStartPos   = useRef(null)
  const mouseDragged    = useRef(false)
  const curImgRef       = useRef(null)

  const prevFile = index > 0               ? files[index - 1] : null
  const curFile  = files[index]
  const nextFile = index < files.length - 1 ? files[index + 1] : null

  useLayoutEffect(() => {
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
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      pinchStartDist.current  = Math.hypot(dx, dy)
      pinchStartScale.current = scaleRef.current
      touchStartX.current = null
      return
    }
    touchStartX.current  = e.touches[0].clientX
    touchStartY.current  = e.touches[0].clientY
    didSwipe.current     = false
    didDoubleTap.current = false
    if (scaleRef.current === 1) setIsTransitioning(false)
  }

  function handleTouchMove(e) {
    // Pinch-to-zoom
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      const dist = Math.hypot(dx, dy)
      const newScale = Math.max(1, Math.min(5, pinchStartScale.current * (dist / pinchStartDist.current)))
      scaleRef.current = newScale
      setScale(newScale)
      return
    }
    if (touchStartX.current === null) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (scaleRef.current > 1) {
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
      pinchStartDist.current = null
      return
    }
    if (touchStartX.current === null) return
    const rawDeltaX = e.changedTouches[0].clientX - touchStartX.current
    const currentDX = dragXRef.current
    touchStartX.current = null
    touchStartY.current = null

    // Double-tap → toggle zoom
    const now = Date.now()
    if (now - lastTapTime.current < 300 && Math.abs(rawDeltaX) < 10) {
      didDoubleTap.current = true
      if (scaleRef.current > 1) {
        setScale(1); scaleRef.current = 1
        setPan({ x: 0, y: 0 })
        panAccum.current = { x: 0, y: 0 }
        panLive.current  = { x: 0, y: 0 }
      } else {
        const img = curImgRef.current
        const dpr      = window.devicePixelRatio || 1
        const ratio    = img ? img.naturalWidth / (img.clientWidth * dpr) : 2
        const newScale = Math.max(1, ratio)
        setScale(newScale); scaleRef.current = newScale
      }
      setDragX(0); dragXRef.current = 0
      lastTapTime.current = 0
      return
    }
    lastTapTime.current = now

    if (scaleRef.current > 1) {
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
              <img src={f.url} alt={f.name}
                ref={f === curFile ? curImgRef : null}
                onMouseDown={f === curFile && scale > 1 ? e => {
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
                  if (scaleRef.current > 1) {
                    setScale(1); scaleRef.current = 1
                    setPan({ x: 0, y: 0 })
                    panAccum.current = { x: 0, y: 0 }
                    panLive.current  = { x: 0, y: 0 }
                  } else {
                    const ratio    = e.target.naturalWidth / e.target.clientWidth
                    const newScale = Math.max(1.5, Math.min(4, ratio))
                    setScale(newScale); scaleRef.current = newScale
                  }
                } : undefined}
                style={f === curFile && scale > 1 ? {
                  maxWidth: 'none', maxHeight: 'none',
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
  const { authFetch, user, logout } = useGalerieAuth()
  const navigate       = useNavigate()
  const { entId }      = useParams()
  const [searchParams] = useSearchParams()
  const pathParam      = searchParams.get('path') || ''

  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [lightbox,    setLightbox]    = useState(null) // index ou null
  const [selectedEnt, setSelectedEnt] = useState(entId || null)

  // Si multi-entreprises et pas d'ent sélectionnée → choix
  const multiEnt = user?.ents?.length > 1
  const activeEnt = selectedEnt || (multiEnt ? null : user?.shortDescEnt)

  const load = useCallback(() => {
    if (!activeEnt) return
    setLoading(true)
    const qs = new URLSearchParams({ ent: activeEnt, path: pathParam })
    authFetch(`galerie-browse.php?${qs}`)
      .then(r => r.json())
      .then(d => { if (d.ok) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeEnt, pathParam, authFetch])

  useEffect(() => { load() }, [load])

  function openDir(name) {
    const newPath = pathParam ? `${pathParam}/${name}` : name
    navigate(`/galerie/albums${entId ? `/${entId}` : ''}?path=${encodeURIComponent(newPath)}`)
  }

  function goUp() {
    const parts = pathParam.split('/').filter(Boolean)
    parts.pop()
    const newPath = parts.join('/')
    navigate(`/galerie/albums${entId ? `/${entId}` : ''}?path=${encodeURIComponent(newPath)}`)
  }

  // ── Sélection entreprise ──────────────────────────────────────────────────
  if (multiEnt && !selectedEnt) {
    return (
      <div style={{ minHeight: '100vh', padding: '80px var(--gutter)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Header user={user} onLogout={() => { logout(); navigate('/galerie') }} />
          <h2 style={{ fontFamily: 'var(--serif-display)', fontWeight: 400, fontSize: 32, marginBottom: 40 }}>
            Choisir un client
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {user.ents.map(e => (
              <button key={e.id} onClick={() => setSelectedEnt(e.shortDesc)} style={{
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
          </div>
        </div>
      </div>
    )
  }

  const imageFiles = (data?.files || []).filter(f => f.type === 'image')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px var(--gutter) 120px' }}>
        <Header user={user} onLogout={() => { logout(); navigate('/galerie') }} />

        {/* Fil d'ariane */}
        <nav style={{ marginBottom: 48, display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/galerie/albums')} style={crumbBtn}>
            {multiEnt ? 'Clients' : 'Albums'}
          </button>
          {pathParam.split('/').filter(Boolean).map((part, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ opacity: 0.4 }}>›</span>
              {i < arr.length - 1 ? (
                <button onClick={() => {
                  const p = arr.slice(0, i + 1).join('/')
                  navigate(`/galerie/albums?path=${encodeURIComponent(p)}`)
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

        {!loading && data && (
          <>
            <AlbumHeader meta={data.meta} />

            {/* Dossiers */}
            {data.dirs.length > 0 && (
              <div style={{ marginBottom: 60 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                  {data.dirs.map(dir => (
                    <button key={dir.name} onClick={() => openDir(dir.name)} style={{
                      background: 'none', border: '1px solid var(--line)',
                      cursor: 'pointer', textAlign: 'left', padding: 0,
                    }}>
                      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg-alt)' }}>
                        {dir.cover
                          ? <img src={dir.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', opacity: 0.2, fontSize: 40 }}>📁</div>
                        }
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontFamily: 'var(--serif-display)', fontSize: 18, color: 'var(--fg)' }}>
                          {dir.meta?.title || dir.name}
                        </div>
                        {dir.meta?.subtitle && (
                          <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--fg-muted)',
                            fontStyle: 'italic', marginTop: 4 }}>
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
            {data.files.length > 0 && (
              <div style={{ display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(30vw, 200px), 1fr))', gap: 4 }}>
                {data.files.map((file, i) => {
                  const imgIndex = imageFiles.indexOf(file)
                  return (
                    <div key={file.name} onClick={() => setLightbox(imgIndex >= 0 ? imgIndex : null)}
                      style={{ aspectRatio: '1/1', overflow: 'hidden', cursor: 'pointer',
                        position: 'relative', background: 'var(--bg-alt)' }}>
                      {file.type === 'video' ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          background: 'var(--bg-deep)', color: 'var(--ivory)' }}>
                          <span style={{ fontSize: 40, opacity: 0.6 }}>▶</span>
                        </div>
                      ) : (
                        <img src={file.thumbUrl} alt={file.name} loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform .3s ease' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {data.dirs.length === 0 && data.files.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)',
                fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                Ce dossier est vide.
              </div>
            )}
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

// ── Composants utilitaires ────────────────────────────────────────────────────

function Header({ user, onLogout }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <DflyMonogram size={28} color="var(--fg)" />
        <div style={{ fontFamily: 'var(--serif-display)', fontSize: 20 }}>
          D<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Fly</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)',
          letterSpacing: '0.2em' }}>
          {user?.firstName} {user?.lastName}
        </span>
        <button onClick={onLogout} style={{
          background: 'none', border: '1px solid var(--line)', padding: '7px 16px',
          fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.24em',
          textTransform: 'uppercase', cursor: 'pointer', color: 'var(--fg-muted)',
        }}>Déconnexion</button>
      </div>
    </div>
  )
}

const crumbBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em',
  textTransform: 'uppercase', color: 'var(--fg-muted)', padding: 0,
  textDecoration: 'underline', textUnderlineOffset: 3,
}
