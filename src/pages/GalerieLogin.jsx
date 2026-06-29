import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGalerieAuth } from '../context/GalerieAuth'
import useNoIndex from '../hooks/useNoIndex'

const BASE        = import.meta.env.BASE_URL
const APP_NAME    = import.meta.env.VITE_APP_NAME       || 'Galerie'
const APP_TAGLINE = import.meta.env.VITE_APP_TAGLINE    || 'Galerie privée'
const APP_HOME    = import.meta.env.VITE_APP_HOME_URL   || '/'
const LOGO_URL    = import.meta.env.VITE_APP_LOGO_URL   || ''
const LOGO_EMOJI  = import.meta.env.VITE_APP_LOGO_EMOJI || ''

const inputStyle = {
  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
  border: '1px solid var(--line)', background: 'var(--bg)',
  color: 'var(--fg)', fontSize: 15, fontFamily: 'inherit', outline: 'none',
}

// ── Bloc "renvoi de lien" ─────────────────────────────────────────────────────

function ResendBlock() {
  const [open,         setOpen]         = useState(false)
  const [email,        setEmail]        = useState('')
  const [name,         setName]         = useState('')
  const [step,         setStep]         = useState('email')  // 'email' | 'notfound' | 'name' | 'done'
  const [busy,         setBusy]         = useState(false)
  const [message,      setMessage]      = useState('')
  const [publicEvents, setPublicEvents] = useState(null)  // null = pas encore chargé

  async function loadPublicEvents() {
    if (publicEvents !== null) return
    try {
      const res = await fetch(`${BASE}services/galerie-public-events.php`)
      const d   = await res.json()
      setPublicEvents(d.ok ? d.events : [])
    } catch {
      setPublicEvents([])
    }
  }

  async function submitEmail(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch(`${BASE}services/galerie-resend-link.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = await res.json()
      if (d.ok) {
        setMessage(`Votre lien a été envoyé à ${email}. Pensez à vérifier vos spams.`)
        setStep('done')
      } else if (d.notFound) {
        await loadPublicEvents()
        setStep('notfound')
      } else {
        setMessage("Une erreur s'est produite. Contactez-nous directement.")
        setStep('done')
      }
    } catch {
      setMessage("Une erreur s'est produite. Contactez-nous directement.")
      setStep('done')
    } finally {
      setBusy(false)
    }
  }

  async function submitName(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await fetch(`${BASE}services/galerie-resend-link.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
    } catch { /* best-effort */ }
    setBusy(false)
    setMessage('Nous vous enverrons votre lien dans les meilleurs délais.')
    setStep('done')
  }

  const labelStyle = {
    display: 'block', fontFamily: 'var(--sans)', fontSize: 10.5,
    letterSpacing: '0.28em', textTransform: 'uppercase',
    color: 'var(--fg-muted)', marginBottom: 8,
  }

  const events = publicEvents ?? []

  return (
    <div style={{ marginTop: 40, borderTop: '1px solid var(--line)', paddingTop: 0 }}>
      {!open ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--fg-muted)',
            fontWeight: 300, lineHeight: 1.6, marginBottom: 16 }}>
            Pas d'identifiant ?
          </p>
          <button onClick={() => setOpen(true)} style={{
            background: 'none', border: '1px solid var(--line)',
            padding: '10px 20px', cursor: 'pointer',
            fontFamily: 'var(--sans)', fontSize: 10.5,
            letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--fg)',
          }}>
             Obtenez votre clé de connexion
          </button>
        </div>
      ) : step === 'done' ? (
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19,
          color: 'var(--fg-muted)', lineHeight: 1.65, textAlign: 'center' }}>
          {message}
        </p>
      ) : step === 'email' ? (
        <form onSubmit={submitEmail}>
          <label style={labelStyle}>Votre adresse email</label>
          <input
            type="email" required autoFocus
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ ...inputStyle, marginBottom: 16 }}
          />
          <button type="submit" disabled={busy || !email} style={{
            width: '100%', padding: '12px',
            background: busy || !email ? 'var(--line)' : 'var(--fg)',
            color: busy || !email ? 'var(--fg-muted)' : 'var(--bg)',
            border: 'none', fontFamily: 'var(--sans)', fontSize: 11,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            cursor: busy || !email ? 'default' : 'pointer',
          }}>
            {busy ? 'Envoi…' : 'Recevoir mon lien'}
          </button>
        </form>
      ) : step === 'notfound' ? (
        <div>
          {events.length > 0 ? (
            <>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--fg-muted)',
                fontStyle: 'italic', marginBottom: 20, lineHeight: 1.6 }}>
                Cet email n'est pas reconnu.<br />
                Vous pouvez accéder directement aux galeries publiques&nbsp;:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {events.map((ev, i) => (
                  <a key={i} href={ev.url} style={{
                    display: 'block', padding: '12px 16px',
                    border: '1px solid var(--line)',
                    fontFamily: 'var(--sans)', fontSize: 13,
                    color: 'var(--fg)', textDecoration: 'none',
                    letterSpacing: '0.02em',
                  }}>
                    {ev.label}
                  </a>
                ))}
              </div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--fg-muted)',
                marginBottom: 12, lineHeight: 1.5 }}>
                Votre galerie n'est pas dans la liste ? Indiquez votre nom :
              </p>
            </>
          ) : (
            <p style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--fg-muted)',
              fontStyle: 'italic', marginBottom: 20, lineHeight: 1.6 }}>
              Cet email n'est pas reconnu.<br />Indiquez votre nom pour que nous vous identifions.
            </p>
          )}
          <form onSubmit={submitName}>
            <label style={labelStyle}>Votre nom</label>
            <input
              type="text" required autoFocus
              value={name} onChange={e => setName(e.target.value)}
              style={{ ...inputStyle, marginBottom: 16 }}
            />
            <button type="submit" disabled={busy || !name} style={{
              width: '100%', padding: '12px',
              background: busy || !name ? 'var(--line)' : 'var(--fg)',
              color: busy || !name ? 'var(--fg-muted)' : 'var(--bg)',
              border: 'none', fontFamily: 'var(--sans)', fontSize: 11,
              letterSpacing: '0.28em', textTransform: 'uppercase',
              cursor: busy || !name ? 'default' : 'pointer',
            }}>
              {busy ? 'Envoi…' : 'Envoyer ma demande'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}

