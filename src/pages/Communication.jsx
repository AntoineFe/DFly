import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import SectionLabel from '../components/SectionLabel'
import usePageMeta from '../hooks/usePageMeta'
import WatermarkImg from '../components/WatermarkImg'

const BASE = import.meta.env.BASE_URL

const IMG = {
  hero: `${BASE}images/entreprise-chantier-nuit-paca.jpeg`,
  img1: `${BASE}images/entreprise-shooting-produit-studio-paca.jpg`,
  img2: `${BASE}images/entreprise-shooting-parfum-modele-paca.jpeg`,
  img3: `${BASE}images/entreprise-shooting-parfum-flacon-paca.jpeg`,
}

export default function Communication({ lang, setLang }) {
  const t = (fr, en) => lang === 'FR' ? fr : en
	usePageMeta({
	  title: t(
		'Photographe Vidéaste Entreprise PACA | Communication & Marque — DFly',
		'Business Photographer & Videographer PACA | Communication & Brand — DFly'
	  ),
	  description: t(
		'Photos et vidéos pour entreprises, artisans et marques en PACA. Reportage, portraits, réseaux sociaux, publicité. Déplacement dans toute la région. Devis gratuit.',
		'Photography and video for businesses and brands across the French Riviera. Corporate reportage, portraits, social media, advertising. Request a free quote.'
	  ),
	  ogImage: 'og-accueil.jpg',
	  schema: {
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: t('Photographe vidéaste entreprise PACA', 'Corporate photographer videographer French Riviera'),
		url: 'https://dfly.fr/communication',
		image: [
		  'https://dfly.fr/images/entreprise-shooting-parfum-flacon-paca.jpeg',
		  'https://dfly.fr/images/entreprise-chantier-nuit-paca.jpeg',
		],
		description: t(
		  'Photos et vidéos pour entreprises, artisans et marques en PACA. Reportage corporate, portraits, réseaux sociaux et publicité.',
		  'Photography and video for businesses and brands in the French Riviera. Corporate reportage, portraits, social media and advertising.'
		),
		provider: {
		  '@type': 'LocalBusiness',
		  name: 'DFly Photographie & Vidéo',
		  url: 'https://dfly.fr',
		},
		areaServed: [
		  { '@type': 'City', name: 'Cannes' },
		  { '@type': 'City', name: 'Antibes' },
		  { '@type': 'City', name: 'Nice' },
		  { '@type': 'City', name: 'Cagnes-sur-Mer' },
		  { '@type': 'City', name: 'Grasse' },
		  { '@type': 'City', name: 'Sophia Antipolis' },
		  { '@type': 'AdministrativeArea', name: 'Alpes-Maritimes' },
		  { '@type': 'AdministrativeArea', name: 'Var' },
		],
		serviceType: t('Photographie et vidéo entreprise', 'Business photography and videography'),
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
          {t('Domaine 03', 'Field 03')}
        </div>
        <div className="container hero-intro-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 24 }}>
            — {t('Communication & Entreprise', 'Business & Brand')}
          </div>
          <h1 style={{
            fontFamily: 'var(--serif-display)', fontSize: 'clamp(64px, 9vw, 160px)',
            lineHeight: 0.9, fontWeight: 400, margin: 0, letterSpacing: '-0.005em',
          }}>
            {t(
              <>{t('Votre travail', 'Your work')}<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>{t('mérite d\'être vu.', 'deserves to be seen.')}</em></>,
              <>Your work<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>deserves to be seen.</em></>
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
                  'Artisans, constructeurs, domaines, commerçants. Des images qui montrent votre travail pour vos supports de communication.',
                  'Craftsmen, builders, estates, retailers. Images that show your work for your communication.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, color: 'var(--fg-muted)', maxWidth: 580, marginBottom: 20 }}>
                {t(
                  'Reportage en situation, portrait d\'équipe, photographie de produit, interview vidéo, captation d\'événement d\'entreprise. Nous nous adaptons à votre secteur et à vos contraintes.',
                  'Documentary coverage, team portraits, product photography, video interviews, corporate event capture. We adapt to your industry and constraints.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, color: 'var(--fg-muted)', maxWidth: 580 }}>
                {t(
                  'Livraison selon vos délais, fichiers optimisés pour le web, la presse ou l\'impression.',
                  'Delivery to your deadlines, files optimised for web, press or print.'
                )}
              </p>
              <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 0, borderTop: '1px solid var(--line)' }}>
                {[
                  t('Photo reportage', 'Photo reportage'),
                  t('Portrait équipe', 'Team portrait'),
                  t('Vidéo institutionnelle', 'Corporate video'),
                  t('Photo produit', 'Product photo'),
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
            <WatermarkImg src={IMG.img1} alt={t("Shooting produit en studio PACA — photographie entreprise", "Product photography in studio PACA — business photography")} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
            <WatermarkImg src={IMG.img2} alt={t("Shooting parfum avec modèle en PACA — photographie commerciale", "Perfume shooting with model PACA — commercial photography")} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
            <WatermarkImg src={IMG.img3} alt={t("Flacon de parfum — photographie produit cosmétique PACA", "Perfume bottle — cosmetic product photography PACA")} wrapStyle={{ gridColumn: 'span 2' }} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)', objectPosition: 'center 30%' }} />
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
