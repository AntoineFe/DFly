import DflyMonogram from './DflyMonogram'

export default function Footer({ lang = 'FR' }) {
  const t = (fr, en) => lang === 'FR' ? fr : en

  return (
    <footer style={{ background: 'var(--bg-deep)', color: 'var(--fg-on-deep)', paddingTop: 100, paddingBottom: 40 }}>
      <div className="container">

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingBottom: 80, borderBottom: '1px solid rgba(243,237,226,0.18)' }}>
          <DflyMonogram size={48} color="rgba(243,237,226,0.9)" />
          <div style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(40px,5vw,64px)', fontStyle: 'italic', fontWeight: 300, marginTop: 24, letterSpacing: '0.01em' }}>
            {t('Parlons de votre projet', "Let's talk about your project")}
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', marginTop: 16, opacity: 0.7 }}>
            {t('Réponse sous 48 heures', 'Reply within 48 hours')}
          </div>
        </div>

        {/* Colonnes */}
        <div className="grid-footer" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 32, marginBottom: 18 }}>
              D<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Fly</span>
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.7, color: 'rgba(243,237,226,0.75)', fontStyle: 'italic', fontWeight: 300, maxWidth: 320 }}>
              {t(
                'Antoine & Rémi Ferrera. Père et fils, photographes et vidéastes basés en Provence.',
                'Antoine & Rémi Ferrera. Father and son — photographers and filmmakers based in Provence.'
              )}
            </p>
          </div>

          <div>
            <div className="eyebrow" style={{ opacity: 0.6, marginBottom: 18 }}>Antoine</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.8 }}>
              06 07 72 09 40<br />
              <a href="mailto:antoine.ferrera@dfly.fr" style={{ borderBottom: '1px solid rgba(243,237,226,0.4)' }}>
                antoine.ferrera@dfly.fr
              </a>
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ opacity: 0.6, marginBottom: 18 }}>Rémi</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.8 }}>
              06 95 40 27 00<br />
              <a href="mailto:remi.ferrera@dfly.fr" style={{ borderBottom: '1px solid rgba(243,237,226,0.4)' }}>
                remi.ferrera@dfly.fr
              </a>
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ opacity: 0.6, marginBottom: 18 }}>{t('Suivre', 'Follow')}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.8 }}>
              <a href="#" style={{ display: 'block' }}>Instagram</a>
              <a href="#" style={{ display: 'block' }}>Vimeo</a>
              <a href="#" style={{ display: 'block' }}>Pinterest</a>
            </div>
          </div>
        </div>

        {/* Bas de page */}
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', opacity: 0.55 }}>
          <span>© {new Date().getFullYear()} DFly — Tous droits réservés</span>
          <span>Pilote drone certifié · DGAC</span>
          <span>dfly.fr</span>
        </div>

      </div>
    </footer>
  )
}
