import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useGalerieAuth } from '../context/GalerieAuth'
import DflyMonogram from '../components/DflyMonogram'

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ files, index, onClose, onPrev, onNext }) {
  const file = files[index]
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(14,16,13,0.96)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <button onClick={e => { e.stopPropagation(); onClose() }} style={{
        position: 'absolute', top: 20, right: 24,
        background: 'none', border: 'none', color: 'var(--ivory)',
        fontSize: 28, cursor: 'pointer', opacity: 0.7, lineHeight: 1,
      }}>✕</button>

      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); onPrev() }} style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--ivory)',
          fontSize: 36, cursor: 'pointer', opacity: 0.7, padding: '16px 12px',
        }}>‹</button>
      )}

      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
        {file.type === 'video' ? (
          <video controls autoPlay style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            <source src={file.url} />
          </video>
        ) : (
          <img src={file.url} alt={file.name} style={{
            maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain',
          }} />
        )}
      </div>

      {index < files.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNext() }} style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--ivory)',
          fontSize: 36, cursor: 'pointer', opacity: 0.7, padding: '16px 12px',
        }}>›</button>
      )}

      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 4 }}>
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
