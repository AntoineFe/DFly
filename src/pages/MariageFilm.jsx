import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import SectionLabel from '../components/SectionLabel'
import usePageMeta from '../hooks/usePageMeta'

const VIDEO_ID = '64IcNikJ9dY'

export default function MariageFilm({ lang, setLang }) {
  const t = (fr, en) => lang === 'FR' ? fr : en
  usePageMeta({
    title: t('Film de mariage — DFly · PACA', 'Wedding Film — DFly · French Riviera'),
    description: t('Films de mariage cinématographiques en Provence Alpes Côte d\'Azur. Teaser, film intégral, drone.', 'Cinematic wedding films in the French Riviera. Teaser, full film, drone footage.'),
    ogImage: 'og-mariage.jpg',
  })

  return (
    <div>
      <TopNav scheme="light" lang={lang} setLang={setLang}
        ctaLabel={lang === 'FR' ? 'Estimer mon projet' : 'Get a quote'}
        ctaHref="/mariage#devis"
      />

      {/* Header */}
      <section style={{ paddingTop: 140, paddingBottom: 64, background: 'var(--bg)' }}>
        <div className="container">
          <SectionLabel num="—" label={t('Mariage · Film', 'Wedding · Film')} />
          <h1 style={{
            fontFamily: 'var(--serif-display)',
            fontSize: 'clamp(48px, 7vw, 108px)',
            lineHeight: 0.92, fontWeight: 400, margin: '28px 0 0',
            letterSpacing: '-0.01em',
          }}>
            {t(
              <><em style={{ fontStyle: 'italic', fontWeight: 300 }}>Un extrait</em><br />de film</>,
              <>A film<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>excerpt</em></>
            )}
          </h1>
        </div>
      </section>

      {/* Video */}
      <section style={{ background: 'var(--bg-deep)', padding: 'var(--section-y) 0' }}>
        <div className="container">
          <div style={{
            position: 'relative', width: '100%', aspectRatio: '16/9',
            background: '#000',
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
              title={t('Film de mariage — DFly', 'Wedding film — DFly')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                border: 'none',
              }}
            />
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20,
              fontWeight: 300, color: 'rgba(243,237,226,0.75)', maxWidth: 540,
              lineHeight: 1.65, margin: 0,
            }}>
              {t(
                'Chaque film est conçu sur mesure — rythmé, colorimétré, monté selon l\'atmosphère de votre journée.',
                'Each film is custom-made — paced, graded, and edited to match the atmosphere of your day.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--serif-display)',
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontStyle: 'italic', fontWeight: 300, marginBottom: 40,
          }}>
            {t('Votre mariage, votre film.', 'Your wedding, your film.')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <Link to="/mariage#devis" style={{
              fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.36em',
              textTransform: 'uppercase', background: 'var(--fg)',
              color: 'var(--bg)', padding: '16px 32px', display: 'inline-block',
            }}>
              {t('Estimer mon projet', 'Get a quote')}
            </Link>
            <Link to="/mariage" style={{
              fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.36em',
              textTransform: 'uppercase', border: '1px solid var(--fg)',
              color: 'var(--fg)', padding: '16px 32px', display: 'inline-block',
            }}>
              {t('← Retour mariage', '← Back to wedding')}
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  )
}
