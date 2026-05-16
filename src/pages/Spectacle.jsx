import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import SectionLabel from '../components/SectionLabel'
import usePageMeta from '../hooks/usePageMeta'
import WatermarkImg from '../components/WatermarkImg'

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
	  title: t(
		'Photographe Vidéaste Spectacle & Événement PACA — DFly',
		'Event & Show Photographer Videographer French Riviera — DFly'
	  ),
	  description: t(
		'Photo et vidéo de spectacles, concerts, conférences et événements en PACA. Captation multi-caméra, live, reportage. De Menton à Toulon. Devis gratuit.',
		'Photography and video for shows, concerts, conferences and events in the French Riviera. Multi-camera, live coverage, reportage. Request a free quote.'
	  ),
	  ogImage: 'og-accueil.jpg',
	  schema: {
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: t('Photographe vidéaste spectacle et événement PACA', 'Event and show photographer videographer French Riviera'),
		url: 'https://dfly.fr/spectacle',
		image: [
		  'https://dfly.fr/images/evenement-ballet-scene-nice.jpg',
		  'https://dfly.fr/images/evenement-theatre-spectacle-paca.jpg',
		],
		description: t(
		  'Photo et vidéo de spectacles, concerts, conférences et événements en PACA. Captation multi-caméra et live. De Menton à Toulon.',
		  'Photography and video for shows, concerts, conferences and events across the French Riviera. Multi-camera and live coverage.'
		),
		provider: {
		  '@type': 'LocalBusiness',
		  name: 'DFly Photographie & Vidéo',
		  url: 'https://dfly.fr',
		},
		areaServed: [
		  { '@type': 'City', name: 'Nice' },
		  { '@type': 'City', name: 'Cannes' },
		  { '@type': 'City', name: 'Toulon' },
		  { '@type': 'City', name: 'Antibes' },
		  { '@type': 'City', name: 'Juan-les-Pins' },
		  { '@type': 'City', name: 'Fréjus' },
		  { '@type': 'City', name: 'Saint-Raphaël' },
		  { '@type': 'City', name: 'Saint-Tropez' },
		  { '@type': 'City', name: 'Hyères' },
		  { '@type': 'City', name: 'Grasse' },
		  { '@type': 'City', name: 'Menton' },
		  { '@type': 'AdministrativeArea', name: 'Alpes-Maritimes' },
		  { '@type': 'AdministrativeArea', name: 'Var' },
		],
		serviceType: t('Photographie et vidéo spectacle et événement', 'Event and show photography and videography'),
		offers: {
		  '@type': 'Offer',
		  availability: 'https://schema.org/InStock',
		  areaServed: 'Provence-Alpes-Côte d\'Azur',
		  url: 'https://dfly.fr/contact',
		  priceSpecification: {
			'@type': 'PriceSpecification',
			priceCurrency: 'EUR',
		  }
		},
	  }
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
              <>{t('L\'énergie', 'The ernergy')}<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>{t('du moment.', 'of the moment.')}</em></>,
              <>The moment<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>does not repeat.</em></>
            )}
          </h1>
        </div>
        <span className="wm-text" aria-hidden="true" style={{ zIndex: 3 }}>© DFly Photographie &amp; Vidéo</span>
      </section>
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
            <WatermarkImg src={IMG.img1} alt={t("Spectacle de théâtre en plein air PACA — captation vidéo", "Outdoor theatre performance PACA — video capture")} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
            <WatermarkImg src={IMG.img2} alt={t("Cérémonie de remise de diplômes en PACA — photographe événement", "Graduation ceremony PACA — event photographer")} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
            <WatermarkImg src={IMG.img3} alt={t("Artiste chanteur sur scène en PACA — photographie spectacle", "Singer on stage PACA — concert photography")} wrapStyle={{ gridColumn: 'span 2' }} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)', objectPosition: 'center 40%' }} />
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
