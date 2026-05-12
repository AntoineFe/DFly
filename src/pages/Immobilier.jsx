import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import SectionLabel from '../components/SectionLabel'
import usePageMeta from '../hooks/usePageMeta'

const BASE = import.meta.env.BASE_URL

const IMG = {
  hero:  `${BASE}images/_DSC4497-HDR.jpeg`,
  img1:  `${BASE}images/073_7R44153.jpeg`,
  img2:  `${BASE}images/_7R40286-HDR.jpeg`,
  img3:  `${BASE}images/_7R40330-Panorama-HDR.jpeg`,
  drone: `${BASE}images/YUN_0172.jpg`,
}

export default function Immobilier({ lang, setLang }) {
  const t = (fr, en) => lang === 'FR' ? fr : en
  usePageMeta({
    title: t('Photographie Immobilière — DFly · PACA', 'Real Estate Photography — DFly · French Riviera'),
    description: t('Photos et vidéos immobilières professionnelles en Provence Alpes Côte d\'Azur. Intérieurs, extérieurs, vues aériennes par drone.', 'Professional real estate photography and film in the French Riviera. Interiors, exteriors, aerial drone shots.'),
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
          objectFit: 'cover', filter: 'brightness(0.6) saturate(0.85) contrast(1.05)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(20,22,18,0.4) 0%, rgba(20,22,18,0.1) 50%, rgba(20,22,18,0.8) 100%)',
        }} />
        <div className="hero-corner-label" style={{ position: 'absolute', top: 110, left: 'var(--gutter)', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85 }}>
          {t('Domaine 02', 'Field 02')}
        </div>
        <div className="container hero-intro-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 24 }}>
            — {t('Immobilier', 'Real Estate')}
          </div>
          <h1 style={{
            fontFamily: 'var(--serif-display)', fontSize: 'clamp(64px, 9vw, 160px)',
            lineHeight: 0.9, fontWeight: 400, margin: 0, letterSpacing: '-0.005em',
          }}>
            {t(
              <>{t('Le bien,', 'The property,')}<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>{t('sous son meilleur jour.', 'at its best.')}</em></>,
              <>The property,<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>at its best.</em></>
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
                  'Chaque bien se révèle à une certaine heure, sous une certaine lumière. Nous choisissons le bon moment, l\'angle juste.',
                  'Every property reveals itself at a certain hour, under a certain light. We choose the right moment, the right angle.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, color: 'var(--fg-muted)', maxWidth: 580, marginBottom: 20 }}>
                {t(
                  'De la maison individuelle au programme neuf, nous intervenons en intérieur et en extérieur. Vues au sol et aériennes drone. Images haute définition, livrées sous 72h.',
                  'From individual homes to new developments, we cover interiors and exteriors. Ground and aerial drone views. High-definition images, delivered within 72 hours.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, color: 'var(--fg-muted)', maxWidth: 580 }}>
                {t(
                  'Nous travaillons avec des agences immobilières, des promoteurs, des architectes et des propriétaires particuliers.',
                  'We work with estate agencies, developers, architects and private owners.'
                )}
              </p>
              <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 0, borderTop: '1px solid var(--line)' }}>
                {[
                  t('Photos intérieures', 'Interior photos'),
                  t('Photos extérieures', 'Exterior photos'),
                  t('Vue aérienne drone', 'Aerial drone'),
                  t('Visite virtuelle', 'Virtual tour'),
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
            <img src={IMG.img1} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
            <img src={IMG.img2} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
            <img src={IMG.drone} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)', gridColumn: 'span 2' }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(36px, 4vw, 56px)', fontStyle: 'italic', fontWeight: 300, marginBottom: 32 }}>
            {t('Parlons de votre bien.', "Let's talk about your property.")}
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
