import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import Cartouche from '../components/Cartouche'
import SectionLabel from '../components/SectionLabel'
import DflyMonogram from '../components/DflyMonogram'

const BASE = import.meta.env.BASE_URL

const IMG = {
  hero:       'https://images.unsplash.com/photo-1519741497674-611481863552?w=2400&q=85',
  wedding1:   `${BASE}images/079_DSC7618.jpeg`,
  wedding2:   `${BASE}images/411_7R44813.jpeg`,
  wedding3:   'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=85',
  realestate:  `${BASE}images/_DSC4497-HDR.jpeg`,
  realestate2: `${BASE}images/073_7R44153.jpeg`,
  stage:      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600&q=85',
  event:      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&q=85',
  family:     'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1600&q=85',
  drone:      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=2400&q=85',
  duo:        'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1600&q=85',
  detail:     'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=85',
}

export default function Home({ lang, setLang }) {
  const t = (fr, en) => lang === 'FR' ? fr : en

  return (
    <div>
      <TopNav scheme="over-hero" lang={lang} setLang={setLang} />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: 'var(--ivory)' }}>
        <img src={IMG.hero} alt="" className="cine" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55) saturate(0.85) contrast(1.05)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,22,18,0.55) 0%, rgba(20,22,18,0.25) 40%, rgba(20,22,18,0.7) 100%)' }} />

        <div className="hero-corner-label" style={{ position: 'absolute', top: 110, left: 'var(--gutter)', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85 }}>
          {t('Photographie & Vidéo', 'Photography & Film')}
        </div>
        <div className="hero-corner-label" style={{ position: 'absolute', top: 110, right: 'var(--gutter)', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85 }}>
          {t('Provence Alpes Côte d\'Azur — Depuis 2023', 'Provence Alpes Côte d\'Azur — Since 2023')}
        </div>

        <div className="hero-cartouche-wrap" style={{ position: 'relative', zIndex: 2, padding: '80px 0' }}>
          <Cartouche color="rgba(243,237,226,0.85)" width={620} height={620} className="cartouche-hero">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 28 }}>
              <span>{t('Depuis', 'Since')}</span>
              <DflyMonogram size={44} color="rgba(243,237,226,0.95)" />
              <span>2023</span>
            </div>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(80px,10vw,152px)', lineHeight: 0.88, letterSpacing: '0.005em', fontWeight: 400 }}>
              D<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Fly</span>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(20px,1.8vw,26px)', marginTop: 24, opacity: 0.92 }}>
              Antoine & Rémi Ferrera
            </div>
            <div style={{ width: 60, height: 1, background: 'rgba(243,237,226,0.5)', margin: '32px auto' }} />
            <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(15px,1.1vw,17px)', lineHeight: 1.7, maxWidth: 360, fontWeight: 300, opacity: 0.9, whiteSpace: 'pre-line' }}>
              {t(
                'Prestations photo et vidéo\npour particuliers et professionnels.',
                'Photo and film services\nfor individuals and professionals.'
              )}
            </div>
          </Cartouche>
        </div>

        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.7, textAlign: 'center' }}>
          <div style={{ marginBottom: 10 }}>{t('Découvrir', 'Scroll')}</div>
          <div style={{ width: 1, height: 36, background: 'currentColor', margin: '0 auto', opacity: 0.6 }} />
        </div>
      </section>

      {/* ── INTRO ── */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <SectionLabel num="I" label={t('Bonjour', 'Hello')} align="center" />
            <div style={{ textAlign: 'center', marginTop: 48, fontFamily: 'var(--serif-display)', fontSize: 'clamp(34px,4vw,58px)', lineHeight: 1.18, fontWeight: 400, color: 'var(--fg)', letterSpacing: '-0.005em' }}>
              {t(
                <><em style={{ fontStyle: 'italic', fontWeight: 300 }}>Nous sommes Antoine et Rémi</em>, père et fils.<br /><span style={{ display: 'inline-block', marginTop: 24, fontSize: '0.5em', fontStyle: 'italic', fontWeight: 300, color: 'var(--fg-muted)', lineHeight: 1.55 }}>Nous réalisons des prestations photo & vidéo depuis plusieurs années pour les particuliers comme pour les professionnels.</span></>,
                <><em style={{ fontStyle: 'italic', fontWeight: 300 }}>We are Antoine and Rémi</em>, father and son.<br /><span style={{ display: 'inline-block', marginTop: 24, fontSize: '0.5em', fontStyle: 'italic', fontWeight: 300, color: 'var(--fg-muted)', lineHeight: 1.55 }}>For three years we have been delivering photo & film services for individuals and professionals.</span></>
              )}
            </div>
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '48px auto 0', fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.7, fontWeight: 300, fontStyle: 'italic', color: 'var(--fg-muted)', whiteSpace: 'pre-line' }}>
              {t(
                'Nous savons diriger quand c\'est nécessaire (portrait, immobilier, mise en scène), et rester discrets quand il faut capturer des moments naturels.\nC\'est ce mélange qui définit notre façon de travailler.',
                'We know how to direct when needed (portraits, real estate, staged scenes), and stay discreet when natural moments need to be captured.\nThat blend defines the way we work.'
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAINES ── */}
      <section style={{ background: 'var(--bg-alt)', paddingTop: 'var(--section-y)', paddingBottom: 'var(--section-y)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 80, flexWrap: 'wrap', gap: 24, rowGap: 16 }}>
            <SectionLabel num="II" label={t('Nos domaines', 'Our work')} />
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(24px,2.4vw,36px)', fontWeight: 300, color: 'var(--fg)', maxWidth: 520, textAlign: 'right' }}>
              {t('Nous intervenons sur plusieurs types de projets, avec la même exigence de qualité.', 'We work across many kinds of projects, with the same standard of quality.')}
            </div>
          </div>

          <DomainRow num="01" lang={lang}
            title={t('Mariage', 'Wedding')}
            subtitle={t('Raconter votre journée pour en garder la mémoire', 'Capturing your day to preserve your memories')}
            body={t(
              'Nous intervenons sur les mariages, le plus souvent à deux selon le projet, afin d\'offrir deux points de vue complémentaires et une couverture plus complète de la journée. Nous restons présents sans nous imposer, en accordant une attention particulière aux émotions, aux regards et aux échanges, pour restituer les moments de joie, de partage et d\'intimité tels qu\'ils se vivent.',
              'We work on weddings, most often as a duo depending on the project, in order to offer two complementary viewpoints and a more complete coverage of the day. We remain present without imposing ourselves, paying close attention to emotions, interactions and exchanges, to faithfully capture moments of joy, sharing and intimacy as they naturally unfold.',
            )}
            keywords={[]} href="/mariage"
            image={IMG.wedding1} imageAlt={IMG.wedding2} reverse={false}
          />

          <DomainRow num="02" lang={lang}
            title={t('Immobilier', 'Real Estate')}
            subtitle={t('Le soin du détail, des lignes et de la lumière', 'Care for detail, lines and light')}
            body={t(
              'Une maison se photographie comme un portrait : il faut comprendre ses proportions, attendre la bonne heure, choisir l\'angle qui ne ment pas. Vues au sol et aériennes, intérieurs traités avec une exigence de magazine.',
              'A house is photographed like a portrait: understand its proportions, wait for the right hour, choose the angle that doesn\'t lie.'
            )}
            keywords={t(['Lignes', 'Lumière', 'Proportions', 'Détail'], ['Lines', 'Light', 'Proportions', 'Detail'])}
            image={IMG.realestate} imageAlt={IMG.realestate2} reverse={true}
          />

          <DomainRow num="03" lang={lang}
            title={t('Spectacle', 'Stage')}
            subtitle={t('Captation vivante, multi-caméra', 'Live capture, multi-camera')}
            body={t(
              'Concerts, théâtre, danse. Nous travaillons en discrétion totale, plusieurs caméras, sans gêner les artistes ni la salle. Montage sensible au rythme de la scène.',
              'Concerts, theatre, dance. We work in total discretion, multiple cameras, without disturbing the artists or the room.'
            )}
            keywords={t(['Multi-caméra', 'Direct', 'Rythme', 'Discrétion'], ['Multi-camera', 'Live', 'Rhythm', 'Discretion'])}
            image={IMG.stage} imageAlt={IMG.event} reverse={false}
          />

          <DomainRow num="04" lang={lang}
            title={t('Événement professionnel', 'Corporate event')}
            subtitle={t('Témoigner, valoriser, transmettre', 'Witness, value, transmit')}
            body={t(
              'Lancements, séminaires, inaugurations. Une équipe efficace et invisible qui livre photos et vidéos courtes prêtes à diffuser, en respectant votre identité visuelle.',
              'Launches, seminars, inaugurations. An efficient and invisible team delivering ready-to-share photos and short videos.'
            )}
            keywords={t(['Efficace', 'Invisible', 'Brandé', 'Réactif'], ['Efficient', 'Invisible', 'Branded', 'Responsive'])}
            image={IMG.event} imageAlt={IMG.stage} reverse={true}
          />

          <DomainRow num="05" lang={lang}
            title={t('Famille', 'Family')}
            subtitle={t('Ce que l\'on oublie, ce que l\'on garde', 'What we forget, what we keep')}
            body={t(
              'Séances en extérieur, à la maison, sans direction. Nous laissons les enfants être enfants. Vous gardez ce que personne ne vous offrirait : la vérité d\'un instant.',
              'Outdoor sessions, at home, without direction. We let children be children. You keep the truth of a moment.'
            )}
            keywords={t(['Naturel', 'Tendresse', 'Enfance', 'Présent'], ['Natural', 'Tenderness', 'Childhood', 'Present'])}
            image={IMG.family} imageAlt={IMG.detail} reverse={false} isLast
          />
        </div>
      </section>

      {/* ── SAVOIR-FAIRE ── */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <SectionLabel num="III" label={t('Le savoir-faire', 'The craft')} align="center" />
            <h2 style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1.05, fontWeight: 400, margin: '40px 0 0', letterSpacing: '-0.01em' }}>
              {t(<>De la prise de vue<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>au tirage final</em></>, <>From the shot<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>to the final print</em></>)}
            </h2>
          </div>
          <div className="grid-craft" style={{ marginTop: 100 }}>
            {[
              { num: '01', fr: 'Photographie',          en: 'Photography',          fr_d: 'Argentique en sensibilité, numérique en exigence. Boîtiers plein-format, optiques fixes, lumière naturelle privilégiée.',                                 en_d: 'Film in sensitivity, digital in demand. Full-frame bodies, prime lenses, natural light favored.' },
              { num: '02', fr: 'Vidéo & captation',     en: 'Film & capture',       fr_d: 'Caméras cinéma, son en direct, deux à trois axes simultanés. Le mariage filmé comme un long-métrage court.',                                                en_d: 'Cinema cameras, live sound, two to three simultaneous axes. The wedding filmed like a short feature.' },
              { num: '03', fr: 'Post-traitement',       en: 'Post-processing',      fr_d: 'Chaque image relue, recadrée si nécessaire, calibrée. Aucun filtre. Une cohérence d\'ambiance sur l\'ensemble de la livraison.',                             en_d: 'Every image reviewed, cropped if needed, calibrated. No filters. A coherent mood across the delivery.' },
              { num: '04', fr: 'Montage & color grading', en: 'Editing & grading',  fr_d: 'Le montage est un récit. Le color grading lui donne sa température. Nous travaillons en LUTs sur mesure, scène par scène.',                                 en_d: 'The edit is a story. The grade gives it its temperature. We work with custom LUTs, scene by scene.' },
              { num: '05', fr: 'Télépilotage drone',    en: 'Drone piloting',       fr_d: 'Pilotes certifiés DGAC. Le drone n\'est pas une attraction, c\'est un cinquième regard — utilisé quand il sert le récit.',                                   en_d: 'DGAC-certified pilots. The drone is not an attraction — it\'s a fifth gaze, used when it serves the story.' },
              { num: '06', fr: 'Livraison & tirages',   en: 'Delivery & prints',    fr_d: 'Galerie privée, fichiers HD, livre photo en option. Pour les clients qui le souhaitent, tirages baryté en édition limitée.',                                  en_d: 'Private gallery, HD files, optional photo book. Limited-edition baryta prints for those who want them.' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '48px 56px', borderRight: i % 2 === 0 ? '1px solid var(--line)' : 'none', borderBottom: i < 4 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--fg-muted)', marginBottom: 16 }}>— {c.num}</div>
                <div style={{ fontFamily: 'var(--serif-display)', fontSize: 28, lineHeight: 1.15, fontWeight: 400, marginBottom: 18 }}>{t(c.fr, c.en)}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.65, color: 'var(--fg-muted)', fontWeight: 300, maxWidth: 460 }}>{t(c.fr_d, c.en_d)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DRONE ── */}
      <section style={{ background: 'var(--bg-deep)', color: 'var(--fg-on-deep)', padding: 'var(--section-y) 0' }}>
        <div className="container">
          <div className="grid-drone">
            <div>
              <SectionLabel num="IV" label={t('Vue du ciel', 'Aerial view')} />
              <h2 style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(40px,4.5vw,64px)', lineHeight: 1.05, fontWeight: 400, margin: '32px 0 28px', color: 'var(--fg-on-deep)' }}>
                {t(<>Un cinquième regard,<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>quand il sert le récit.</em></>, <>A fifth gaze,<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>when it serves the story.</em></>)}
              </h2>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.7, fontWeight: 300, opacity: 0.85, maxWidth: 460 }}>
                {t(
                  'Notre nom est dans le ciel : DFly. Mais nous ne sortons le drone que lorsque la scène le demande — un château vu d\'en haut, une plage à l\'aube, une procession dans les vignes. Pilotes certifiés DGAC, vols autorisés en zone S2/S3.',
                  'Our name is in the sky: DFly. But we only fly when the scene calls for it. DGAC-certified pilots, authorized flights in S2/S3 zones.'
                )}
              </p>
              <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 12, rowGap: 8, fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', opacity: 0.7 }}>
                <span>DGAC certifié</span><span style={{ opacity: 0.4 }}>·</span><span>Assuré professionnel</span><span style={{ opacity: 0.4 }}>·</span><span>4K · 6K</span>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <img src={IMG.drone} alt="" className="cine" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.05)' }} />
              <div className="drone-label" style={{ position: 'absolute', bottom: -30, left: -30, background: 'var(--bg-deep)', padding: '20px 28px', borderTop: '1px solid rgba(243,237,226,0.18)', borderRight: '1px solid rgba(243,237,226,0.18)' }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 6 }}>Domaine de</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, fontWeight: 300 }}>la Roque-Forcade · Lubéron</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg)' }}>
        <div className="container">
          <SectionLabel num="V" label={t('Ce qui nous tient', 'What holds us')} align="center" />
          <div style={{ margin: '60px auto 0', maxWidth: 1100, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: 1.18, fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)' }}>
              {t(
                <>&laquo;&nbsp;Nous ne fabriquons pas de souvenirs.<br />Nous attendons qu'ils arrivent,<br />et nous sommes là.&nbsp;&raquo;</>,
                <>"We do not manufacture memories.<br />We wait for them to come,<br />and we are there."</>
              )}
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.36em', textTransform: 'uppercase', marginTop: 36, color: 'var(--fg-muted)' }}>— Antoine & Rémi</div>
          </div>
          <div className="grid-4" style={{ marginTop: 120, borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            {[
              { fr: 'Sensibilité',      en: 'Sensitivity',    fr_d: 'Voir l\'émotion avant qu\'elle ne se nomme. Comprendre les regards.',                                               en_d: 'See emotion before it names itself. Understand the gaze.' },
              { fr: 'Discrétion',       en: 'Discretion',     fr_d: 'Disparaître pour mieux capter. Personne ne se souvient de nous, tout le monde se souvient des images.',             en_d: 'Disappear to capture better. No one remembers us, everyone remembers the images.' },
              { fr: 'Esprit de famille',en: 'Family spirit',  fr_d: 'Père et fils, nous filmons les autres familles avec ce que nous savons des nôtres.',                                en_d: 'Father and son, we film other families with what we know of our own.' },
              { fr: 'Spontanéité',      en: 'Spontaneity',    fr_d: 'Aucune scène rejouée. La lumière qui tombe, le rire qui part, le geste qui ne reviendra pas.',                     en_d: 'No replayed scenes. The light falling, the laugh escaping, the gesture that won\'t return.' },
            ].map((v, i) => (
              <div key={i} style={{ padding: '56px 36px', borderRight: i < 3 ? '1px solid var(--line)' : 'none', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif-display)', fontStyle: 'italic', fontSize: 32, fontWeight: 300, marginBottom: 24 }}>{t(v.fr, v.en)}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 14.5, lineHeight: 1.65, color: 'var(--fg-muted)', fontWeight: 300, maxWidth: 240, margin: '0 auto' }}>{t(v.fr_d, v.en_d)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DUO ── */}
      <section style={{ background: 'var(--bg-alt)', padding: 'var(--section-y) 0' }}>
        <div className="container">
          <div className="grid-duo">
            <div style={{ position: 'relative' }}>
              <img src={IMG.duo} alt="" className="cine" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
              <div style={{ position: 'absolute', top: 24, left: 24, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ivory)', fontWeight: 300, textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                Antoine & Rémi
              </div>
            </div>
            <div>
              <SectionLabel num="VI" label={t('Père & fils', 'Father & son')} />
              <h2 style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(36px,4vw,56px)', lineHeight: 1.08, fontWeight: 400, margin: '32px 0 32px' }}>
                {t(<>Deux regards.<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>Une même famille.</em></>, <>Two gazes.<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>One family.</em></>)}
              </h2>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.75, fontWeight: 300, marginBottom: 22 }}>
                {t(
                  'Antoine photographie depuis trente ans. Rémi est arrivé plus récemment, apportant la vidéo et le drone. Aujourd\'hui, nous sommes tous deux photographes et vidéastes — c\'est devenu notre métier commun.',
                  'Antoine has been photographing for thirty years. Rémi arrived more recently, bringing film and the drone. Today, we are both photographers and filmmakers — it has become our shared craft.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, lineHeight: 1.7, fontWeight: 300, color: 'var(--fg-muted)', maxWidth: 460 }}>
                {t(
                  'Sur un mariage, nous sommes deux : un photographe et un vidéaste. Sur un événement plus large, nous savons monter une équipe. Toujours dans la même grammaire.',
                  'At a wedding, we are two: a photographer and a filmmaker. For larger events, we can build a team. Always in the same grammar.'
                )}
              </p>
              <div className="duo-stats" style={{ marginTop: 48, display: 'flex', gap: 56, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
                {[
                  { val: '30+',    fr: 'Mariages filmés', en: 'Weddings filmed' },
                  { val: '3',      fr: 'Ans à deux',      en: 'Years together'  },
                  { val: 'Provence', fr: 'Et au-delà',    en: 'And beyond'      },
                ].map(s => (
                  <div key={s.val}>
                    <div style={{ fontFamily: 'var(--serif-display)', fontSize: 36, fontStyle: 'italic', fontWeight: 300 }}>{s.val}</div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginTop: 6 }}>{t(s.fr, s.en)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGE ── */}
      <section style={{ padding: 'calc(var(--section-y) * 0.9) 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 64, fontStyle: 'italic', fontWeight: 300, color: 'var(--fg-muted)', lineHeight: 0.5, marginBottom: 24 }}>"</div>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(22px,2.4vw,32px)', lineHeight: 1.45, fontWeight: 300 }}>
              {t(
                'Nous avions peur d\'un mariage envahi par les caméras. Antoine et Rémi ont été invisibles toute la journée. Le film qu\'ils nous ont rendu — nous le regardons encore, deux ans plus tard, et nous pleurons à chaque fois.',
                'We were afraid of a wedding invaded by cameras. Antoine and Rémi were invisible all day. The film they gave us — we still watch it, two years later, and we cry every time.'
              )}
            </p>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.36em', textTransform: 'uppercase', marginTop: 36, color: 'var(--fg-muted)' }}>
              — Camille & Étienne · {t('Mariage à Gordes', 'Wedding in Gordes')}
            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  )
}

// ── DomainRow ────────────────────────────────────────────────────────────────
function DomainRow({ num, title, subtitle, body, keywords = [], lang, image, imageAlt, reverse, isLast, href }) {
  const t = (fr, en) => lang === 'FR' ? fr : en

  const text = (
    <div className="domain-text" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: reverse ? '0 0 0 40px' : '0 40px 0 0' }}>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--fg-muted)', letterSpacing: '0.04em' }}>— {num}</div>
      <h3 style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(48px,6vw,96px)', lineHeight: 0.95, fontWeight: 400, margin: '16px 0 18px', letterSpacing: '-0.005em' }}>{title}</h3>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,1.5vw,22px)', fontWeight: 300, color: 'var(--fg-muted)', marginBottom: 32, maxWidth: 460 }}>{subtitle}</div>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 16.5, lineHeight: 1.7, fontWeight: 300, maxWidth: 480, marginBottom: 36 }}>{body}</p>
      {keywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 36, borderTop: '1px solid var(--line)' }}>
          {keywords.map((k, i) => (
            <div key={i} style={{ fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--fg-muted)', padding: '14px 20px 14px 0', borderBottom: '1px solid var(--line)' }}>
              {k}{i < keywords.length - 1 && <span style={{ marginLeft: 20, opacity: 0.4 }}>·</span>}
            </div>
          ))}
        </div>
      )}
      <Link to={href || '#'} style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--fg)', borderBottom: '1px solid var(--fg)', paddingBottom: 8, display: 'inline-block', alignSelf: 'flex-start' }}>
        {t('Voir le travail', 'See the work')} &nbsp;→
      </Link>
    </div>
  )

  const visual = (
    <div className="domain-visual" style={{ position: 'relative' }}>
      <img src={image} alt="" className="cine" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.02)' }} />
      <img src={imageAlt} alt="" className={`cine domain-thumb${reverse ? ' domain-thumb-reverse' : ''}`} style={{ position: 'absolute', width: '55%', aspectRatio: '1/1', objectFit: 'cover', bottom: -50, [reverse ? 'left' : 'right']: -40, border: '8px solid var(--bg-alt)', filter: 'saturate(0.85) contrast(1.02)', zIndex: 2 }} />
    </div>
  )

  return (
    <div className="grid-domain" style={{ paddingTop: 80, paddingBottom: isLast ? 80 : 120, borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      {reverse ? <>{visual}{text}</> : <>{text}{visual}</>}
    </div>
  )
}
