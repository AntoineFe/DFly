import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useGalerieAuth } from '../context/GalerieAuth'
import DflyMonogram from '../components/DflyMonogram'

export default function GalerieLogin() {
  const { login, loginWithCle } = useGalerieAuth()
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const [login_,   setLogin]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // Connexion automatique via lien ?cle=
  useEffect(() => {
    const cle = searchParams.get('cle')
    if (!cle) return
    setLoading(true)
    loginWithCle(cle)
      .then(d => {
        if (d.ok) navigate('/galerie/albums', { replace: true })
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
      navigate('/galerie/albums')
    } else {
      setError(d.error || 'Identifiant ou mot de passe incorrect')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '0 var(--gutter)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', color: 'var(--fg)' }}>
            <DflyMonogram size={40} color="var(--fg)" />
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 28, marginTop: 16 }}>
              D<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Fly</span>
            </div>
          </Link>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em',
            textTransform: 'uppercase', color: 'var(--fg-muted)', marginTop: 6 }}>
            Galerie privée
          </div>
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
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: '1px solid var(--line)', background: 'var(--bg)',
                color: 'var(--fg)', fontSize: 15, fontFamily: 'inherit',
              }}
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
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: '1px solid var(--line)', background: 'var(--bg)',
                color: 'var(--fg)', fontSize: 15, fontFamily: 'inherit',
              }}
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
      </div>
    </div>
  )
}
