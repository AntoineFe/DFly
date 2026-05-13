import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import SectionLabel from '../components/SectionLabel'
import usePageMeta from '../hooks/usePageMeta'

const BASE = import.meta.env.BASE_URL

const IMG = {
  hero: `${BASE}images/evenement-ballet-scene-nice.jpg`,
  img1: `${BASE}images/evenement-theatre-spectacle-paca.jpg`,
  img2: `${BASE}images/evenement-remise-diplomes-paca.jpeg`,
  img3: `${BASE}images/spectacle-chanteur-scene-paca.jpg`,
}

export default function Spectacle({ lang, setLang }) {
  const t = (fr, en) => lang === 'FR' ? fr : en
  usePageMeta({
    title: t('Photo & Vidéo Événement — DFly · PACA', 'Event Photography & Film — DFly · French Riviera'),
    description: t('Captation photo et vidéo d\'événements et spectacles en Provence Alpes Côte d\'Azur. Multi-caméra, live, concerts, conférences.', 'Event and live performance photography and film in the French Riviera. Multi-camera, concerts, conferences.'),
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
          objectFit: 'cover', filter: 'brightness(0.55) saturate(0.85) contrast(1.05)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(20,22,18,0.4) 0%, rgba(20,22,18,0.1) 50%, rgba(20,22,18,0.8) 100%)',
        }} />
        <div className="hero-corner-label" style={{ position: 'absolute', top: 110, left: 'var(--gutter)', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85 }}>
          {t('Domaine 04', 'Field 04')}
        </div>
        <div className="container hero-intro-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 24 }}>
            — {t('Événement & Spectacle', 'Event & Stage')}
          </div>
          <h1 style={{
            fontFamily: 'var(--serif-display)', fontSize: 'clamp(64px, 9vw, 160px)',
            lineHeight: 0.9, fontWeight: 400, margin: 0, letterSpacing: '-0.005em',
          }}>
            {t(
              <>{t('Le moment', 'The moment')}<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>{t('ne revient pas.', 'does not repeat.')}</em></>,
              <>The moment<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>does not repeat.</em></>
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
                  'Défilés, remises de diplômes, concerts, festivals, spectacles. Chaque événement a son rythme, ses moments décisifs — c\'est notre rôle de les saisir.',
                  'Fashion shows, graduations, concerts, festivals, performances. Every event has its rhythm, its decisive moments — our role is to capture them.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, color: 'var(--fg-muted)', maxWidth: 580, marginBottom: 20 }}>
                {t(
                  'Captation multi-caméra avec son en direct. Nous nous adaptons à la configuration des lieux, aux contraintes de lumière et à vos délais de livraison.',
                  'Multi-camera capture with live sound. We adapt to the venue layout, lighting constraints and your delivery deadlines.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, color: 'var(--fg-muted)', maxWidth: 580 }}>
                {t(
                  'Photo reportage et vidéo en parallèle si besoin. Livraison rapide pour les médias ou les réseaux sociaux.',
                  'Photo reportage and video in parallel if needed. Fast delivery for press or social media.'
                )}
              </p>
              <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 0, borderTop: '1px solid var(--line)' }}>
                {[
                  t('Photo reportage', 'Photo reportage'),
                  t('Captation vidéo', 'Video capture'),
                  t('Multi-caméra', 'Multi-camera'),
                  t('Son direct', 'Live sound'),
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
            <img src={IMG.img1} alt={t("Spectacle de théâtre en plein air PACA — captation vidéo", "Outdoor theatre performance PACA — video capture")} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
            <img src={IMG.img2} alt={t("Cérémonie de remise de diplômes en PACA — photographe événement", "Graduation ceremony PACA — event photographer")} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
            <img src={IMG.img3} alt={t("Artiste chanteur sur scène en PACA — photographie spectacle", "Singer on stage PACA — concert photography")} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)', gridColumn: 'span 2', objectPosition: 'center 40%' }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(36px, 4vw, 56px)', fontStyle: 'italic', fontWeight: 300, marginBottom: 32 }}>
            {t('Parlons de votre événement.', "Let's talk about your event.")}
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
