import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const BASE      = import.meta.env.BASE_URL
const API       = path => `${BASE}services/${path}`
const APP_NAME  = import.meta.env.VITE_APP_NAME     || 'DFly'
const APP_TAGLINE = import.meta.env.VITE_APP_TAGLINE || ''
const APP_HOME  = import.meta.env.VITE_APP_HOME_URL || '/'
const LOGO_URL  = import.meta.env.VITE_APP_LOGO_URL || ''

const PRODUITS = [
  { key: 'poster_musicien_30x20',  label: 'Poster S - 20×30 cm',                             prix: 4.00 },
  { key: 'poster_chef_60x40',      label: 'Poster M - 40×60 cm',                             prix: 12.50 },
  { key: 'poster_orchestre_90x60', label: 'Poster L - 60×90 cm',                             prix: 31.00 },
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

const POSTERS_KEYS = ['poster_musicien_30x20', 'poster_chef_60x40', 'poster_orchestre_90x60']

function calcPort(produits) {
  const sousPosters = POSTERS_KEYS.reduce((s, k) => {
    const p = PRODUITS.find(x => x.key === k)
    return s + (produits[k] || 0) * (p?.prix || 0)
  }, 0)
  const portPosters = sousPosters > 0 && sousPosters <= 10 ? 6.00 : 0.00
  const qtyUsb      = produits['cle_usb'] || 0
  const portUsb     = qtyUsb > 0 ? Math.ceil(qtyUsb / 2) * 3 : 0
  return { posters: portPosters, usb: portUsb }
}

function FraisPort({ produits }) {
  const total = PRODUITS.reduce((s, p) => s + (produits[p.key] || 0) * p.prix, 0)
  const hasUsb = (produits['cle_usb'] || 0) > 0

  if (total === 0) return null

  const totalSt = { display: 'flex', justifyContent: 'space-between', fontSize: 14,
                    fontWeight: 600, color: 'var(--fg)', padding: '10px 0',
                    borderTop: '1px solid var(--fg)', marginTop: 4 }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={totalSt}>
        <span>Total hors frais de port (TTC)</span>
        <span>{total.toFixed(2)} €</span>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
        Les frais de port seront calculés et répartis entre les musiciens au moment du lancement de la commande groupée.
        Posters : port offert si la commande groupée de posters dépasse 10 €, sinon 6 € répartis entre les commandeurs.
        {hasUsb && ' Clé USB : expédition La Poste, 3 € par lot de 2 clés, répartis entre les commandeurs.'}
      </div>
    </div>
  )
}

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

