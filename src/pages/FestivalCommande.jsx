import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const BASE = import.meta.env.BASE_URL
const API  = path => `${BASE}services/${path}`

const PRODUITS = [
  { key: 'poster_musicien_30x20',  label: 'Poster Musicien 20×30 cm',                             prix: 4.00 },
  { key: 'poster_chef_60x40',      label: 'Poster Chef 40×60 cm',                                 prix: 12.50 },
  { key: 'poster_orchestre_90x60', label: 'Poster Orchestre 60×90 cm',                            prix: 31.00 },
  { key: 'cle_usb',                label: 'Clé USB collector coffret bois gravé logo festival',   prix: 25.00 },
]

const HARMONIES = [
  '01_Passy',
  '02_Cluses - Harmonie',
  '03_Marignier',
  '04_Megeve',
  '05_Mieussy',
  '06_La Roche-sur-Foron',
  '07_Sixt Fer-Cheval',
  '08_Marnaz',
  '09_Bonne et Reignier-Esery',
  '10_Saint-Gervais',
  '11_L Echo du Jalouvre',
  '12_Magland',
  '13_Samons',
  '14_Cruseilles Le Chable',
  '15_Les Houches',
  '16_Taninges',
  '17_Cluses - Batterie Fanfare',
  '18_Viuz-en-Sallaz',
  '19_Sionzier',
  '20_Chatillon-sur-Cluses et Saint-Sigismond',
  '21_Bonneville - Ayze - Vougy',
  '22_Ville-la-Grand',
  '23_Saint-Pierre-en-Faucigny',
  '24_Mont-Saxonnex et Gaillard',
  '25_Sallanches',
  '26_Fillinges',
  '27_Saint-Jeoire',
]

const st = {
  page: { maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--sans)' },
  h1:   { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, marginBottom: 6, color: 'var(--fg)' },
  sub:  { fontSize: 13, color: 'var(--fg-muted)', marginBottom: 40 },
  label: { display: 'block', fontSize: 10.5, letterSpacing: '0.25em', textTransform: 'uppercase',
           color: 'var(--fg-muted)', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', boxSizing: 'border-box', border: '1px solid var(--line)',
           background: 'var(--bg)', color: 'var(--fg)', fontSize: 14, fontFamily: 'inherit', outline: 'none' },
  btn:  { padding: '11px 28px', background: 'var(--fg)', color: 'var(--bg)', border: 'none',
          fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase',
          cursor: 'pointer' },
  btnSecondary: { padding: '10px 20px', background: 'none', color: 'var(--fg)', border: '1px solid var(--line)',
                  fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
                  cursor: 'pointer' },
  section: { borderTop: '1px solid var(--line)', paddingTop: 28, marginTop: 32 },
  error: { color: '#c0392b', fontSize: 13, marginTop: 8 },
  success: { background: 'var(--bg-alt)', border: '1px solid var(--line)', padding: '20px 24px',
             fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.7, color: 'var(--fg)' },
}

function QtyInput({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
        style={{ width: 28, height: 28, border: '1px solid var(--line)', background: 'none',
                 cursor: 'pointer', fontSize: 16, color: 'var(--fg)' }}>−</button>
      <span style={{ minWidth: 24, textAlign: 'center', fontSize: 15 }}>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}
        style={{ width: 28, height: 28, border: '1px solid var(--line)', background: 'none',
                 cursor: 'pointer', fontSize: 16, color: 'var(--fg)' }}>+</button>
    </div>
  )
}

// ── Bloc Responsable ──────────────────────────────────────────────────────────
function BlocResponsable({ harmonie, harmonieData, onRefresh }) {
  const [ui, setUi]     = useState('closed') // closed | form | editing
  const [form, setForm] = useState({ nom: '', email: '', adresse: '' })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')

  const resp = harmonieData?.responsable
  const statut = harmonieData?.statut_global

  useEffect(() => {
    setUi('closed')
    setForm(resp ? { nom: resp.nom, email: resp.email, adresse: resp.adresse } : { nom: '', email: '', adresse: '' })
    setErr('')
  }, [harmonie])

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    const r = await fetch(API('festival-responsable.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ harmonie, ...form }),
    })
    const d = await r.json()
    setBusy(false)
    if (d.ok) { setUi('closed'); onRefresh() }
    else setErr(d.error || 'Erreur')
  }

  if (!harmonie || statut !== 'ouvert') return null

  return (
    <div style={{ marginTop: 60, borderTop: '2px solid var(--line)', paddingTop: 32 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                    color: 'var(--fg-muted)', marginBottom: 16 }}>Espace responsable d'orchestre</div>

      {ui === 'closed' && !resp && (
        <button style={st.btnSecondary} onClick={() => setUi('form')}>
          Je prends en charge la commande groupée de mon orchestre
        </button>
      )}

      {ui === 'closed' && resp && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--fg)', marginBottom: 4 }}>
            Responsable : <strong>{resp.nom}</strong> — {resp.email}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 12 }}>{resp.adresse}</div>
          <button style={st.btnSecondary} onClick={() => setUi('editing')}>Modifier</button>
        </div>
      )}

      {(ui === 'form' || ui === 'editing') && (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
          <div>
            <label style={st.label}>Nom</label>
            <input style={st.input} value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
          </div>
          <div>
            <label style={st.label}>Email</label>
            <input style={st.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label style={st.label}>Adresse de livraison</label>
            <textarea style={{ ...st.input, height: 80, resize: 'vertical' }}
              value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} required />
          </div>
          {err && <div style={st.error}>{err}</div>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" style={st.btn} disabled={busy}>
              {busy ? 'Enregistrement…' : 'Confirmer'}
            </button>
            <button type="button" style={st.btnSecondary} onClick={() => setUi('closed')}>Annuler</button>
          </div>
        </form>
      )}

      {resp && ui === 'closed' && <BlocLancement harmonie={harmonie} responsable={resp} />}
    </div>
  )
}

