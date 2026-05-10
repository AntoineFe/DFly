import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import DflyMonogram from './DflyMonogram'

const NAV_LINKS = {
  FR: [
    { path: '/mariage',       label: 'Mariage'       },
    { path: '/immobilier',    label: 'Immobilier'    },
    { path: '/communication', label: 'Communication' },
    { path: '/spectacle',     label: 'Événement'     },
    { path: '/famille',       label: 'Portrait'      },
  ],
  EN: [
    { path: '/mariage',       label: 'Wedding'       },
    { path: '/immobilier',    label: 'Real Estate'   },
    { path: '/communication', label: 'Business'      },
    { path: '/spectacle',     label: 'Event'         },
    { path: '/famille',       label: 'Portrait'      },
  ],
}

export default function TopNav({ scheme = 'light', lang = 'FR', setLang, ctaLabel, ctaHref, galerieUser, onGalerieLogout, onChangePassword }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const userSectionRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [location.pathname])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const onDown = e => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [userMenuOpen])

  const isOverHero = scheme === 'over-hero' && !scrolled && !menuOpen
  const tone   = isOverHero ? 'rgba(243,237,226,0.95)' : 'var(--fg)'
  const bg     = isOverHero ? 'transparent' : 'var(--bg)'
  const border = isOverHero ? 'rgba(243,237,226,0.18)' : 'var(--line)'

  return (
    <>
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: menuOpen ? 'var(--bg)' : bg,
      backdropFilter: (scrolled && !menuOpen) ? 'blur(10px)' : 'none',
      borderBottom: `1px solid ${border}`,
      transition: 'background .35s ease, border-color .35s ease',
      color: menuOpen ? 'var(--fg)' : tone,
    }}>
      {/* Main bar */}
      <div className="topnav-bar" style={{
        maxWidth: 'var(--maxw)', margin: '0 auto', padding: '16px var(--gutter)',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', gap: 24,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, color: menuOpen ? 'var(--fg)' : tone }}>
          <DflyMonogram size={32} color={menuOpen ? 'var(--fg)' : tone} />
          <div>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 24, lineHeight: 1, letterSpacing: '0.01em' }}>
              D<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Fly</span>
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 8.5, letterSpacing: '0.36em', textTransform: 'uppercase', marginTop: 3, opacity: 0.75 }}>
              Photographie · Vidéo
            </div>
          </div>
        </Link>

        {/* Navigation desktop */}
        <nav className="nav-links" style={{ gap: 28, alignItems: 'center', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' }}>
          {NAV_LINKS[lang].map((l) => {
            const active = location.pathname === l.path
            return (
              <Link key={l.path} to={l.path} style={{
                color: tone,
                opacity: active ? 1 : 0.72,
                borderBottom: active ? `1px solid ${tone}` : '1px solid transparent',
                paddingBottom: 4,
                transition: 'opacity .2s ease, border-color .2s ease',
              }}>
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Lang + Contact (desktop) + Hamburger (mobile) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 18 }}>
          {/* Lang switcher — always visible */}
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em', display: 'flex', gap: 10 }}>
            {['FR', 'EN'].map((l, i) => (
              <span key={l} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                <button onClick={() => setLang?.(l)} style={{
                  background: 'none', border: 'none', padding: 0,
                  color: menuOpen ? 'var(--fg)' : tone,
                  opacity: lang === l ? 1 : 0.5, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit',
                }}>{l}</button>
              </span>
            ))}
          </div>

          {/* Devis — hidden on mobile (appears in mobile menu) */}
          {ctaHref?.startsWith('#')
            ? <a href={ctaHref} className="nav-links" style={{ fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.32em', textTransform: 'uppercase', border: `1px solid ${tone}`, padding: '10px 18px', color: tone }}>
                {ctaLabel ?? (lang === 'FR' ? 'Demander un devis' : 'Request a quote')}
              </a>
            : <Link to={ctaHref ?? '/contact'} className="nav-links" style={{ fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.32em', textTransform: 'uppercase', border: `1px solid ${tone}`, padding: '10px 18px', color: tone }}>
                {ctaLabel ?? (lang === 'FR' ? 'Demander un devis' : 'Request a quote')}
              </Link>
          }

          {/* Hamburger button */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 4px', color: menuOpen ? 'var(--fg)' : tone,
              flexDirection: 'column', gap: 5, alignItems: 'center',
            }}
          >
            <span style={{ display: 'block', width: 22, height: 1.5, background: 'currentColor', transition: 'transform .25s ease, opacity .25s ease', transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: 'currentColor', opacity: menuOpen ? 0 : 1, transition: 'opacity .25s ease' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: 'currentColor', transition: 'transform .25s ease, opacity .25s ease', transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav className="mobile-menu-panel" style={{
          background: 'var(--bg)',
          borderTop: '1px solid var(--line)',
          padding: `${galerieUser ? '20px' : '32px'} var(--gutter) 48px`,
        }}>
          {galerieUser && (
            <div
              onClick={() => userSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 22, color: 'var(--fg)', marginBottom: 16, cursor: 'pointer' }}
            >
              Bonjour {galerieUser.firstName} <span style={{ fontSize: 14, opacity: 0.5 }}>↓</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {NAV_LINKS[lang].map((l) => {
              const active = location.pathname === l.path
              return (
                <Link key={l.path} to={l.path} onClick={() => setMenuOpen(false)} style={{
                  fontFamily: 'var(--serif-display)', fontSize: 32,
                  fontWeight: 400, lineHeight: 1.2,
                  color: 'var(--fg)',
                  opacity: active ? 1 : 0.65,
                  padding: '14px 0',
                  borderBottom: '1px solid var(--line)',
                }}>
                  {l.label}
                </Link>
              )
            })}
          </div>
          {ctaHref?.startsWith('#')
            ? <a href={ctaHref} onClick={() => setMenuOpen(false)} style={{ display: 'inline-block', marginTop: 32, fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', border: '1px solid var(--fg)', padding: '12px 24px', color: 'var(--fg)' }}>
                {ctaLabel ?? (lang === 'FR' ? 'Demander un devis' : 'Request a quote')}
              </a>
            : <Link to={ctaHref ?? '/contact'} style={{ display: 'inline-block', marginTop: 32, fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', border: '1px solid var(--fg)', padding: '12px 24px', color: 'var(--fg)' }}>
                {ctaLabel ?? (lang === 'FR' ? 'Demander un devis' : 'Request a quote')}
              </Link>
          }
          {galerieUser && (
            <div ref={userSectionRef} style={{ marginTop: 32, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 16 }}>
                {galerieUser.firstName}
              </div>
              <Link to="/galerie/albums" style={{ display: 'block', fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg)', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                Ma galerie
              </Link>
              <button onClick={() => { setMenuOpen(false); onChangePassword?.() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--line)', fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg)', padding: '12px 0', cursor: 'pointer' }}>
                Changer mon mot de passe
              </button>
              <button onClick={() => { setMenuOpen(false); onGalerieLogout?.() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg)', padding: '12px 0', cursor: 'pointer' }}>
                Me déconnecter
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
    {galerieUser && createPortal(
      <div ref={userMenuRef} className="nav-links" style={{ position: 'fixed', top: 0, right: 'var(--gutter)', zIndex: 101, alignItems: 'center', height: 64 }}>
        <button
          onClick={() => setUserMenuOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: menuOpen ? 'var(--fg)' : tone,
            padding: '8px 0',
          }}
        >
          {galerieUser.firstName}
        </button>
        {userMenuOpen && (
          <div style={{
            position: 'absolute', top: '100%', right: 0,
            background: 'var(--bg)', border: '1px solid var(--line)',
            minWidth: 200, padding: '8px 0',
          }}>
            <Link to="/galerie/albums" onClick={() => setUserMenuOpen(false)} style={{ display: 'block', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg)', padding: '10px 20px' }}>
              Ma galerie
            </Link>
            <button onClick={() => { setUserMenuOpen(false); onChangePassword?.() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg)', padding: '10px 20px', cursor: 'pointer' }}>
              Changer mon mot de passe
            </button>
            <button onClick={() => { setUserMenuOpen(false); onGalerieLogout?.() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg)', padding: '10px 20px', cursor: 'pointer' }}>
              Me déconnecter
            </button>
          </div>
        )}
      </div>,
      document.body
    )}
    </>
  )
}
