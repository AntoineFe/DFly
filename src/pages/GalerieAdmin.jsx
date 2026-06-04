import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGalerieAuth } from '../context/GalerieAuth'
import GalerieNav from '../components/GalerieNav'

const BASE = import.meta.env.BASE_URL
const API  = path => `${BASE}services/${path}`

// ── Formulaire meta ───────────────────────────────────────────────────────────

function MetaForm({ ent, path, meta, onSave, onClose, authFetch }) {
  const [form,    setForm]    = useState({
    title:      meta?.title      || '',
    subtitle:   meta?.subtitle   || '',
    message:    meta?.message    || '',
    videoHtml:  meta?.videoHtml  || '',
    printUrl:   meta?.printUrl   || '',
    printLabel: meta?.printLabel || '',
  })
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveErr, setSaveErr] = useState('')

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    setSaving(true)
    setSuccess(false)
    setSaveErr('')
    try {
      const r = await authFetch('galerie-meta.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ent, path, meta: form }),
      })
      const d = await r.json()
      if (d.ok) { setSuccess(true); onSave(d.meta) }
      else setSaveErr(d.error || 'Erreur inconnue')
    } catch (e) {
      setSaveErr(e.message || 'Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  const labelStyle = { fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em',
    textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6, display: 'block' }
  const inputStyle = { width: '100%', padding: '9px 12px', boxSizing: 'border-box',
    border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)',
    fontSize: 14, fontFamily: 'inherit', marginBottom: 16 }

  return (
    <div style={{ padding: '24px', background: 'var(--bg)', border: '1px solid var(--line)', marginTop: 8 }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 20 }}>
        Informations · {path || 'racine'}
      </div>

      <label style={labelStyle}>Titre</label>
      <input style={inputStyle} value={form.title} onChange={e => upd('title', e.target.value)}
        placeholder="Ex : Mariage Aurore & Fabien" />

      <label style={labelStyle}>Sous-titre</label>
      <input style={inputStyle} value={form.subtitle} onChange={e => upd('subtitle', e.target.value)}
        placeholder="Ex : Samedi 11 octobre 2025" />

      <label style={labelStyle}>Message (optionnel)</label>
      <textarea style={{ ...inputStyle, resize: 'vertical', marginBottom: 16 }} rows={3}
        value={form.message} onChange={e => upd('message', e.target.value)}
        placeholder="Un message à vos clients..." />

      <label style={labelStyle}>HTML vidéo (optionnel)</label>
      <textarea style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
        rows={4} value={form.videoHtml} onChange={e => upd('videoHtml', e.target.value)}
        placeholder={'<video controls ...>...</video>'} />

      <label style={labelStyle}>Lien impression — URL</label>
      <input style={inputStyle} type="url" value={form.printUrl}
        onChange={e => upd('printUrl', e.target.value)}
        placeholder="https://..." />

      <label style={labelStyle}>Lien impression — libellé</label>
      <input style={{ ...inputStyle, marginBottom: 24 }} value={form.printLabel}
        onChange={e => upd('printLabel', e.target.value)}
        placeholder="Commander vos tirages" />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={save} disabled={saving} style={{
          background: 'var(--fg)', color: 'var(--bg)', border: 'none',
          padding: '10px 24px', fontFamily: 'var(--sans)', fontSize: 10.5,
          letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer',
        }}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button onClick={onClose} style={{
          background: 'none', border: '1px solid var(--line)', padding: '10px 20px',
          fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.28em',
          textTransform: 'uppercase', cursor: 'pointer', color: 'var(--fg-muted)',
        }}>Fermer</button>
        {success && (
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 13, color: 'green' }}>✓ Enregistré</span>
        )}
        {saveErr && (
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 13, color: '#c0392b' }}>✗ {saveErr}</span>
        )}
      </div>
    </div>
  )
}

// ── Zone d'upload drag & drop ─────────────────────────────────────────────────

const UPLOAD_CONCURRENCY = 3
const WEB_SHORT   = 1440
const THUMB_SHORT = 230

function scaleDims(w, h, minShort) {
  if (Math.min(w, h) <= minShort) return [w, h]
  if (w <= h) return [minShort, Math.round(h * minShort / w)]
  return [Math.round(w * minShort / h), minShort]
}

function bitmapToBlob(source, w, h, quality) {
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)
  return new Promise(res => canvas.toBlob(res, 'image/jpeg', quality))
}

// Descente multi-étapes pour les grandes réductions (évite le bruit bilinéaire)
function stepDownToBlob(source, srcW, srcH, targetW, targetH, quality) {
  let cur = document.createElement('canvas')
  cur.width = srcW; cur.height = srcH
  const ctx0 = cur.getContext('2d')
  ctx0.imageSmoothingEnabled = true
  ctx0.imageSmoothingQuality = 'high'
  ctx0.drawImage(source, 0, 0, srcW, srcH)

  let w = srcW, h = srcH
  while (w > targetW * 1.5 || h > targetH * 1.5) {
    const nw = Math.max(Math.round(w / 2), targetW)
    const nh = Math.max(Math.round(h / 2), targetH)
    const next = document.createElement('canvas')
    next.width = nw; next.height = nh
    const ctx = next.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(cur, 0, 0, nw, nh)
    cur = next; w = nw; h = nh
  }

  if (w !== targetW || h !== targetH) {
    const fin = document.createElement('canvas')
    fin.width = targetW; fin.height = targetH
    const ctx = fin.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(cur, 0, 0, targetW, targetH)
    cur = fin
  }

  return new Promise(res => cur.toBlob(res, 'image/jpeg', quality))
}