// ── Bloc Lancement ────────────────────────────────────────────────────────────
function BlocLancement({ harmonie, responsable }) {
  const [preview,  setPreview]  = useState(null)
  const [adresse,  setAdresse]  = useState(responsable.adresse)
  const [showConf, setShowConf] = useState(false)
  const [busy,     setBusy]     = useState(false)
  const [err,      setErr]      = useState('')
  const [done,     setDone]     = useState(false)

  async function loadPreview() {
    const r = await fetch(API(`festival-launch.php?harmonie=${encodeURIComponent(harmonie)}`))
    const d = await r.json()
    if (d.ok) { setPreview(d); setAdresse(d.responsable.adresse); setShowConf(true) }
    else setErr(d.error || 'Erreur')
  }

  async function confirm() {
    setBusy(true); setErr('')
    const r = await fetch(API('festival-launch.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ harmonie, adresse }),
    })
    const d = await r.json()
    setBusy(false)
    if (d.ok) setDone(true)
    else setErr(d.error || 'Erreur')
  }

  if (done) return (
    <div style={{ ...st.success, marginTop: 20 }}>
      La commande groupée a été lancée. Un récapitulatif a été envoyé à {responsable.email}.
    </div>
  )

  if (!showConf) return (
    <div style={{ marginTop: 20 }}>
      {err && <div style={st.error}>{err}</div>}
      <button style={st.btn} onClick={loadPreview}>
        Lancer la commande auprès de DFly
      </button>
    </div>
  )

  return (
    <div style={{ marginTop: 20, border: '1px solid var(--line)', padding: '24px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Confirmation avant envoi</div>

      <div style={{ marginBottom: 16 }}>
        <label style={st.label}>Adresse de livraison</label>
        <textarea style={{ ...st.input, height: 80, resize: 'vertical' }}
          value={adresse} onChange={e => setAdresse(e.target.value)} />
      </div>

      <div style={{ fontSize: 13, marginBottom: 16 }}>
        {preview.commandes.map(cmd => (
          <div key={cmd.numero} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 600 }}>{cmd.nom}</div>
            {Object.entries(cmd.produits).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} style={{ color: 'var(--fg-muted)', fontSize: 12 }}>
                {PRODUITS.find(p => p.key === k)?.label} × {v}
              </div>
            ))}
          </div>
        ))}
        <div style={{ fontWeight: 600, marginTop: 8 }}>
          Total : {preview.total.toFixed(2).replace('.', ',')} € (hors frais de port)
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 16 }}>
        Après confirmation, les musiciens ne pourront plus modifier leur commande.
        Pour toute difficulté : <a href="/contact" style={{ color: 'var(--fg)' }}>page contact</a>.
      </div>

      {err && <div style={st.error}>{err}</div>}
      <div style={{ display: 'flex', gap: 12 }}>
        <button style={st.btn} onClick={confirm} disabled={busy}>
          {busy ? 'Envoi…' : 'Confirmer et envoyer'}
        </button>
        <button style={st.btnSecondary} onClick={() => setShowConf(false)}>Annuler</button>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function FestivalCommande() {
  const [searchParams] = useSearchParams()
  const numeroParam    = searchParams.get('numero')

  const [harmonie,     setHarmonie]     = useState('')
  const [harmonieData, setHarmonieData] = useState(null)
  const [nom,          setNom]          = useState('')
  const [email,        setEmail]        = useState('')
  const [produits,     setProduits]     = useState({ poster_musicien_30x20: 0, poster_chef_60x40: 0, poster_orchestre_90x60: 0, cle_usb: 0 })
  const [busy,         setBusy]         = useState(false)
  const [err,          setErr]          = useState('')
  const [result,       setResult]       = useState(null)   // {numero, total}
  const [modifyOrder,  setModifyOrder]  = useState(null)   // order being modified
  const [modifyDone,   setModifyDone]   = useState(false)

  // Chargement commande à modifier
  useEffect(() => {
    if (!numeroParam) return
    fetch(API(`festival-order.php?numero=${encodeURIComponent(numeroParam)}`))
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setModifyOrder(d)
          setHarmonie(d.harmonie)
          setProduits(d.commande.produits)
        } else setErr(d.error || 'Commande introuvable')
      })
  }, [numeroParam])

  // Chargement données harmonie
  useEffect(() => {
    if (!harmonie) return
    fetch(API(`festival-harmonie.php?harmonie=${encodeURIComponent(harmonie)}`))
      .then(r => r.json())
      .then(d => { if (d.ok) setHarmonieData(d) })
  }, [harmonie])

  function refreshHarmonie() {
    if (!harmonie) return
    fetch(API(`festival-harmonie.php?harmonie=${encodeURIComponent(harmonie)}`))
      .then(r => r.json())
      .then(d => { if (d.ok) setHarmonieData(d) })
  }

  async function submitNew(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    const r = await fetch(API('festival-order.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ harmonie, nom, email, produits }),
    })
    const d = await r.json()
    setBusy(false)
    if (d.ok) setResult(d)
    else setErr(d.error || 'Une erreur est survenue')
  }

  async function submitModify(annuler = false) {
    setBusy(true); setErr('')
    const body = annuler
      ? { numero: modifyOrder.commande.numero, annuler: true }
      : { numero: modifyOrder.commande.numero, produits }
    const r = await fetch(API('festival-order.php'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await r.json()
    setBusy(false)
    if (d.ok) setModifyDone(annuler ? 'annulee' : 'modifiee')
    else setErr(d.error || 'Une erreur est survenue')
  }

  const commandeLancee = harmonieData?.statut_global !== 'ouvert'

  return (
    <div style={st.page}>
      <h1 style={st.h1}>190e Festival des Musiques du Faucigny</h1>
      <div style={st.sub}>Commande de produits souvenir — prix hors frais de port</div>

      {/* ── Mode modification ── */}
      {numeroParam && modifyOrder && !modifyDone && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>
            Modification de la commande <strong>{modifyOrder.commande.numero}</strong>
            {' '}— {modifyOrder.commande.nom} — {modifyOrder.harmonie}
          </div>
          {commandeLancee ? (
            <div style={st.success}>La commande de votre orchestre a été lancée, vous ne pouvez plus modifier votre commande.</div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                <tbody>
                  {PRODUITS.map(p => (
                    <tr key={p.key} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px 0', fontSize: 14 }}>{p.label}</td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>
                        <QtyInput value={produits[p.key] || 0} onChange={v => setProduits(q => ({ ...q, [p.key]: v }))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {err && <div style={st.error}>{err}</div>}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button style={st.btn} onClick={() => submitModify(false)} disabled={busy}>
                  {busy ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
                <button style={{ ...st.btnSecondary, color: '#c0392b', borderColor: '#c0392b' }}
                  onClick={() => { if (window.confirm('Annuler définitivement votre commande ?')) submitModify(true) }} disabled={busy}>
                  Annuler ma commande
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {numeroParam && modifyDone && (
        <div style={st.success}>
          {modifyDone === 'annulee'
            ? 'Votre commande a bien été annulée.'
            : 'Vos modifications ont bien été enregistrées.'}
        </div>
      )}

      {/* ── Mode nouvelle commande ── */}
      {!numeroParam && !result && (
        <form onSubmit={submitNew} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={st.label}>Votre orchestre</label>
            <select style={{ ...st.input }} value={harmonie} onChange={e => setHarmonie(e.target.value)} required>
              <option value="">— Sélectionner —</option>
              {HARMONIES.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {harmonie && commandeLancee && (
            <div style={{ ...st.success, background: '#fff3cd' }}>
              La commande de cet orchestre a été lancée. Vous ne pouvez plus passer de commande.
            </div>
          )}

          {harmonie && !commandeLancee && (
            <>
              <div>
                <label style={st.label}>Votre nom</label>
                <input style={st.input} value={nom} onChange={e => setNom(e.target.value)} required />
              </div>
              <div>
                <label style={st.label}>Votre email</label>
                <input style={st.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div style={st.section}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.25em', textTransform: 'uppercase',
                              color: 'var(--fg-muted)', marginBottom: 16 }}>
                  Produits — prix hors frais de port
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {PRODUITS.map(p => (
                      <tr key={p.key} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px 0', fontSize: 14 }}>{p.label}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 13, color: 'var(--fg-muted)', paddingRight: 16 }}>
                          {p.prix != null ? `${p.prix} €` : '—'}
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <QtyInput value={produits[p.key] || 0} onChange={v => setProduits(q => ({ ...q, [p.key]: v }))} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {err && <div style={st.error}>{err}</div>}
              <div>
                <button type="submit" style={st.btn} disabled={busy}>
                  {busy ? 'Envoi…' : 'Commander'}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {!numeroParam && result && (
        <div style={st.success}>
          <div style={{ marginBottom: 12 }}>
            Votre commande est enregistrée — numéro <strong>{result.numero}</strong>
          </div>
          <div>
            Elle sera expédiée dès qu'un responsable de votre orchestre se sera désigné
            et aura effectué le virement groupé.
          </div>
        </div>
      )}

      {/* ── Bloc responsable ── */}
      {harmonie && (
        <BlocResponsable
          harmonie={harmonie}
          harmonieData={harmonieData}
          onRefresh={refreshHarmonie}
        />
      )}
    </div>
  )
}