// ── Bloc Contact livraison ────────────────────────────────────────────────────
function BlocResponsable({ harmonie, harmonieData, onRefresh }) {
  const [ui, setUi]     = useState('closed') // closed | form | editing
  const [form, setForm] = useState({ nom: '', email: '', tel: '', rue: '', cp: '', ville: '' })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')

  const resp = harmonieData?.responsable
  const statut = harmonieData?.statut_global

  useEffect(() => {
    setUi('closed')
    setForm(resp
      ? { nom: resp.nom, email: resp.email, tel: resp.tel || '', rue: resp.rue || '', cp: resp.cp || '', ville: resp.ville || '' }
      : { nom: '', email: '', tel: '', rue: '', cp: '', ville: '' })
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
                    color: 'var(--fg-muted)', marginBottom: 16 }}>Contact pour la livraison groupée</div>

      {ui === 'closed' && !resp && (
        <button style={st.btnSecondary} onClick={() => setUi('form')}>
          Je prends en charge la livraison groupée de mon orchestre
        </button>
      )}

      {ui === 'closed' && resp && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--fg)', marginBottom: 4 }}>
            Contact : <strong>{resp.nom}</strong> — {resp.email}
            {resp.tel && <span> — {resp.tel}</span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 12 }}>
            {resp.rue && <div>{resp.rue}</div>}
            {(resp.cp || resp.ville) && <div>{resp.cp} {resp.ville}</div>}
          </div>
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
            <label style={st.label}>Téléphone <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(facultatif)</span></label>
            <input style={st.input} type="tel" value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} />
          </div>
          <div>
            <label style={st.label}>Rue</label>
            <input style={st.input} autoComplete="street-address" value={form.rue} onChange={e => setForm(f => ({ ...f, rue: e.target.value }))} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
            <div>
              <label style={st.label}>Code postal</label>
              <input style={st.input} autoComplete="postal-code" value={form.cp} onChange={e => setForm(f => ({ ...f, cp: e.target.value }))} required />
            </div>
            <div>
              <label style={st.label}>Ville</label>
              <input style={st.input} autoComplete="address-level2" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} required />
            </div>
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
function BlocLancement({ harmonie, responsable, token }) {
  const [preview,    setPreview]    = useState(null)
  const [addrEdit,   setAddrEdit]   = useState(false)
  const [nom,        setNom]        = useState(responsable.nom   || '')
  const [rue,        setRue]        = useState(responsable.rue   || '')
  const [cp,         setCp]         = useState(responsable.cp    || '')
  const [ville,      setVille]      = useState(responsable.ville || '')
  const [showConf,   setShowConf]   = useState(false)
  const [busy,       setBusy]       = useState(false)
  const [err,        setErr]        = useState('')
  const [done,       setDone]       = useState(false)

  async function loadPreview() {
    const r = await fetch(API(`festival-launch.php?token=${encodeURIComponent(token)}`))
    const d = await r.json()
    if (d.ok) {
      setPreview(d)
      setNom(d.responsable.nom   || '')
      setRue(d.responsable.rue   || '')
      setCp(d.responsable.cp     || '')
      setVille(d.responsable.ville || '')
      setShowConf(true)
    } else setErr(d.error || 'Erreur')
  }

  async function confirm() {
    setBusy(true); setErr('')
    const adresse = `${rue}\n${cp} ${ville}`
    const r = await fetch(API('festival-launch.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nom, adresse }),
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
        {addrEdit ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
            <input style={st.input} placeholder="Nom" autoComplete="name"
              value={nom} onChange={e => setNom(e.target.value)} />
            <input style={st.input} placeholder="Rue" autoComplete="street-address"
              value={rue} onChange={e => setRue(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
              <input style={st.input} placeholder="Code postal" autoComplete="postal-code"
                value={cp} onChange={e => setCp(e.target.value)} />
              <input style={st.input} placeholder="Ville" autoComplete="address-level2"
                value={ville} onChange={e => setVille(e.target.value)} />
            </div>
            <button type="button" style={{ ...st.btnSecondary, alignSelf: 'flex-start' }}
              onClick={() => setAddrEdit(false)}>Valider</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--fg)' }}>
              <div style={{ fontWeight: 600 }}>{nom}</div>
              <div>{rue}</div>
              <div>{cp} {ville}</div>
            </div>
            <button type="button" style={{ ...st.btnSecondary, fontSize: 10, padding: '5px 12px', whiteSpace: 'nowrap' }}
              onClick={() => setAddrEdit(true)}>Modifier</button>
          </div>
        )}
      </div>

      <div style={{ fontSize: 13, marginBottom: 16 }}>
        {calcGroupPort(preview.commandes).map(cmd => (
          <div key={cmd.numero} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 600 }}>{cmd.nom}</div>
            {Object.entries(cmd.produits).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} style={{ color: 'var(--fg-muted)', fontSize: 12 }}>
                {PRODUITS.find(p => p.key === k)?.label} × {v}
              </div>
            ))}
            {cmd.sharePosters > 0 && <div style={{ color: 'var(--fg-muted)', fontSize: 12 }}>Port posters (part) : {cmd.sharePosters.toFixed(2)} €</div>}
            {cmd.sharePosters === 0 && POSTERS_KEYS.some(k => (cmd.produits[k] || 0) > 0) && <div style={{ color: 'var(--fg-muted)', fontSize: 12 }}>Port posters : offert</div>}
            {cmd.shareUsb > 0 && <div style={{ color: 'var(--fg-muted)', fontSize: 12 }}>Port clé USB (part) : {cmd.shareUsb.toFixed(2)} €</div>}
            <div style={{ fontSize: 12, marginTop: 4 }}>Total : {cmd.total.toFixed(2).replace('.', ',')} €</div>
          </div>
        ))}
        <div style={{ fontWeight: 600, marginTop: 8 }}>
          Total général : {calcGroupPort(preview.commandes).reduce((s, c) => s + c.total, 0).toFixed(2).replace('.', ',')} €
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

