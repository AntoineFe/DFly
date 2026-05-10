import { useState } from 'react'

export default function ChangePasswordModal({ onClose, changePassword }) {
  const [current, setCurrent] = useState('')
  const [next, setNext]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (next !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (next.length < 8)  { setError('Le nouveau mot de passe doit contenir au moins 8 caractères'); return }
    setLoading(true)
    const d = await changePassword(current, next)
    setLoading(false)
    if (d.ok) { setSuccess(true) }
    else { setError(d.error || 'Erreur') }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(20,22,18,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 var(--gutter)',
      }}
    >
      <div style={{
        background: 'var(--bg)', padding: '48px 40px', maxWidth: 400, width: '100%',
        borderTop: '3px solid var(--fg)',
      }}>
        <div style={{ fontFamily: 'var(--serif-display)', fontSize: 26, fontWeight: 400, marginBottom: 32 }}>
          Changer mon mot de passe
        </div>
        {success ? (
          <>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--fg)', marginBottom: 32 }}>
              Mot de passe modifié avec succès.
            </div>
            <button onClick={onClose} style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', background: 'var(--fg)', color: 'var(--bg)', border: 'none', padding: '14px 28px', cursor: 'pointer', width: '100%' }}>
              Fermer
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              Mot de passe actuel
              <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required style={{ fontFamily: 'var(--serif)', fontSize: 16, padding: '10px 12px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              Nouveau mot de passe
              <input type="password" value={next} onChange={e => setNext(e.target.value)} required style={{ fontFamily: 'var(--serif)', fontSize: 16, padding: '10px 12px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              Confirmer le nouveau mot de passe
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ fontFamily: 'var(--serif)', fontSize: 16, padding: '10px 12px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none' }} />
            </label>
            {error && (
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#c0392b', letterSpacing: '0.04em' }}>{error}</div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', background: 'none', color: 'var(--fg)', border: '1px solid var(--line)', padding: '14px', cursor: 'pointer' }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} style={{ flex: 1, fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', background: 'var(--fg)', color: 'var(--bg)', border: 'none', padding: '14px', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? '…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
