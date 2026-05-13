import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGalerieAuth } from '../context/GalerieAuth'
import DflyMonogram from '../components/DflyMonogram'

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

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    setSaving(true)
    setSuccess(false)
    const r = await authFetch('galerie-meta.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ent, path, meta: form }),
    })
    const d = await r.json()
    setSaving(false)
    if (d.ok) { setSuccess(true); onSave(d.meta) }
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
            fontSize: 13, color: 'var(--sage)' }}>✓ Enregistré</span>
        )}
      </div>
    </div>
  )
}

// ── Zone d'upload drag & drop ─────────────────────────────────────────────────

function UploadZone({ ent, path, onDone, authFetch }) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [results,   setResults]   = useState([])
  const inputRef = useRef()

  async function uploadFiles(fileList) {
    setUploading(true)
    setResults([])
    const files = Array.from(fileList).filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (!files.length) { setUploading(false); return }

    const batchSize = 5
    const allResults = []
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      const fd = new FormData()
      fd.append('ent', ent)
      fd.append('path', path)
      batch.forEach(f => fd.append(f.name, f))
      const r = await authFetch('galerie-upload.php', { method: 'POST', body: fd })
      const d = await r.json()
      allResults.push(...(d.files || []))
      setResults([...allResults])
    }

    setUploading(false)
    const ok = allResults.filter(r => r.ok).length
    if (ok > 0) onDone()
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    uploadFiles(e.dataTransfer.files)
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--fg)' : 'var(--line)'}`,
          background: dragging ? 'var(--bg-alt)' : 'var(--bg)',
          padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
          transition: 'all .15s',
        }}
      >
        <input ref={inputRef} type="file" multiple accept="image/*,video/*"
          style={{ display: 'none' }} onChange={e => uploadFiles(e.target.files)} />
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>↑</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
          {uploading ? 'Upload en cours…' : 'Glisser les photos ici ou cliquer pour parcourir'}
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13,
          color: 'var(--fg-muted)', marginTop: 8 }}>
          JPG, JPEG, PNG, WEBP · Miniatures générées automatiquement
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
              fontSize: 12, fontFamily: 'var(--sans)', padding: '4px 8px',
              background: r.ok ? 'rgba(0,0,0,0.03)' : 'rgba(192,57,43,0.05)',
              color: r.ok ? 'var(--fg-muted)' : '#c0392b' }}>
              <span>{r.name}</span>
              <span>{r.ok ? '✓' : r.error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Nœud de l'arbre ───────────────────────────────────────────────────────────

function TreeNode({ ent, dir, depth, authFetch, onRefresh }) {
  const [open,        setOpen]        = useState(depth === 0)
  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [showMeta,    setShowMeta]    = useState(false)
  const [showUpload,  setShowUpload]  = useState(false)
  const [showMkdir,   setShowMkdir]   = useState(false)
  const [newDirName,  setNewDirName]  = useState('')
  const [meta,        setMeta]        = useState(dir?.meta || null)

  const path = dir?.path || ''
  const name = dir?.name || ent

  async function loadChildren() {
    if (data) return
    setLoading(true)
    const qs = new URLSearchParams({ ent, path })
    const r  = await authFetch(`galerie-browse.php?${qs}`)
    const d  = await r.json()
    if (d.ok) setData(d)
    setLoading(false)
  }

  function toggle() {
    if (!open) loadChildren()
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
      loadChildren()
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
          <ActionBtn onClick={() => { setShowMeta(m => !m); setShowUpload(false); setShowMkdir(false) }}
            active={showMeta} title="Modifier les informations">✏️</ActionBtn>
          <ActionBtn onClick={() => { setShowUpload(u => !u); setShowMeta(false); setShowMkdir(false) }}
            active={showUpload} title="Uploader des photos">⬆</ActionBtn>
          <ActionBtn onClick={() => { setShowMkdir(m => !m); setShowMeta(false); setShowUpload(false) }}
            active={showMkdir} title="Créer un sous-dossier">📁+</ActionBtn>
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
            onDone={() => { setData(null); loadChildren() }} />
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
              fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)',
              letterSpacing: '0.2em' }}>
              {data.files.length} fichier{data.files.length > 1 ? 's' : ''}
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