function SuiviCommande({ statut, statut_posters, statut_usb }) {
  const steps = [
    { ok: true,                                  label: 'Commande groupée lancée' },
    { ok: statut === 'virement_recu' || statut === 'cloture',
                                                 label: 'Virement reçu par DFly' },
    { ok: statut_posters === 'commande_envoyee', label: 'Posters commandés (Saal Digital — livraison directe à votre adresse)' },
    { ok: statut_usb === 'commande_passee' || statut_usb === 'expediee',
                                                 label: 'Clé USB commandée fournisseur' },
    { ok: statut_usb === 'expediee',             label: 'Clé USB expédiée' },
    { ok: statut === 'cloture',                  label: 'Commande clôturée' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         fontSize: 11, fontWeight: 600,
                         background: s.ok ? '#2980b9' : 'var(--bg-alt)',
                         border: '1px solid ' + (s.ok ? '#2980b9' : 'var(--line)'),
                         color: s.ok ? '#fff' : 'var(--fg-muted)' }}>
            {s.ok ? '✓' : ''}
          </span>
          <span style={{ color: s.ok ? 'var(--fg)' : 'var(--fg-muted)' }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

function calcGroupPort(commandes) {
  const sousPosters = commandes.reduce((s, cmd) =>
    s + POSTERS_KEYS.reduce((ss, k) => ss + (cmd.produits[k] || 0) * (PRODUITS.find(p => p.key === k)?.prix || 0), 0), 0)
  const totalUsb = commandes.reduce((s, cmd) => s + (cmd.produits['cle_usb'] || 0), 0)
  const portPosters = sousPosters > 0 && sousPosters <= 10 ? 6.00 : 0.00
  const portUsb     = totalUsb > 0 ? Math.ceil(totalUsb / 2) * 3 : 0.00

  const nbPosterOrderers = commandes.filter(cmd => POSTERS_KEYS.some(k => (cmd.produits[k] || 0) > 0)).length
  const nbUsbOrderers    = commandes.filter(cmd => (cmd.produits['cle_usb'] || 0) > 0).length

  return commandes.map(cmd => {
    const hasPosters = POSTERS_KEYS.some(k => (cmd.produits[k] || 0) > 0)
    const hasUsb     = (cmd.produits['cle_usb'] || 0) > 0
    const sharePosters = hasPosters && nbPosterOrderers > 0 ? Math.round(portPosters / nbPosterOrderers * 100) / 100 : 0
    const shareUsb     = hasUsb     && nbUsbOrderers    > 0 ? Math.round(portUsb    / nbUsbOrderers    * 100) / 100 : 0
    const sous = PRODUITS.reduce((s, p) => s + (cmd.produits[p.key] || 0) * p.prix, 0)
    return { ...cmd, sharePosters, shareUsb, total: Math.round((sous + sharePosters + shareUsb) * 100) / 100 }
  })
}


function FestivalHeader() {
  const navigate = useNavigate()
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--bg)', borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        padding: '0 var(--gutter)', height: 57,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href={APP_HOME} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          color: 'var(--fg)', textDecoration: 'none',
        }}>
          {LOGO_URL && <img src={LOGO_URL} alt={APP_NAME} style={{ width: 32, height: 32, objectFit: 'contain' }} />}
          <div>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 22, lineHeight: 1 }}>{APP_NAME}</div>
            {APP_TAGLINE && (
              <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'var(--fg-muted)', marginTop: 3 }}>
                {APP_TAGLINE}
              </div>
            )}
          </div>
        </a>
        <button onClick={() => navigate('/galerie')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: 'var(--fg)', padding: 0,
        }}>
          Galerie
        </button>
      </div>
    </header>
  )
}

