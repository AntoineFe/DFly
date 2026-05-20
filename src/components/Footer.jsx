import { Link } from 'react-router-dom'
import DflyMonogram from './DflyMonogram'

export default function Footer({ lang = 'FR' }) {
  const t = (fr, en) => lang === 'FR' ? fr : en

  return (
    <footer style={{ background: 'var(--bg-deep)', color: 'var(--fg-on-deep)', paddingTop: 100, paddingBottom: 40 }}>
      <div className="container">

        {/* Colonnes */}
        <div className="grid-footer" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <div>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 32, marginBottom: 18 }}>
              D<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Fly</span>
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.7, color: 'rgba(243,237,226,0.75)', fontStyle: 'italic', fontWeight: 300, maxWidth: 320 }}>
              {t(
                'Antoine & Rémi Ferrera. Photographes et vidéastes basés en Provence Alpes Côte d\'Azur.',
                'Antoine & Rémi Ferrera. Photographers and filmmakers based in Provence Alpes Côte d\'Azur.'
              )}
            </p>
          </div>

          <div>
            <div className="eyebrow" style={{ opacity: 0.6, marginBottom: 18 }}>Antoine</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.8 }}>
              06 07 72 09 40<br />
              <a href="mailto:antoine.ferrera@dfly.fr" style={{ borderBottom: '1px solid rgba(243,237,226,0.4)' }}>
                antoine.ferrera@dfly.fr
              </a>
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ opacity: 0.6, marginBottom: 18 }}>Rémi</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.8 }}>
              06 95 40 27 00<br />
              <a href="mailto:remi.ferrera@dfly.fr" style={{ borderBottom: '1px solid rgba(243,237,226,0.4)' }}>
                remi.ferrera@dfly.fr
              </a>
            </div>
          </div>

        </div>

        {/* Bas de page */}
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', opacity: 0.55 }}>
          <span>© {new Date().getFullYear()} DFly — Tous droits réservés</span>
          <span>Pilote drone certifié · DGAC</span>
          <span style={{ display: 'flex', gap: 20 }}>
            <Link to="/mentions-legales" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid rgba(243,237,226,0.3)' }}>Mentions légales</Link>
            <Link to="/confidentialite"  style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid rgba(243,237,226,0.3)' }}>Confidentialité</Link>
          </span>
        </div>

      </div>
    </footer>
  )
}