// ── Page login ────────────────────────────────────────────────────────────────

export default function GalerieLogin() {
  const { login, loginWithCle, user, loading: authLoading } = useGalerieAuth()
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()

  const isGalerieMode = import.meta.env.VITE_APP_MODE === 'galerie'
  const albumsDest    = isGalerieMode ? '/albums' : '/galerie/albums'
  
  // Ne pas indéxer cette page
  useNoIndex()

  // Déjà connecté → rediriger vers albums
  useEffect(() => {
    if (!authLoading && user) navigate(albumsDest, { replace: true })
  }, [user, authLoading])
  const [login_,   setLogin]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const redirect = searchParams.get('redirect')
  function dest() {
    if (redirect) {
      const decoded = decodeURIComponent(redirect)
      if (isGalerieMode || decoded.startsWith('/galerie')) return decoded
    }
    return isGalerieMode ? '/albums' : '/galerie/albums'
  }

  // Connexion automatique via lien ?cle=
  useEffect(() => {
    const cle = searchParams.get('cle')
    if (!cle) return
    setLoading(true)
    loginWithCle(cle)
      .then(d => {
        if (d.ok) navigate(dest(), { replace: true })
        else setError('Lien invalide ou expiré')
      })
      .catch(() => setError('Erreur de connexion'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const d = await login(login_, password).catch(() => ({ ok: false }))
    setLoading(false)
    if (d.ok) {
      navigate(dest())
    } else {
      setError(d.error || 'Identifiant ou mot de passe incorrect')
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '0 var(--gutter)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <a href={APP_HOME} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
            color: 'var(--fg)', textDecoration: 'none' }}>
            {LOGO_URL
              ? <img src={LOGO_URL} alt={APP_NAME} style={{ width: 40, height: 40, objectFit: 'contain' }} />
              : LOGO_EMOJI
                ? <span style={{ fontSize: 36, lineHeight: 1 }}>{LOGO_EMOJI}</span>
                : null}
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 28,
              marginTop: (LOGO_URL || LOGO_EMOJI) ? 16 : 0 }}>
              {APP_NAME}
            </div>
          </a>
          {APP_TAGLINE && (
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em',
              textTransform: 'uppercase', color: 'var(--fg-muted)', marginTop: 6 }}>
              {APP_TAGLINE}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8 }}>
              Identifiant
            </div>
            <input
              type="text" value={login_} onChange={e => setLogin(e.target.value)}
              autoComplete="username" required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8 }}>
              Mot de passe
            </div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="current-password" required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 20, fontSize: 13, color: '#c0392b',
              fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? 'var(--line)' : 'var(--fg)',
            color: loading ? 'var(--fg-muted)' : 'var(--bg)',
            border: 'none', fontFamily: 'var(--sans)', fontSize: 11,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            cursor: loading ? 'default' : 'pointer',
          }}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <ResendBlock />
      </div>
    </div>
  )
}