export default function FestivalCommande() {
  const [searchParams] = useSearchParams()
  const numeroParam       = searchParams.get('numero')
  const confirmerParam    = searchParams.get('confirmer')
  const responsableParam  = searchParams.get('responsable')

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
  const [reactivated,  setReactivated]  = useState(false)
  const [confirmResult,    setConfirmResult]    = useState(null)
  const [responsableData,  setResponsableData]  = useState(null)  // vue responsable

  // Vue responsable via token
  useEffect(() => {
    if (!responsableParam) return
    fetch(API(`festival-view-responsable.php?token=${encodeURIComponent(responsableParam)}`))
      .then(r => r.json())
      .then(d => { if (d.ok) setResponsableData(d); else setErr(d.error || 'Lien invalide') })
      .catch(() => setErr('Erreur de chargement'))
  }, [responsableParam])

  // Confirmation par token
  useEffect(() => {
    if (!confirmerParam) return
    fetch(API('festival-confirm.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: confirmerParam }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) setConfirmResult(d.deja_confirme ? 'deja' : 'ok')
        else setConfirmResult('err')
      })
      .catch(() => setConfirmResult('err'))
  }, [confirmerParam])

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

  async function submitModify(action = 'modifier') {
    setBusy(true); setErr('')
    const body = action === 'annuler'   ? { numero: modifyOrder.commande.numero, annuler: true }
               : action === 'reactiver' ? { numero: modifyOrder.commande.numero, reactiver: true }
               :                          { numero: modifyOrder.commande.numero, produits }
    const r = await fetch(API('festival-order.php'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await r.json()
    setBusy(false)
    if (d.ok) {
      if (action === 'reactiver' || action === 'annuler') {
        const r2 = await fetch(API(`festival-order.php?numero=${encodeURIComponent(modifyOrder.commande.numero)}`))
        const d2 = await r2.json()
        if (d2.ok) { setModifyOrder(d2); setProduits(d2.commande.produits) }
        if (action === 'reactiver') setReactivated(true)
      } else {
        setModifyDone('modifiee')
      }
    }
    else setErr(d.error || 'Une erreur est survenue')
  }

  const commandeLancee = harmonieData != null && harmonieData.statut_global !== 'ouvert'

  return (
    <>
    <FestivalHeader />
    <div style={{ ...st.page, paddingTop: 97 }}>
      <h1 style={st.h1}>190e Festival des Musiques du Faucigny</h1>
      <div style={st.sub}>Commande de produits souvenir — prix hors frais de port (TTC)</div>

      {/* ── Mode modification ── */}
      {numeroParam && modifyOrder && !modifyDone && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>
            Modification de la commande <strong>{modifyOrder.commande.numero}</strong>
            {' '}— {modifyOrder.commande.nom} — {modifyOrder.harmonie}
          </div>
          {reactivated && (
            <div style={{ ...st.success, marginBottom: 16 }}>Votre commande a bien été réactivée.</div>
          )}
          {commandeLancee ? (
            <div>
              <div style={{ ...st.success, marginBottom: 20 }}>
                La commande de votre orchestre a été lancée — vous ne pouvez plus modifier votre commande.
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <tbody>
                  {PRODUITS.map(p => {
                    const qty = modifyOrder.commande.produits[p.key] || 0
                    if (!qty) return null
                    return (
                      <tr key={p.key} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px 0', fontSize: 14 }}>{p.label}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 13, color: 'var(--fg-muted)', paddingRight: 16 }}>
                          {p.prix.toFixed(2)} €
                        </td>
                        <td style={{ padding: '12px 0', fontSize: 14, textAlign: 'center', minWidth: 40 }}>{qty}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14,
                            fontWeight: 600, borderTop: '1px solid var(--fg)', paddingTop: 10, marginTop: 4 }}>
                <span>Total hors frais de port (TTC)</span>
                <span>{PRODUITS.reduce((s, p) => s + (modifyOrder.commande.produits[p.key] || 0) * p.prix, 0).toFixed(2)} €</span>
              </div>
            </div>
          ) : modifyOrder.commande.statut === 'annulee' ? (
            <>
              <div style={{ ...st.success, background: '#fff3cd', marginBottom: 16 }}>
                Cette commande a été annulée.
              </div>
              {err && <div style={st.error}>{err}</div>}
              <button style={st.btn} onClick={() => submitModify('reactiver')} disabled={busy}>
                {busy ? 'Réactivation…' : 'Réactiver ma commande'}
              </button>
            </>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <tbody>
                  {PRODUITS.map(p => (
                    <tr key={p.key} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px 0', fontSize: 14 }}>{p.label}</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 13, color: 'var(--fg-muted)', paddingRight: 16 }}>
                        {p.prix.toFixed(2)} €
                      </td>
                      <td style={{ padding: '12px 0' }}>
                        <QtyInput value={produits[p.key] || 0} onChange={v => setProduits(q => ({ ...q, [p.key]: v }))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <FraisPort produits={produits} />
              {err && <div style={st.error}>{err}</div>}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button style={st.btn} onClick={() => submitModify('modifier')} disabled={busy}>
                  {busy ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
                <button style={{ ...st.btnSecondary, color: '#c0392b', borderColor: '#c0392b' }}
                  onClick={() => { if (window.confirm('Annuler définitivement votre commande ?')) submitModify('annuler') }} disabled={busy}>
                  Annuler ma commande
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {numeroParam && modifyDone && (
        <div style={st.success}>
          Vos modifications ont bien été enregistrées.
        </div>
      )}

      {/* ── Mode nouvelle commande ── */}
      {!numeroParam && !result && !responsableParam && (
        <form onSubmit={submitNew} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: '14px 18px', background: 'var(--bg-alt)', border: '1px solid var(--line)',
                        fontSize: 13, color: 'var(--fg)', lineHeight: 1.6 }}>
            Pour limiter les frais de port, les commandes sont regroupées par harmonie. Un membre volontaire se charge du virement et de la réception des produits.
          </div>
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
              <br />Si vous avez une question → <a href="https://dfly.fr/contact" style={{ color: 'inherit' }}>Contactez-nous !</a>
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
                  Produits
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {PRODUITS.map(p => (
                      <tr key={p.key} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px 0', fontSize: 14 }}>{p.label}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 13, color: 'var(--fg-muted)', paddingRight: 16 }}>
                          {p.prix != null ? `${p.prix.toFixed(2)} €` : '—'}
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <QtyInput value={produits[p.key] || 0} onChange={v => setProduits(q => ({ ...q, [p.key]: v }))} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <FraisPort produits={produits} />
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

      {/* ── Vue responsable ── */}
      {responsableParam && !responsableData && !err && (
        <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Chargement…</div>
      )}
      {responsableParam && err && <div style={st.error}>{err}</div>}
      {responsableParam && responsableData && (
        <div>
          <div style={st.success}>
            Bonjour <strong>{responsableData.responsable.nom}</strong>, votre adresse email est confirmée.
            Vous êtes le contact pour la livraison groupée de <strong>{responsableData.harmonie}</strong>.
          </div>

          {/* Commandes en cours */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                          color: 'var(--fg-muted)', marginBottom: 12 }}>
              Commandes confirmées ({responsableData.commandes.length})
            </div>
            {responsableData.commandes.length === 0 ? (
              <div style={{ color: 'var(--fg-muted)', fontStyle: 'italic', fontSize: 14 }}>
                Aucune commande confirmée pour l'instant.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 0', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                                 color: 'var(--fg-muted)', borderBottom: '1px solid var(--line)', textAlign: 'left', fontWeight: 400 }}>Musicien</th>
                    {PRODUITS.map(p => (
                      <th key={p.key} style={{ padding: '8px 8px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                                               color: 'var(--fg-muted)', borderBottom: '1px solid var(--line)', textAlign: 'center', fontWeight: 400 }}>{p.label}</th>
                    ))}
                    <th style={{ padding: '8px 0', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                                 color: 'var(--fg-muted)', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 400 }}>Total TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {responsableData.commandes.map(cmd => (
                    <tr key={cmd.numero} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>
                        {cmd.nom}<br />
                        <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{cmd.email}</span>
                      </td>
                      {PRODUITS.map(p => (
                        <td key={p.key} style={{ padding: '10px 8px', fontSize: 13, textAlign: 'center' }}>
                          {cmd.produits[p.key] || 0}
                        </td>
                      ))}
                      <td style={{ padding: '10px 0', fontSize: 13, textAlign: 'right' }}>
                        {cmd.total.toFixed(2).replace('.', ',')} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {responsableData.statut === 'ouvert' && (
            <BlocLancement harmonie={responsableData.harmonie} responsable={responsableData.responsable} token={responsableParam} />
          )}
          {responsableData.statut !== 'ouvert' && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                            color: 'var(--fg-muted)', marginBottom: 12 }}>Suivi de votre commande</div>
              <SuiviCommande statut={responsableData.statut}
                statut_posters={responsableData.statut_posters}
                statut_usb={responsableData.statut_usb} />
            </div>
          )}
        </div>
      )}

      {confirmerParam && confirmResult === 'ok' && (
        <div style={st.success}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Votre commande est confirmée !</div>
          <div>Elle sera expédiée dès qu'un responsable de votre orchestre se sera désigné et aura effectué le virement groupé.</div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fg-muted)' }}>Un email de confirmation vous a été envoyé.</div>
        </div>
      )}
      {confirmerParam && confirmResult === 'deja' && (
        <div style={st.success}>Votre commande a déjà été confirmée.</div>
      )}
      {confirmerParam && confirmResult === 'err' && (
        <div style={st.error}>Ce lien de confirmation est invalide ou a déjà été utilisé.</div>
      )}
      {confirmerParam && !confirmResult && (
        <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Confirmation en cours…</div>
      )}

      {!numeroParam && !confirmerParam && result && (
        <div style={st.success}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Votre commande est enregistrée — numéro <strong>{result.numero}</strong></div>
          <div style={{ marginBottom: 8 }}>Un email vous a été envoyé. <strong>Cliquez sur le lien de confirmation</strong> qu'il contient pour valider votre commande.</div>
          <div style={{ fontWeight: 600 }}>Tant que vous n'avez pas confirmé, votre commande reste en attente et ne sera pas prise en compte.</div>
        </div>
      )}

      {/* ── Bloc responsable (public) — masqué si vue responsable active ── */}
      {harmonie && !responsableParam && (
        <BlocResponsable
          harmonie={harmonie}
          harmonieData={harmonieData}
          onRefresh={refreshHarmonie}
        />
      )}
    </div>
    </>
  )
}
