import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useGalerieAuth } from '../context/GalerieAuth'
import ChangePasswordModal from './ChangePasswordModal'

const APP_NAME    = import.meta.env.VITE_APP_NAME    || 'Galerie'
const APP_TAGLINE = import.meta.env.VITE_APP_TAGLINE || ''
const APP_HOME    = import.meta.env.VITE_APP_HOME_URL || '/'
const LOGO_URL    = import.meta.env.VITE_APP_LOGO_URL || ''

function AppLogo({ size = 32 }) {
  if (!LOGO_URL) return null
  return (
    <img src={LOGO_URL} alt={APP_NAME}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }} />
  )
}

export default function GalerieNav() {
  const { user, logout, changePassword } = useGalerieAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [scrolled,      setScrolled]      = useState(false)
  const [userMenuOpen,  setUserMenuOpen]  = useState(false)
  const [showPwdModal,  setShowPwdModal]  = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false) // mobile
  const userMenuRef  = useRef(null)
  const userBtnRef   = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fermer le menu user au clic extérieur
  useEffect(() => {
    if (!userMenuOpen) return
    const onDown = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)
       && userBtnRef.current  && !userBtnRef.current.contains(e.target))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [userMenuOpen])

  // Fermer menu mobile au changement de route
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  async function handleLogout() {
    setUserMenuOpen(false)
    setMenuOpen(false)
    await logout()
    navigate('/galerie')
  }

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'var(--bg)',
    borderBottom: `1px solid ${scrolled ? 'var(--line)' : 'transparent'}`,
    backdropFilter: scrolled ? 'blur(10px)' : 'none',
    transition: 'border-color .3s ease, backdrop-filter .3s ease',
  }

  const barStyle = {
    padding: '0 var(--gutter)',
    height: 57,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }

  const smallCaps = {
    fontFamily: 'var(--sans)', fontSize: 11,
    letterSpacing: '0.24em', textTransform: 'uppercase',
  }

  const btnBase = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--fg)', padding: 0, ...smallCaps,
  }

  return (
    <>
      <header style={navStyle}>
        <div style={barStyle}>

          {/* ── Logo + nom app ── */}
          <a href={APP_HOME} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            color: 'var(--fg)', textDecoration: 'none', flexShrink: 0,
          }}>
            {LOGO_URL && <AppLogo size={32} />}
            <div>
              <div style={{ fontFamily: 'var(--serif-display)', fontSize: 22, lineHeight: 1 }}>
                {APP_NAME}
              </div>
              {APP_TAGLINE && (
                <div style={{ fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: '0.34em',
                  textTransform: 'uppercase', marginTop: 3, opacity: 0.65 }}>
                  {APP_TAGLINE}
                </div>
              )}
            </div>
          </a>

          {/* ── Droite : connexion / prénom (desktop) ── */}
          <div className="nav-links" style={{ alignItems: 'center', gap: 0 }}>
            {!user ? (
              <button onClick={() => navigate('/galerie')} style={btnBase}>
                Connexion
              </button>
            ) : (
              <div style={{ position: 'relative' }}>
                <button ref={userBtnRef} onClick={() => setUserMenuOpen(o => !o)}
                  style={{ ...btnBase, padding: '8px 0' }}>
                  {user.firstName}
                </button>
                {userMenuOpen && (
                  <div ref={userMenuRef} style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--bg)', border: '1px solid var(--line)',
                    minWidth: 180, zIndex: 200,
                  }}>
                    <Link to="/galerie/albums" onClick={() => setUserMenuOpen(false)}
                      style={{ ...btnBase, display: 'block', padding: '12px 20px',
                        borderBottom: '1px solid var(--line)', textDecoration: 'none' }}>
                      Ma galerie
                    </Link>
                    {user.auths?.admin && (
                      <Link to="/galerie/admin" onClick={() => setUserMenuOpen(false)}
                        style={{ ...btnBase, display: 'block', padding: '12px 20px',
                          borderBottom: '1px solid var(--line)', textDecoration: 'none' }}>
                        Administration
                      </Link>
                    )}
                    <button onClick={() => { setUserMenuOpen(false); setShowPwdModal(true) }}
                      style={{ ...btnBase, display: 'block', width: '100%',
                        textAlign: 'left', padding: '12px 20px', fontSize: 11,
                        borderBottom: '1px solid var(--line)' }}>
                      Changer le mot de passe
                    </button>
                    <button onClick={handleLogout}
                      style={{ ...btnBase, display: 'block', width: '100%',
                        textAlign: 'left', padding: '12px 20px', fontSize: 11 }}>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Hamburger mobile ── */}
          <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)}
            style={{ ...btnBase, fontSize: 22, lineHeight: 1, padding: '4px 0' }}
            aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* ── Menu mobile ── */}
        {menuOpen && (
          <div className="mobile-menu-panel" style={{
            borderTop: '1px solid var(--line)',
            padding: '24px var(--gutter) 32px',
            background: 'var(--bg)',
          }}>
            {!user ? (
              <button onClick={() => { setMenuOpen(false); navigate('/galerie') }}
                style={{ ...btnBase, display: 'block', padding: '12px 0',
                  borderBottom: '1px solid var(--line)', width: '100%', textAlign: 'left' }}>
                Connexion
              </button>
            ) : (
              <>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16,
                  marginBottom: 20, color: 'var(--fg-muted)' }}>
                  {user.firstName} {user.lastName}
                </div>
                <Link to="/galerie/albums" onClick={() => setMenuOpen(false)}
                  style={{ ...btnBase, display: 'block', padding: '12px 0',
                    borderBottom: '1px solid var(--line)', textDecoration: 'none' }}>
                  Ma galerie
                </Link>
                {user.auths?.admin && (
                  <Link to="/galerie/admin" onClick={() => setMenuOpen(false)}
                    style={{ ...btnBase, display: 'block', padding: '12px 0',
                      borderBottom: '1px solid var(--line)', textDecoration: 'none' }}>
                    Administration
                  </Link>
                )}
                <button onClick={() => { setMenuOpen(false); setShowPwdModal(true) }}
                  style={{ ...btnBase, display: 'block', padding: '12px 0',
                    borderBottom: '1px solid var(--line)', width: '100%', textAlign: 'left' }}>
                  Changer le mot de passe
                </button>
                <button onClick={handleLogout}
                  style={{ ...btnBase, display: 'block', padding: '12px 0',
                    width: '100%', textAlign: 'left' }}>
                  Déconnexion
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {showPwdModal && (
        <ChangePasswordModal
          onClose={() => setShowPwdModal(false)}
          changePassword={changePassword}
        />
      )}
    </>
  )
}