async function clientResize(file) {
  try {
    const t0 = performance.now()
    const bitmap = await createImageBitmap(file)
    const t1 = performance.now()
    const ow = bitmap.width
    const oh = bitmap.height

    const [ww, wh] = scaleDims(ow, oh, WEB_SHORT)

    const webBlob = await bitmapToBlob(bitmap, ww, wh, 0.88)
    const t2 = performance.now()

    bitmap.close()
    console.log(`[upload] ${file.name} (${(file.size/1024/1024).toFixed(1)}MB ${ow}×${oh})`
      + ` | decode: ${(t1-t0).toFixed(0)}ms`
      + ` | web-encode: ${(t2-t1).toFixed(0)}ms`
      + ` | web: ${(webBlob.size/1024).toFixed(0)}KB`)
    return { webBlob, ratio: +(ww / wh).toFixed(4) }
  } catch {
    return null
  }
}

function UploadZone({ ent, path, onDone, authFetch }) {
  const [dragging,     setDragging]     = useState(false)
  const [fileStatuses, setFileStatuses] = useState({}) // name → 'pending'|'uploading'|'done'|'error'
  const [uploading,    setUploading]    = useState(false)
  const inputRef = useRef()

  const setStatus = (name, status) =>
    setFileStatuses(prev => ({ ...prev, [name]: status }))

  async function uploadFiles(fileList) {
    const files = Array.from(fileList).filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (!files.length) return

    setUploading(true)
    const initial = {}
    files.forEach(f => { initial[f.name] = 'pending' })
    setFileStatuses(initial)

    let idx = 0
    let doneCount = 0

    // Upload UPLOAD_CONCURRENCY fichiers en parallèle
    const worker = async () => {
      while (true) {
        const i = idx++
        if (i >= files.length) break
        const file = files[i]
        setStatus(file.name, 'uploading')
        try {
          const isImage = file.type.startsWith('image/')
          const fd = new FormData()
          fd.append('ent', ent)
          fd.append('path', path)
          fd.append('filename', file.name)

          if (isImage) {
            const resized = await clientResize(file)
            if (resized) {
              fd.append('file_web',   resized.webBlob,    file.name)
              fd.append('ratio',      String(resized.ratio))
            } else {
              // Fallback : envoyer l'original, serveur redimensionnera
              fd.append(file.name, file)
            }
          } else {
            fd.append(file.name, file)
          }

          const tFetchStart = performance.now()
          console.log(`[upload] ${file.name} → fetch start (hd: ${(file.size/1024/1024).toFixed(1)}MB)`)
          const r = await authFetch('galerie-upload.php', { method: 'POST', body: fd })
          const tFetchEnd = performance.now()
          const d = await r.json()
          console.log(`[upload] ${file.name} → fetch done in ${((tFetchEnd-tFetchStart)/1000).toFixed(2)}s`)
          const ok = d.files?.[0]?.ok ?? false
          setStatus(file.name, ok ? 'done' : 'error')
          if (ok) doneCount++
        } catch {
          setStatus(file.name, 'error')
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, worker))

    setUploading(false)
    if (doneCount > 0) onDone()
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    uploadFiles(e.dataTransfer.files)
  }

  const entries = Object.entries(fileStatuses)
  const total   = entries.length
  const done    = entries.filter(([, s]) => s === 'done' || s === 'error').length

  return (
    <div style={{ marginTop: 8 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--fg)' : 'var(--line)'}`,
          background: dragging ? 'var(--bg-alt)' : 'var(--bg)',
          padding: '24px 20px', textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          transition: 'all .15s',
        }}
      >
        <input ref={inputRef} type="file" multiple accept="image/*,video/*"
          style={{ display: 'none' }} onChange={e => uploadFiles(e.target.files)} />
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>↑</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
          {uploading
            ? `${done} / ${total} traité${total > 1 ? 's' : ''}`
            : 'Glisser les photos ici ou cliquer pour parcourir'}
        </div>
        {uploading && total > 0 && (
          <div style={{ marginTop: 10, maxWidth: 320, margin: '10px auto 0' }}>
            <div style={{ height: 3, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'var(--fg)', borderRadius: 2,
                width: `${(done / total) * 100}%`, transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
        {!uploading && total === 0 && (
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13,
            color: 'var(--fg-muted)', marginTop: 8 }}>
            JPG, JPEG, PNG, WEBP · Miniatures générées automatiquement
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 0,
          maxHeight: 240, overflowY: 'auto', border: '1px solid var(--line)', borderTop: 'none' }}>
          {entries.map(([name, status]) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '5px 10px', borderBottom: '1px solid var(--line)',
              background: status === 'error' ? 'rgba(192,57,43,0.04)' : 'transparent',
            }}>
              <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {status === 'uploading' && <span className="upload-spinner" />}
                {status === 'done'      && <span style={{ color: 'green',   fontSize: 13 }}>✓</span>}
                {status === 'error'     && <span style={{ color: '#c0392b', fontSize: 13 }}>✗</span>}
                {status === 'pending'   && <span style={{ color: 'var(--line)', fontSize: 11 }}>·</span>}
              </div>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 12,
                color: status === 'error' ? '#c0392b' : 'var(--fg-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sélecteur de dossier destination ─────────────────────────────────────────

function FolderRow({ ent, path, label, depth, excludePath, selected, onSelect, authFetch }) {
  const [open,    setOpen]    = useState(false)
  const [subdirs, setSubdirs] = useState(null)

  const isExcluded = excludePath && path !== '' &&
    (path === excludePath || path.startsWith(excludePath + '/'))
  if (isExcluded) return null

  async function toggle() {
    if (!open && subdirs === null) {
      const qs = new URLSearchParams({ ent, path })
      const r  = await authFetch(`galerie-browse.php?${qs}`)
      const d  = await r.json()
      if (d.ok) setSubdirs(d.dirs)
    }
    setOpen(o => !o)
  }

  const isSelected = selected === path
  const pl = 10 + depth * 16

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8,
        padding: `7px 12px 7px ${pl}px`,
        background: isSelected ? 'var(--bg-alt)' : 'transparent',
        borderBottom: '1px solid var(--line)' }}>
        <button onClick={toggle} style={{ background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 11, color: 'var(--fg-muted)', width: 14,
          flexShrink: 0, padding: 0 }}>
          {path !== '' ? (open ? '▾' : '▸') : ''}
        </button>
        <span style={{ flex: 1, fontFamily: 'var(--sans)', fontSize: 12,
          color: 'var(--fg)', fontStyle: path === '' ? 'italic' : 'normal' }}>
          {label}
        </span>
        <button onClick={() => onSelect(path)} style={{
          background: isSelected ? 'var(--fg)' : 'none',
          color: isSelected ? 'var(--bg)' : 'var(--fg)',
          border: '1px solid var(--line)', padding: '3px 10px',
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em',
          textTransform: 'uppercase', cursor: 'pointer',
        }}>
          {isSelected ? '✓ Ici' : 'Ici'}
        </button>
      </div>
      {open && subdirs && subdirs.map(d => (
        <FolderRow key={d.name} ent={ent}
          path={path ? path + '/' + d.name : d.name}
          label={d.meta?.title || d.name}
          depth={depth + 1} excludePath={excludePath}
          selected={selected} onSelect={onSelect} authFetch={authFetch} />
      ))}
    </div>
  )
}

function FolderPicker({ ent, excludePath, selected, onSelect, authFetch }) {
  const [topDirs, setTopDirs] = useState(null)

  useEffect(() => {
    const qs = new URLSearchParams({ ent, path: '' })
    authFetch(`galerie-browse.php?${qs}`)
      .then(r => r.json())
      .then(d => { if (d.ok) setTopDirs(d.dirs) })
  }, [ent, authFetch])

  return (
    <div style={{ border: '1px solid var(--line)', maxHeight: 240, overflowY: 'auto', marginTop: 12 }}>
      <FolderRow ent={ent} path='' label='Racine (niveau principal)' depth={0}
        excludePath={excludePath} selected={selected} onSelect={onSelect} authFetch={authFetch} />
      {topDirs && topDirs.map(d => (
        <FolderRow key={d.name} ent={ent} path={d.name}
          label={d.meta?.title || d.name} depth={0}
          excludePath={excludePath} selected={selected} onSelect={onSelect} authFetch={authFetch} />
      ))}
    </div>
  )
}

// ── Panneau déplacement ───────────────────────────────────────────────────────

function MovePanel({ ent, srcPath, srcName, type, dataFiles, onDone, onClose, authFetch }) {
  // type='folder': déplacer le dossier srcName (dans srcPath) vers destPath
  // type='files' : déplacer des fichiers de srcPath vers destPath
  const folderFullPath = type === 'folder'
    ? (srcPath ? srcPath + '/' + srcName : srcName)
    : null

  const [step,          setStep]          = useState(type === 'folder' ? 'dest' : 'select')
  const [selectedFiles, setSelectedFiles] = useState(null) // null = tous
  const [destPath,      setDestPath]      = useState(null)
  const [moving,        setMoving]        = useState(false)
  const [hoveredThumb,  setHoveredThumb]  = useState(null) // { url, x, y }

  const imageFiles = (dataFiles || []).filter(f => f.type === 'image' || f.type === 'video')

  function toggleFile(name) {
    setSelectedFiles(prev => {
      const base = prev ?? imageFiles.map(f => f.name)
      const next = new Set(base)
      next.has(name) ? next.delete(name) : next.add(name)
      return [...next]
    })
  }

  async function doMove() {
    if (destPath === null) return
    setMoving(true)
    try {
      const body = type === 'folder'
        ? { ent, type: 'folder', srcPath: folderFullPath, destPath }
        : { ent, type: 'files',  srcPath, destPath, files: selectedFiles ?? [] }
      const r = await authFetch('galerie-move.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const d = await r.json()
      if (d.ok) onDone()
      else alert(d.error || 'Erreur lors du déplacement')
    } finally {
      setMoving(false)
    }
  }

  const labelStyle = { fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em',
    textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8, display: 'block' }

  return (
    <div style={{ padding: '16px 0', position: 'relative' }}>

      {/* Étape 1 : sélection des fichiers (type=files uniquement) */}
      {step === 'select' && (
        <div>
          <span style={labelStyle}>Sélectionner les fichiers à déplacer</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => { setSelectedFiles(null); setStep('dest') }} style={moveBtnStyle}>
              Tous les fichiers ({imageFiles.length})
            </button>
            <button onClick={() => { setSelectedFiles([]); }} style={{
              ...moveBtnStyle,
              background: selectedFiles !== null ? 'var(--fg)' : 'none',
              color: selectedFiles !== null ? 'var(--bg)' : 'var(--fg)',
            }}>
              Sélectionner
            </button>
          </div>

          {selectedFiles !== null && (
            <>
              <div style={{ border: '1px solid var(--line)', maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                {imageFiles.map(f => {
                  const checked = selectedFiles.includes(f.name)
                  return (
                    <div key={f.name}
                      style={{ display: 'flex', alignItems: 'center', gap: 10,
                        padding: '6px 12px', borderBottom: '1px solid var(--line)',
                        cursor: 'pointer', background: checked ? 'var(--bg-alt)' : 'transparent' }}
                      onClick={() => toggleFile(f.name)}
                      onMouseEnter={e => {
                        if (f.thumbUrl) {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setHoveredThumb({ url: f.thumbUrl, x: rect.right + 8, y: rect.top })
                        }
                      }}
                      onMouseLeave={() => setHoveredThumb(null)}>
                      <div style={{ width: 16, height: 16, border: '1px solid var(--line)',
                        background: checked ? 'var(--fg)' : 'transparent', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {checked && <span style={{ color: 'var(--bg)', fontSize: 11 }}>✓</span>}
                      </div>
                      <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--fg)' }}>
                        {f.name}
                      </span>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => setStep('dest')} disabled={selectedFiles.length === 0}
                style={{ ...moveBtnStyle, background: 'var(--fg)', color: 'var(--bg)', border: 'none' }}>
                Suivant ({selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''})
              </button>
            </>
          )}
        </div>
      )}

      {/* Étape 2 : choix de la destination */}
      {step === 'dest' && (
        <div>
          <span style={labelStyle}>
            {type === 'folder'
              ? `Déplacer le dossier « ${srcName} » vers :`
              : `Déplacer ${selectedFiles === null ? 'tous les fichiers' : selectedFiles.length + ' fichier(s)'} vers :`}
          </span>
          <FolderPicker
            ent={ent}
            excludePath={type === 'folder' ? folderFullPath : srcPath}
            selected={destPath ?? ''}
            onSelect={setDestPath}
            authFetch={authFetch}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {type === 'files' && (
              <button onClick={() => setStep('select')} style={moveBtnStyle}>← Retour</button>
            )}
            <button onClick={doMove} disabled={destPath === null || moving} style={{
              ...moveBtnStyle, background: 'var(--fg)', color: 'var(--bg)', border: 'none',
              opacity: destPath === null ? 0.4 : 1,
            }}>
              {moving ? 'Déplacement…' : 'Déplacer'}
            </button>
            <button onClick={onClose} style={{ ...moveBtnStyle, color: 'var(--fg-muted)', borderColor: 'var(--line)' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Vignette au survol */}
      {hoveredThumb && (
        <div style={{ position: 'fixed', top: hoveredThumb.y, left: hoveredThumb.x,
          zIndex: 1000, pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', background: 'var(--bg)' }}>
          <img src={hoveredThumb.url} alt="" style={{ width: 160, height: 'auto', display: 'block' }} />
        </div>
      )}
    </div>
  )
}

const moveBtnStyle = {
  fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.22em',
  textTransform: 'uppercase', padding: '7px 14px',
  border: '1px solid var(--fg)', background: 'none',
  color: 'var(--fg)', cursor: 'pointer',
}

// ── Nœud de l'arbre ───────────────────────────────────────────────────────────

function TreeNode({ ent, dir, depth, authFetch, onRefresh, registerRefresh }) {
  const [open,        setOpen]        = useState(depth === 0)
  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [showMeta,    setShowMeta]    = useState(false)
  const [showUpload,  setShowUpload]  = useState(false)
  const [showMkdir,   setShowMkdir]   = useState(false)
  const [showMove,    setShowMove]    = useState(false)
  const [moveType,    setMoveType]    = useState('folder') // 'folder' | 'files'
  const [newDirName,  setNewDirName]  = useState('')
  const [meta,        setMeta]        = useState(dir?.meta || null)

  const path = dir?.path || ''
  const name = dir?.name || ent

  const load = useCallback(async () => {
    setLoading(true)
    const qs = new URLSearchParams({ ent, path })
    const r  = await authFetch(`galerie-browse.php?${qs}`)
    const d  = await r.json()
    if (d.ok) {
      setData(d)
      if (d.meta) setMeta(d.meta)
    }
    setLoading(false)
  }, [ent, path, authFetch])

  useEffect(() => {
    if (depth === 0) {
      load()
      registerRefresh?.(load)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle() {
    if (!open && !data) load()
    setOpen(o => !o)
  }

  async function createDir() {
    if (!newDirName.trim()) return
    const r = await authFetch('galerie-mkdir.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ent, path, name: newDirName.trim() }),
    })
    const d = await r.json()
    if (d.ok) {
      setNewDirName('')
      setShowMkdir(false)
      setData(null)
      load()
    }
  }

  const indent = depth * 20

  return (
    <div>
      {/* Ligne dossier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
        paddingLeft: indent, borderBottom: '1px solid var(--line)' }}>
        <button onClick={toggle} style={{ background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 12, color: 'var(--fg-muted)', width: 16, flexShrink: 0 }}>
          {open ? '▾' : '▸'}
        </button>
        <span style={{ fontFamily: 'var(--serif-display)', fontSize: depth === 0 ? 20 : 16,
          color: 'var(--fg)', flex: 1 }}>
          {meta?.title || name}
          {meta?.subtitle && (
            <span style={{ fontFamily: 'var(--serif)', fontSize: 12, fontStyle: 'italic',
              color: 'var(--fg-muted)', marginLeft: 10 }}>{meta.subtitle}</span>
          )}
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <ActionBtn onClick={() => { setShowMeta(m => !m); setShowUpload(false); setShowMkdir(false); setShowMove(false) }}
            active={showMeta} title="Modifier les informations">✏️</ActionBtn>
          <ActionBtn onClick={() => { setShowUpload(u => !u); setShowMeta(false); setShowMkdir(false); setShowMove(false) }}
            active={showUpload} title="Uploader des photos">⬆</ActionBtn>
          <ActionBtn onClick={() => { setShowMkdir(m => !m); setShowMeta(false); setShowUpload(false); setShowMove(false) }}
            active={showMkdir} title="Créer un sous-dossier">📁+</ActionBtn>
          {depth > 0 && (
            <ActionBtn onClick={() => { setMoveType('folder'); setShowMove(m => !m); setShowMeta(false); setShowUpload(false); setShowMkdir(false) }}
              active={showMove && moveType === 'folder'} title="Déplacer ce dossier">↗</ActionBtn>
          )}
        </div>
      </div>

      {/* Panneau infos */}
      {showMeta && (
        <div style={{ paddingLeft: indent + 24 }}>
          <MetaForm ent={ent} path={path} meta={meta}
            onSave={m => setMeta(m)} onClose={() => setShowMeta(false)} authFetch={authFetch} />
        </div>
      )}

      {/* Panneau upload */}
      {showUpload && (
        <div style={{ paddingLeft: indent + 24, paddingBottom: 16 }}>
          <UploadZone ent={ent} path={path} authFetch={authFetch}
            onDone={() => { setData(null); load() }} />
        </div>
      )}

      {/* Panneau déplacement */}
      {showMove && (
        <div style={{ paddingLeft: indent + 24, paddingBottom: 16, paddingTop: 8 }}>
          <MovePanel
            ent={ent}
            srcPath={moveType === 'folder' ? (path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '') : path}
            srcName={moveType === 'folder' ? name : ''}
            type={moveType}
            dataFiles={data?.files || []}
            authFetch={authFetch}
            onDone={() => { setShowMove(false); setData(null); load(); onRefresh?.() }}
            onClose={() => setShowMove(false)}
          />
        </div>
      )}

      {/* Créer un dossier */}
      {showMkdir && (
        <div style={{ paddingLeft: indent + 24, paddingBottom: 16, paddingTop: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newDirName} onChange={e => setNewDirName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createDir()}
              placeholder="Nom du sous-dossier"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)',
                background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'inherit', fontSize: 14 }} />
            <button onClick={createDir} style={{
              background: 'var(--fg)', color: 'var(--bg)', border: 'none',
              padding: '8px 16px', fontFamily: 'var(--sans)', fontSize: 10.5,
              letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer',
            }}>Créer</button>
          </div>
        </div>
      )}

      {/* Enfants */}
      {open && (
        <div>
          {loading && (
            <div style={{ paddingLeft: indent + 24, fontSize: 12, color: 'var(--fg-muted)',
              fontFamily: 'var(--serif)', fontStyle: 'italic', padding: '8px 0 8px ' + (indent + 24) + 'px' }}>
              Chargement…
            </div>
          )}
          {data?.dirs?.map(child => (
            <TreeNode key={child.name} ent={ent} dir={{ name: child.name, meta: child.meta,
              path: path ? `${path}/${child.name}` : child.name }}
              depth={depth + 1} authFetch={authFetch} onRefresh={onRefresh} />
          ))}
          {data && data.files.length > 0 && (
            <div style={{ paddingLeft: indent + 24, paddingTop: 4, paddingBottom: 8,
              display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)',
                letterSpacing: '0.2em' }}>
                {data.files.length} fichier{data.files.length > 1 ? 's' : ''}
              </span>
              <ActionBtn
                onClick={() => { setMoveType('files'); setShowMove(m => !m); setShowMeta(false); setShowUpload(false); setShowMkdir(false) }}
                active={showMove && moveType === 'files'} title="Déplacer des fichiers">↗</ActionBtn>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActionBtn({ onClick, active, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: active ? 'var(--fg)' : 'none',
      color: active ? 'var(--bg)' : 'var(--fg-muted)',
      border: '1px solid var(--line)', padding: '4px 8px',
      fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all .15s',
    }}>{children}</button>
  )
}

// ── Formulaire nouveau client ─────────────────────────────────────────────────

function CreateClientForm({ authFetch, onCreated }) {
  const empty = { raiSoc: '', shortDesc: '', firstName: '', lastName: '', email: '', login: '', lang: 'FR', profil: 'lecteur' }
  const [form,    setForm]    = useState(empty)
  const [saving,  setSaving]  = useState(false)
  const [result,  setResult]  = useState(null) // { tempPassword, cle }
  const [error,   setError]   = useState('')

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setResult(null)
    try {
      const payload = { ...form, login: form.login || form.email }
      const r = await authFetch('galerie-create-client.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const d = await r.json()
      if (d.ok) {
        setResult(d)
        setForm(empty)
        onCreated?.()
      } else {
        setError(d.error || 'Erreur inconnue')
      }
    } catch (err) {
      setError(err.message || 'Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  const labelStyle = { fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em',
    textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6, display: 'block' }
  const inputStyle = { width: '100%', padding: '9px 12px', boxSizing: 'border-box',
    border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)',
    fontSize: 14, fontFamily: 'inherit', marginBottom: 16 }
  const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }

  return (
    <div style={{ border: '1px solid var(--line)', padding: 24 }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 24 }}>
        Nouveau client
      </div>

      {result && (
        <div style={{ background: 'rgba(0,120,0,0.05)', border: '1px solid rgba(0,120,0,0.2)',
          padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: 'green', marginBottom: 12 }}>
            ✓ Client créé
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--fg)', marginBottom: 6 }}>
            <strong>Mot de passe temporaire :</strong>{' '}
            <code style={{ fontFamily: 'monospace', background: 'var(--bg-alt)', padding: '2px 6px' }}>
              {result.tempPassword}
            </code>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--fg-muted)' }}>
            À communiquer au client. Il pourra se connecter avec son email et ce mot de passe.
          </div>
        </div>
      )}

      <form onSubmit={submit}>
        <div style={row2}>
          <div>
            <label style={labelStyle}>Raison sociale *</label>
            <input style={inputStyle} value={form.raiSoc}
              onChange={e => upd('raiSoc', e.target.value)} required placeholder="Dupont Productions" />
          </div>
          <div>
            <label style={labelStyle}>Identifiant court (shortDesc) *</label>
            <input style={inputStyle} value={form.shortDesc}
              onChange={e => upd('shortDesc', e.target.value.replace(/\s/g, ''))} required
              placeholder="dupontprod" />
          </div>
        </div>

        <div style={row2}>
          <div>
            <label style={labelStyle}>Prénom *</label>
            <input style={inputStyle} value={form.firstName}
              onChange={e => upd('firstName', e.target.value)} required placeholder="Marie" />
          </div>
          <div>
            <label style={labelStyle}>Nom *</label>
            <input style={inputStyle} value={form.lastName}
              onChange={e => upd('lastName', e.target.value)} required placeholder="Dupont" />
          </div>
        </div>

        <label style={labelStyle}>Email *</label>
        <input style={inputStyle} type="email" value={form.email}
          onChange={e => { upd('email', e.target.value); if (!form.login) upd('login', e.target.value) }}
          required placeholder="marie@dupont.fr" />

        <label style={labelStyle}>Login (laisser vide = email)</label>
        <input style={inputStyle} value={form.login}
          onChange={e => upd('login', e.target.value)}
          placeholder={form.email || 'marie@dupont.fr'} />

        <div style={row2}>
          <div>
            <label style={labelStyle}>Langue</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['FR', 'EN'].map(l => (
                <button key={l} type="button" onClick={() => upd('lang', l)} style={{
                  padding: '7px 20px', border: '1px solid var(--line)',
                  background: form.lang === l ? 'var(--fg)' : 'none',
                  color: form.lang === l ? 'var(--bg)' : 'var(--fg)',
                  fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em',
                  cursor: 'pointer',
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Profil</label>
            <select value={form.profil} onChange={e => upd('profil', e.target.value)} style={{
              width: '100%', padding: '9px 12px', boxSizing: 'border-box',
              border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)',
              fontSize: 14, fontFamily: 'inherit', marginBottom: 16, cursor: 'pointer',
            }}>
              <option value="lecteur">Lecteur — accès en lecture seule</option>
              <option value="admin">Administrateur — gestion complète de sa galerie</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button type="submit" disabled={saving} style={{
            background: 'var(--fg)', color: 'var(--bg)', border: 'none',
            padding: '10px 28px', fontFamily: 'var(--sans)', fontSize: 10.5,
            letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            {saving ? 'Création…' : 'Créer le client'}
          </button>
          {error && (
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: '#c0392b' }}>
              ✗ {error}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

// ── Logs de navigation ────────────────────────────────────────────────────────

const PER_PAGE = 25

const EXCLUDED_IPS_KEY = 'dfly_logs_excluded_ips'

function LogsViewer({ authFetch }) {
  const [lines,       setLines]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [filterName,  setFilterName]  = useState('')
  const [filterDate,  setFilterDate]  = useState('')
  const [page,        setPage]        = useState(1)
  const [excludedIps, setExcludedIps] = useState(
    () => JSON.parse(localStorage.getItem(EXCLUDED_IPS_KEY) || '[]')
  )
  const [ctxMenu,      setCtxMenu]      = useState(null) // { x, y, ip }
  const [expandedIdx,  setExpandedIdx]  = useState(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    authFetch('galerie-logs-read.php')
      .then(r => r.json())
      .then(d => {
        if (d.ok) setLines(d.lines)
        else setError(d.error || 'Erreur inconnue')
      })
      .catch(e => setError(e.message || 'Erreur réseau'))
      .finally(() => setLoading(false))
  }, [authFetch])

  useEffect(() => setPage(1), [filterName, filterDate, excludedIps])

  // Fermer le menu contextuel au clic ailleurs
  useEffect(() => {
    if (!ctxMenu) return
    const close = () => setCtxMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('scroll', close)
    return () => { window.removeEventListener('click', close); window.removeEventListener('scroll', close) }
  }, [ctxMenu])

  function excludeIp(ip) {
    const next = [...new Set([...excludedIps, ip])]
    setExcludedIps(next)
    localStorage.setItem(EXCLUDED_IPS_KEY, JSON.stringify(next))
    setCtxMenu(null)
  }

  function restoreIp(ip) {
    const next = excludedIps.filter(x => x !== ip)
    setExcludedIps(next)
    localStorage.setItem(EXCLUDED_IPS_KEY, JSON.stringify(next))
  }

  const filtered = lines.filter(l => {
    if (excludedIps.includes(l.ip)) return false
    const matchName = !filterName || l.user.toLowerCase().includes(filterName.toLowerCase())
    const matchDate = !filterDate || l.ts.startsWith(filterDate)
    return matchName && matchDate
  })

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visible     = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const inputStyle = {
    padding: '8px 12px', border: '1px solid var(--line)',
    background: 'var(--bg)', color: 'var(--fg)',
    fontFamily: 'inherit', fontSize: 13,
  }
  const btnStyle = {
    background: 'none', border: '1px solid var(--line)', padding: '6px 14px',
    fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em',
    textTransform: 'uppercase', cursor: 'pointer', color: 'var(--fg-muted)',
  }

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--fg-muted)',
      fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Chargement…</div>
  )

  if (error) return (
    <div style={{ padding: '24px', background: 'rgba(192,57,43,0.05)', border: '1px solid rgba(192,57,43,0.2)',
      fontFamily: 'var(--sans)', fontSize: 12, color: '#c0392b' }}>
      Erreur : {error}
    </div>
  )

  return (
    <div>
      {/* IPs exclues */}
      {excludedIps.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: 'var(--fg-muted)' }}>IPs masquées :</span>
          {excludedIps.map(ip => (
            <span key={ip} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)',
              border: '1px solid var(--line)', padding: '3px 10px' }}>
              {ip}
              <button onClick={() => restoreIp(ip)} title="Rétablir" style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: 'var(--fg-muted)', fontSize: 14, lineHeight: 1,
              }}>×</button>
            </span>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={inputStyle} placeholder="Filtrer par nom…"
          value={filterName} onChange={e => setFilterName(e.target.value)} />
        <input style={inputStyle} type="date"
          value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.2em' }}>
          {filtered.length} entrée{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau */}
      <div style={{ border: '1px solid var(--line)', overflowX: 'auto' }}>
        <div style={{ display: 'grid',
          gridTemplateColumns: isMobile ? '44px 70px 1fr 80px' : '160px 180px 1fr 140px',
          background: 'var(--bg-alt)', borderBottom: '1px solid var(--line)' }}>
          {(isMobile ? ['Heure', 'User', 'URL', 'IP'] : ['Date / heure', 'Utilisateur', 'URL', 'IP']).map(h => (
            <div key={h} style={{ padding: isMobile ? '7px 6px' : '10px 14px',
              fontFamily: 'var(--sans)', fontSize: 10,
              letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              {h}
            </div>
          ))}
        </div>
        {visible.length === 0 ? (
          <div style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--fg-muted)',
            fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Aucune entrée</div>
        ) : visible.map((l, i) => {
          const isDevis    = l.url.startsWith('[devis]')
          const isExpanded = expandedIdx === i
          const devisParts = isDevis ? l.url.replace('[devis] ', '').split(' · ') : []
          const rowBg      = isDevis
            ? (i % 2 === 0 ? 'color-mix(in srgb, var(--bg) 85%, #7a9e7e)' : 'color-mix(in srgb, var(--bg-alt) 85%, #7a9e7e)')
            : (i % 2 === 0 ? 'var(--bg)' : 'var(--bg-alt)')
          return (
          <Fragment key={i}>
          <div style={{ display: 'grid',
            gridTemplateColumns: isMobile ? '44px 70px 1fr 80px' : '160px 180px 1fr 140px',
            borderBottom: isExpanded ? 'none' : '1px solid var(--line)',
            background: rowBg,
            cursor: isDevis ? 'pointer' : 'default' }}
            onClick={isDevis ? () => setExpandedIdx(isExpanded ? null : i) : undefined}>
            <div style={{ padding: isMobile ? '5px 6px' : '9px 14px',
              fontFamily: 'var(--sans)', fontSize: isMobile ? 11 : 12,
              color: 'var(--fg-muted)' }}>
              {isMobile ? l.ts.slice(11, 16) : l.ts}
            </div>
            <div style={{ padding: isMobile ? '5px 6px' : '9px 14px',
              fontFamily: 'var(--sans)', fontSize: isMobile ? 11 : 12,
              color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'nowrap' : 'normal' }}>
              {l.user}
            </div>
            <div style={{ padding: isMobile ? '5px 6px' : '9px 14px',
              fontFamily: 'var(--sans)', fontSize: isMobile ? 11 : 12,
              color: isDevis ? '#3a6e3a' : 'var(--fg)', wordBreak: 'break-all',
              fontWeight: isDevis ? 500 : 400 }}>{l.url}</div>
            <div
              onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, ip: l.ip }) }}
              style={{ padding: isMobile ? '5px 6px' : '9px 14px',
                fontFamily: 'var(--sans)', fontSize: isMobile ? 11 : 12,
                color: 'var(--fg-muted)', cursor: isDevis ? 'pointer' : 'context-menu', userSelect: 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'nowrap' : 'normal' }}>
              {l.ip}
            </div>
          </div>
          {isExpanded && isDevis && (
            <div style={{ padding: '10px 14px 12px', background: rowBg,
              borderBottom: '1px solid var(--line)', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[['Format', devisParts[0]], ['Prix TTC', devisParts[1]], ['Moments', devisParts[2]]].map(([label, val]) => val && (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.28em',
                    textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--fg)' }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          </Fragment>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, alignItems: 'center' }}>
          <button style={btnStyle} disabled={currentPage === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Précédent</button>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)' }}>
            Page {currentPage} / {totalPages}
          </span>
          <button style={btnStyle} disabled={currentPage === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Suivant ›</button>
        </div>
      )}

      {/* Menu contextuel */}
      {ctxMenu && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'fixed', top: ctxMenu.y, left: ctxMenu.x, zIndex: 1000,
          background: 'var(--bg)', border: '1px solid var(--line)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 180,
        }}>
          <div style={{ padding: '6px 0' }}>
            <div style={{ padding: '4px 14px 8px', fontFamily: 'var(--sans)', fontSize: 10,
              letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--fg-muted)',
              borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
              {ctxMenu.ip}
            </div>
            <button onClick={() => excludeIp(ctxMenu.ip)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'none', border: 'none', padding: '8px 14px',
              fontFamily: 'var(--sans)', fontSize: 12, cursor: 'pointer',
              color: 'var(--fg)', letterSpacing: '0.04em',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              Masquer cette IP
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page principale admin ─────────────────────────────────────────────────────

export default function GalerieAdmin() {
  const { user, logout, authFetch, hasAuth } = useGalerieAuth()
  const navigate = useNavigate()
  const [ents, setEnts] = useState([])
  const [selectedEnt, setSelectedEnt] = useState(null)
  const [entUsers, setEntUsers] = useState([])
  const [copiedId,   setCopiedId]   = useState(null)
  const rootRefresh = useRef(null)
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(() => {
    if (location.hash === '#logs') return 'logs'
    if (location.hash === '#clients') return 'clients'
    return 'galerie'
  })

  function switchTab(key) {
    setActiveTab(key)
    navigate(`#${key}`, { replace: true })
  }

  function loadEnts() {
    return authFetch('galerie-list-ents.php')
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setEnts(d.ents)
          if (d.ents.length === 1) setSelectedEnt(d.ents[0].shortDesc)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (!hasAuth('admin', 'R')) {
      navigate(import.meta.env.VITE_APP_MODE === 'galerie' ? '/albums' : '/galerie/albums')
      return
    }
    loadEnts()
  }, [hasAuth, navigate, authFetch]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedEnt) { setEntUsers([]); return }
    authFetch(`galerie-users.php?ent=${encodeURIComponent(selectedEnt)}`)
      .then(r => r.json())
      .then(d => { if (d.ok) setEntUsers(d.users) })
      .catch(() => {})
  }, [selectedEnt, authFetch])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <GalerieNav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px var(--gutter) 120px' }}>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 40, borderBottom: '1px solid var(--line)' }}>
          {[['galerie', 'Galerie'], ['clients', 'Clients'], ['logs', 'Logs de navigation']].map(([key, label]) => (
            <button key={key} onClick={() => switchTab(key)} style={{
              background: 'none', border: 'none', borderBottom: activeTab === key ? '2px solid var(--fg)' : '2px solid transparent',
              padding: '10px 20px 10px 0', marginBottom: -1,
              fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.28em',
              textTransform: 'uppercase', cursor: 'pointer',
              color: activeTab === key ? 'var(--fg)' : 'var(--fg-muted)',
              transition: 'color .15s',
            }}>{label}</button>
          ))}
        </div>

        {activeTab === 'logs' && <LogsViewer authFetch={authFetch} />}

        {activeTab === 'clients' && (
          <CreateClientForm authFetch={authFetch} onCreated={loadEnts} />
        )}

        {activeTab === 'galerie' && <>

        {/* Sélection client */}
        {ents.length > 1 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
              textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 12 }}>
              Client
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ents.map(e => (
                <button key={e.id} onClick={() => setSelectedEnt(e.shortDesc)} style={{
                  padding: '8px 16px', border: '1px solid var(--line)',
                  background: selectedEnt === e.shortDesc ? 'var(--fg)' : 'none',
                  color: selectedEnt === e.shortDesc ? 'var(--bg)' : 'var(--fg)',
                  fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em',
                  cursor: 'pointer', transition: 'all .15s',
                }}>
                  {e.raiSoc || e.shortDesc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Utilisateurs du client sélectionné */}
        {selectedEnt && entUsers.length > 0 && (
          <div style={{ border: '1px solid var(--line)', marginBottom: 24 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)',
              background: 'var(--bg-alt)', fontFamily: 'var(--sans)', fontSize: 10,
              letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              Liens de connexion · {selectedEnt}
            </div>
            {entUsers.map(u => {
              const link = `${window.location.origin}${import.meta.env.BASE_URL}galerie?cle=${u.cle}`
              const copied = copiedId === u.id
              return (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--fg)' }}>
                      {u.firstName} {u.lastName}
                    </div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                      {u.email}
                    </div>
                  </div>
                  <button onClick={() => {
                    navigator.clipboard.writeText(link)
                    setCopiedId(u.id)
                    setTimeout(() => setCopiedId(null), 2000)
                  }} style={{
                    background: copied ? 'var(--fg)' : 'none',
                    color: copied ? 'var(--bg)' : 'var(--fg)',
                    border: '1px solid var(--line)', padding: '6px 14px',
                    fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em',
                    textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s',
                  }}>
                    {copied ? 'Copié ✓' : 'Copier le lien'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Arbre */}
        {selectedEnt && (
          <div style={{ border: '1px solid var(--line)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)',
              background: 'var(--bg-alt)', fontFamily: 'var(--sans)', fontSize: 10,
              letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              Galerie · {selectedEnt}
            </div>
            <div style={{ padding: '0 16px' }}>
              <TreeNode key={selectedEnt} ent={selectedEnt} dir={null} depth={0} authFetch={authFetch} onRefresh={() => rootRefresh.current?.()} registerRefresh={fn => { rootRefresh.current = fn }} />
            </div>
          </div>
        )}

        {!selectedEnt && ents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)',
            fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            Aucun client trouvé.
          </div>
        )}

        </>}
      </div>
    </div>
  )
}