// ── Logs de navigation ────────────────────────────────────────────────────────

const PER_PAGE = 25

function LogsViewer({ authFetch }) {
  const [lines,      setLines]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filterName, setFilterName] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [page,       setPage]       = useState(1)

  useEffect(() => {
    setLoading(true)
    authFetch('galerie-logs-read.php')
      .then(r => r.json())
      .then(d => { if (d.ok) setLines(d.lines) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authFetch])

  useEffect(() => setPage(1), [filterName, filterDate])

  const filtered = lines.filter(l => {
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

  return (
    <div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '160px 180px 1fr 140px',
          background: 'var(--bg-alt)', borderBottom: '1px solid var(--line)' }}>
          {['Date / heure', 'Utilisateur', 'URL', 'IP'].map(h => (
            <div key={h} style={{ padding: '10px 14px', fontFamily: 'var(--sans)', fontSize: 10,
              letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              {h}
            </div>
          ))}
        </div>
        {visible.length === 0 ? (
          <div style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--fg-muted)',
            fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Aucune entrée</div>
        ) : visible.map((l, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 180px 1fr 140px',
            borderBottom: '1px solid var(--line)',
            background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-alt)' }}>
            <div style={{ padding: '9px 14px', fontFamily: 'var(--sans)', fontSize: 12,
              color: 'var(--fg-muted)' }}>{l.ts}</div>
            <div style={{ padding: '9px 14px', fontFamily: 'var(--sans)', fontSize: 12,
              color: 'var(--fg)' }}>{l.user}</div>
            <div style={{ padding: '9px 14px', fontFamily: 'var(--sans)', fontSize: 12,
              color: 'var(--fg)', wordBreak: 'break-all' }}>{l.url}</div>
            <div style={{ padding: '9px 14px', fontFamily: 'var(--sans)', fontSize: 12,
              color: 'var(--fg-muted)' }}>{l.ip}</div>
          </div>
        ))}
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
  const [copiedId, setCopiedId] = useState(null)
  const [activeTab, setActiveTab] = useState('galerie')

  useEffect(() => {
    if (!hasAuth('admin', 'R')) {
      navigate('/galerie/albums')
      return
    }
    // Charger la liste des entreprises
    authFetch('galerie-browse.php?listEnts=1')
      .then(r => r.json())
      .then(d => {
        const entList = user?.ents || []
        setEnts(entList)
        if (entList.length === 1) setSelectedEnt(entList[0].shortDesc)
      })
  }, [hasAuth, navigate, authFetch, user])

  useEffect(() => {
    if (!selectedEnt) { setEntUsers([]); return }
    authFetch(`galerie-users.php?ent=${encodeURIComponent(selectedEnt)}`)
      .then(r => r.json())
      .then(d => { if (d.ok) setEntUsers(d.users) })
      .catch(() => {})
  }, [selectedEnt, authFetch])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px var(--gutter) 120px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => navigate('/')}>
            <DflyMonogram size={28} color="var(--fg)" />
            <div>
              <div style={{ fontFamily: 'var(--serif-display)', fontSize: 20 }}>
                D<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Fly</span>
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.32em',
                textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Administration</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/galerie/albums')} style={{
              background: 'none', border: '1px solid var(--line)', padding: '7px 16px',
              fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.24em',
              textTransform: 'uppercase', cursor: 'pointer', color: 'var(--fg-muted)',
            }}>Galerie client</button>
            <button onClick={() => { logout(); navigate('/') }} style={{
              background: 'none', border: '1px solid var(--line)', padding: '7px 16px',
              fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.24em',
              textTransform: 'uppercase', cursor: 'pointer', color: 'var(--fg-muted)',
            }}>Déconnexion</button>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 40, borderBottom: '1px solid var(--line)' }}>
          {[['galerie', 'Galerie'], ['logs', 'Logs de navigation']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
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
              <TreeNode ent={selectedEnt} dir={null} depth={0} authFetch={authFetch} onRefresh={() => {}} />
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
