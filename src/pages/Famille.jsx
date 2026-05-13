import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import SectionLabel from '../components/SectionLabel'
import usePageMeta from '../hooks/usePageMeta'

const BASE = import.meta.env.BASE_URL

const IMG = {
  hero: `${BASE}images/famille-portrait-bord-de-mer-cote-dazur.jpeg`,
  img1: `${BASE}images/portrait-couple-studio-nice.jpg`,
  img2: `${BASE}images/famille-plage-portrait-cote-dazur.jpeg`,
  img3: `${BASE}images/famille-couple-jardin-provence.jpeg`,
}

export default function Famille({ lang, setLang }) {
  const t = (fr, en) => lang === 'FR' ? fr : en
  usePageMeta({
    title: t('Portrait & Famille — DFly Photographie · PACA', 'Portrait & Family Photography — DFly · French Riviera'),
    description: t('Séances photo portrait et famille en Provence Alpes Côte d\'Azur. Des images simples, vraies et durables.', 'Portrait and family photo sessions in the French Riviera. Simple, true and lasting images.'),
  })

  return (
    <div>
      <TopNav scheme="over-hero" lang={lang} setLang={setLang} />

      {/* Hero */}
      <section style={{
        position: 'relative', minHeight: '80vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        overflow: 'hidden', color: 'var(--ivory)',
        paddingTop: 160, paddingBottom: 80,
      }}>
        <img src={IMG.hero} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 30%',
          filter: 'brightness(0.58) saturate(0.85) contrast(1.05)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(20,22,18,0.4) 0%, rgba(20,22,18,0.1) 50%, rgba(20,22,18,0.8) 100%)',
        }} />
        <div className="hero-corner-label" style={{ position: 'absolute', top: 110, left: 'var(--gutter)', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85 }}>
          {t('Domaine 05', 'Field 05')}
        </div>
        <div className="container hero-intro-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 24 }}>
            — {t('Portrait & Famille', 'Portrait & Family')}
          </div>
          <h1 style={{
            fontFamily: 'var(--serif-display)', fontSize: 'clamp(64px, 9vw, 160px)',
            lineHeight: 0.9, fontWeight: 400, margin: 0, letterSpacing: '-0.005em',
          }}>
            {t(
              <>{t('Des images', 'Images')}<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>{t('simples, vraies.', 'simple and true.')}</em></>,
              <>Images<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>simple and true.</em></>
            )}
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg)' }}>
        <div className="container">
          <div className="grid-manifesto">
            <div style={{ position: 'sticky', top: 120 }}>
              <SectionLabel num="I" label={t('Approche', 'Approach')} />
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--serif-display)', fontSize: 'clamp(26px, 3vw, 42px)',
                lineHeight: 1.2, fontWeight: 400, color: 'var(--fg)', marginTop: 0, marginBottom: 32,
              }}>
                {t(
                  'Séances en extérieur ou à la maison, sans rien imposer. Nous laissons les choses se passer naturellement.',
                  'Outdoor or home sessions, without imposing anything. We let things unfold naturally.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, color: 'var(--fg-muted)', maxWidth: 580, marginBottom: 20 }}>
                {t(
                  'Books professionnels, portraits de couple, séances famille avec enfants. Nous choisissons ensemble le lieu et l\'heure selon la lumière et vos envies.',
                  'Professional portfolios, couple portraits, family sessions with children. Together we choose the location and time based on the light and your wishes.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, color: 'var(--fg-muted)', maxWidth: 580 }}>
                {t(
                  'Vous gardez des images vraies, pas des poses — la vérité d\'un instant.',
                  'You keep true images, not posed ones — the truth of a moment.'
                )}
              </p>
              <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 0, borderTop: '1px solid var(--line)' }}>
                {[
                  t('Portrait individuel', 'Individual portrait'),
                  t('Couple', 'Couple'),
                  t('Famille', 'Family'),
                  t('Book professionnel', 'Professional portfolio'),
                ].map((s, i, arr) => (
                  <div key={i} style={{ fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--fg-muted)', padding: '14px 20px 14px 0', borderBottom: '1px solid var(--line)' }}>
                    {s}{i < arr.length - 1 && <span style={{ marginLeft: 20, opacity: 0.4 }}>·</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Images */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg-alt)' }}>
        <div className="container">
          <SectionLabel num="II" label={t('Quelques images', 'A few images')} />
          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="wm"><img src={IMG.img1} alt={t("Portrait de couple en studio à Nice — DFly photographie", "Couple portrait in studio Nice — DFly photography")} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} /></div>
            <div className="wm"><img src={IMG.img2} alt={t("Séance photo famille sur la plage Côte d'Azur", "Family photo session on the beach Côte d'Azur")} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} /></div>
            <div className="wm" style={{ gridColumn: 'span 2' }}><img src={IMG.img3} alt={t("Portrait de couple dans un jardin en Provence", "Couple portrait in a garden in Provence")} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} /></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(36px, 4vw, 56px)', fontStyle: 'italic', fontWeight: 300, marginBottom: 32 }}>
            {t('Parlons de votre projet.', "Let's talk about your project.")}
          </div>
          <Link to="/contact" style={{
            fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.36em', textTransform: 'uppercase',
            border: '1px solid var(--fg)', padding: '14px 32px', color: 'var(--fg)', display: 'inline-block',
          }}>
            {t('Nous contacter', 'Contact us')}
          </Link>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  )
}
