import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DflyMonogram from './DflyMonogram'

const NAV_LINKS = {
  FR: [
    { path: '/',           label: 'Accueil'     },
    { path: '/mariage',    label: 'Mariage'     },
    { path: '/immobilier', label: 'Immobilier'  },
    { path: '/spectacle',  label: 'Spectacle'   },
    { path: '/evenements', label: 'Événements'  },
    { path: '/famille',    label: 'Famille'     },
  ],
  EN: [
    { path: '/',           label: 'Home'        },
    { path: '/mariage',    label: 'Wedding'     },
    { path: '/immobilier', label: 'Real Estate' },
    { path: '/spectacle',  label: 'Stage'       },
    { path: '/evenements', label: 'Events'      },
    { path: '/famille',    label: 'Family'      },
  ],
}

export default function TopNav({ scheme = 'light', lang = 'FR', setLang }) {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isOverHero = scheme === 'over-hero' && !scrolled
  const tone   = isOverHero ? 'rgba(243,237,226,0.95)' : 'var(--fg)'
  const bg     = isOverHero ? 'transparent' : 'var(--bg)'
  const border = isOverHero ? 'rgba(243,237,226,0.18)' : 'var(--line)'

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: bg,
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      borderBottom: `1px solid ${border}`,
      transition: 'background .35s ease, border-color .35s ease',
      color: tone,
    }}>
      <div style={{
        maxWidth: 'var(--maxw)', margin: '0 auto', padding: '16px var(--gutter)',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', gap: 24,
      }}>
        {/* Logo + nom */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, color: tone }}>
          <DflyMonogram size={32} color={tone} />
          <div>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 24, lineHeight: 1, letterSpacing: '0.01em' }}>
              D<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Fly</span>
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 8.5, letterSpacing: '0.36em', textTransform: 'uppercase', marginTop: 3, opacity: 0.75 }}>
              Photographie · Vidéo
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' }}>
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

        {/* Lang + Contact */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 18 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.24em', display: 'flex', gap: 10 }}>
            {['FR', 'EN'].map((l, i) => (
              <span key={l} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                <button onClick={() => setLang?.(l)} style={{
                  background: 'none', border: 'none', padding: 0, color: tone,
                  opacity: lang === l ? 1 : 0.5, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit',
                }}>{l}</button>
              </span>
            ))}
          </div>
          <a href="#contact" style={{
            fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.32em',
            textTransform: 'uppercase', border: `1px solid ${tone}`,
            padding: '10px 18px', color: tone,
          }}>
            Contact
          </a>
        </div>
      </div>
    </header>
  )
}
