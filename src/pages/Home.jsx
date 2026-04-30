import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import Cartouche from '../components/Cartouche'
import SectionLabel from '../components/SectionLabel'
import DflyMonogram from '../components/DflyMonogram'

const BASE = import.meta.env.BASE_URL

const IMG = {
  hero:        'https://images.unsplash.com/photo-1519741497674-611481863552?w=2400&q=85',
  wedding1:    `${BASE}images/079_DSC7618.jpeg`,
  wedding2:    `${BASE}images/411_7R44813.jpeg`,
  realestate1: `${BASE}images/_DSC4497-HDR.jpeg`,
  realestate2: `${BASE}images/073_7R44153.jpeg`,
  business1:   `${BASE}images/_A7R3270.jpeg`,
  business2:   `${BASE}images/_DSC0583.jpg`,
  event1:      `${BASE}images/051_7R42448.jpg`,
  event2:      `${BASE}images/DSC08533_1.jpg`,
  portrait1:   `${BASE}images/038_7R42287.jpeg`,
  portrait2:   `${BASE}images/013_DSC2027.jpg`,
  drone:       `${BASE}images/YUN_0157.jpg`,
  duo:         'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1600&q=85',
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
              <span>2020</span>
            </div>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(80px,10vw,152px)', lineHeight: 0.88, letterSpacing: '0.005em', fontWeight: 400 }}>
              D<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Fly</span>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(20px,1.8vw,26px)', marginTop: 24, opacity: 0.92 }}>
              Antoine & Rémi Ferrera
            </div>
            <div style={{ width: 60, height: 1, background: 'rgba(243,237,226,0.5)', margin: '32px auto' }} />
            <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(17px,1.3vw,20px)', lineHeight: 1.7, maxWidth: 360, fontWeight: 300, opacity: 0.9, whiteSpace: 'pre-line' }}>
              {t(
                'Prestations photo et vidéo\nPour particuliers et professionnels',
                'Photo and film services\nFor individuals and professionals'
              )}
            </div>
          </Cartouche>
        </div>

        <div style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
          <a href="#contact" style={{
            fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.32em',
            textTransform: 'uppercase', border: '1px solid rgba(243,237,226,0.85)',
            padding: '14px 28px', color: 'rgba(243,237,226,0.95)',
            display: 'inline-block', whiteSpace: 'nowrap',
            background: 'rgba(20,22,18,0.3)', backdropFilter: 'blur(4px)',
          }}>
            {t('Demander un devis', 'Request a quote')}
          </a>
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
            <div style={{ textAlign: 'center', marginTop: 28, fontFamily: 'var(--serif-display)', fontSize: 'clamp(34px,4vw,58px)', lineHeight: 1.18, fontWeight: 400, color: 'var(--fg)', letterSpacing: '-0.005em' }}>
              {t(
                <><em style={{ fontStyle: 'italic', fontWeight: 300 }}>Nous sommes Antoine et Rémi</em>, père et fils.<br /><span style={{ display: 'inline-block', marginTop: 24, fontSize: '0.5em', fontStyle: 'italic', fontWeight: 300, color: 'var(--fg-muted)', lineHeight: 1.55 }}>Nous réalisons des prestations photo & vidéo pour les particuliers et les professionnels.</span></>,
                <><em style={{ fontStyle: 'italic', fontWeight: 300 }}>We are Antoine and Rémi</em>, father and son.<br /><span style={{ display: 'inline-block', marginTop: 24, fontSize: '0.5em', fontStyle: 'italic', fontWeight: 300, color: 'var(--fg-muted)', lineHeight: 1.55 }}>We deliver photo & film services for individuals and professionals.</span></>
              )}
            </div>
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '28px auto 0', fontFamily: 'var(--serif)', fontSize: 25, lineHeight: 1.4, fontWeight: 300, fontStyle: 'italic', color: 'var(--fg-muted)', whiteSpace: 'pre-line' }}>
              {t(
                'Nous adaptons notre approche à la situation : discrets pour capter l\’émotion sur le vif, présents quand l\’image doit être composée. Selon le projet, nous intervenons à deux.',
                'We adapt our approach to each situation: discreet to capture emotions as they happen, and present when the image needs to be composed. Depending on the project, we often work as a duo.'
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAINES ── */}
      <section style={{ background: 'var(--bg-alt)', paddingTop: 'var(--section-y)', paddingBottom: 'var(--section-y)' }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <SectionLabel num="II" label={t('Nos domaines', 'Our work')} />
          </div>

          <DomainRow num="01" lang={lang}
            title={t('Mariage', 'Wedding')}
            subtitle={t('Votre journée, vos souvenirs.', 'Your day, your memories.')}
            body={t(
              'Vous vivez votre mariage de l\'intérieur — portés par l\'émotion, entourés de ceux que vous aimez. Certains regards, certains sourires, vous ne les verrez qu\'après, sur les images. C\'est exactement notre rôle.',
              'You live your wedding from the inside — carried by emotion, surrounded by those you love. Some glances, some smiles, you will only see them afterwards, in the images. That is exactly our role.',
            )}
            keywords={[]} href="/mariage"
            image={IMG.wedding1} imageAlt={IMG.wedding2} reverse={false}
          />

          <DomainRow num="02" lang={lang}
            title={t('Immobilier', 'Real Estate')}
            subtitle={t('Le soin du détail, des lignes et de la lumière', 'Care for detail, lines and light')}
            body={t(
              'De la maison individuelle au programme neuf, chaque bien a une heure, un angle, une lumière qui lui convient. Vues au sol et aériennes, intérieurs et extérieurs traités avec une exigence de magazine.',
              'From the individual home to new developments, every property has an hour, an angle, a light that suits it. Ground and aerial views, interiors and exteriors treated with a magazine standard.'
            )}
            keywords={[]}
            image={IMG.realestate1} imageAlt={IMG.realestate2} reverse={true}
          />

          <DomainRow num="03" lang={lang}
            title={t('Communication & Entreprise', 'Business & Brand')}
            subtitle={t('Votre travail mérite d\'être vu', 'Your work deserves to be seen')}
            body={t(
              'Artisans, constructeurs, domaines, commerçants. Des photos et vidéos qui montrent votre travail — pour vos réseaux, vos affiches, vos appels d\'offres.',
              'Craftsmen, builders, estates, retailers. Photos and videos that show your work — for your social media, print, and tenders.'
            )}
            keywords={[]}
            image={IMG.business1} imageAlt={IMG.business2} reverse={false}
          />

          <DomainRow num="04" lang={lang}
            title={t('Événement & Spectacle', 'Event & Stage')}
            subtitle={t('Captation vivante, multi-caméra', 'Live capture, multi-camera')}
            body={t(
              'Défilés, remises de diplômes, concerts, festivals, spectacles. Chaque événement a son rythme, son émotion, son moment décisif. Notre rôle est de les saisir.',
              'Fashion shows, graduations, concerts, festivals, performances. Every event has its rhythm, its emotion, its decisive moment. Our role is to capture them.'
            )}
            keywords={[]}
            image={IMG.event1} imageAlt={IMG.event2} reverse={true}
          />

          <DomainRow num="05" lang={lang}
            title={t('Portrait & Famille', 'Portrait & Family')}
            subtitle={t('Des images simples, vraies, durables.', 'Simple, true, lasting images.')}
            body={t(
              'Séances en extérieur, à la maison, sans rien imposer. Books, couples, familles avec enfants. Nous laissons les choses se passer — vous gardez la vérité d\'un instant.',
              'Outdoor sessions, at home, without imposing anything. Portfolios, couples, families with children. We let things happen — you keep the truth of a moment.'
            )}
            keywords={[]}
            image={IMG.portrait1} imageAlt={IMG.portrait2} reverse={false} isLast
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
          <div className="grid-craft" style={{ marginTop: 36 }}>
            {[
              { num: '01', fr: 'Photographie',          en: 'Photography',          fr_d: 'Boîtiers plein-format Sony, optiques haut de gamme, éclairage maîtrisé. C\'est le regard qui décide. Choisir le bon moment, laisser la lumière faire le reste.',                                 en_d: 'Sony full-frame bodies, high-end lenses, controlled lighting. It is the eye that decides. Choose the right moment, let the light do the rest.' },
              { num: '02', fr: 'Vidéo & captation',     en: 'Film & capture',       fr_d: 'Caméras cinéma Blackmagic, optiques Xeen, multi-caméra si besoin. Chaque projet filmé avec la même exigence, du clip court au film long format.',                                                en_d: 'Blackmagic cinema cameras, Xeen lenses, multi-camera when needed. Every project filmed to the same standard, from short clip to long-form film.' },
              { num: '03', fr: 'Retouche photo',         en: 'Photo editing',        fr_d: 'Chaque image relue, recadrée si nécessaire, traitée selon ce qu\'elle demande. Fidèle à la scène ou sublimée, toujours au service du sujet.',              en_d: 'Every image reviewed, cropped if needed, processed according to what it asks. True to the scene or elevated — always at the service of the subject.' },
              { num: '04', fr: 'Montage & color grading', en: 'Editing & grading',  fr_d: 'Le montage est un récit. Il a son rythme, ses respirations, ses ruptures. La couleur vient lui donner sa personnalité. Nous travaillons chaque film pour que le spectateur ne regarde pas des images, il vit une histoire.',                                 en_d: 'The edit is a story. It has its rhythm, its breathing, its ruptures. Colour gives it its personality. We work each film so the viewer does not watch images, they live a story.' },
              { num: '05', fr: 'Télépilotage drone',    en: 'Drone piloting',       fr_d: 'Pilotes certifiés DGAC. Le drone est notre troisième regard : celui qui s\'élève là où nos pieds ne vont pas. Utilisé quand il sert le récit.',              en_d: 'DGAC-certified pilots. The drone is our third eye: the one that rises where our feet cannot go. Used when it serves the story.' },
              { num: '06', fr: 'Livraison & tirages',   en: 'Delivery & prints',    fr_d: 'Galerie privée en ligne, fichiers HD sur clé USB bois gravée au logo DFly. Films et résumés inclus selon la formule. Produits dérivés commandables en ligne via notre galerie partenaire : tirages, calendriers, livres photo et bien d\'autres.',  en_d: 'Private online gallery, HD files on a wood USB engraved with the DFly logo. Films and highlights included depending on the package. Derivative products orderable online via our partner gallery: prints, calendars, photo books and more.' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '36px 48px', borderRight: i % 2 === 0 ? '1px solid var(--line)' : 'none', borderBottom: i < 4 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--fg-muted)', marginBottom: 16 }}>— {c.num}</div>
                <div style={{ fontFamily: 'var(--serif-display)', fontSize: 28, lineHeight: 1.15, fontWeight: 400, marginBottom: 18 }}>{t(c.fr, c.en)}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.65, color: 'var(--fg-muted)', fontWeight: 300, maxWidth: 460 }}>{t(c.fr_d, c.en_d)}</div>
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
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.7, fontWeight: 300, opacity: 0.85, maxWidth: 460 }}>
                {t(
                  'Notre nom est dans le ciel : DFly. Mais nous ne sortons le drone que lorsque la scène le demande — un château vu d\'en haut, une plage à l\'aube, une procession dans les vignes. Pilotes certifiés DGAC.',
                  'Our name is in the sky: DFly. But we only fly when the scene calls for it — a château from above, a beach at dawn, a procession through the vines. DGAC-certified pilots.'
                )}
              </p>
              <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 12, rowGap: 8, fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', opacity: 0.7 }}>
                <span>DGAC certifié</span><span style={{ opacity: 0.4 }}>·</span><span>Assuré professionnel</span><span style={{ opacity: 0.4 }}>·</span><span>4K · 6K</span>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <img src={IMG.drone} alt="" className="cine" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.05)' }} />
              <div className="drone-label" style={{ position: 'absolute', bottom: -30, left: -30, background: 'var(--bg-deep)', padding: '20px 28px', borderTop: '1px solid rgba(243,237,226,0.18)', borderRight: '1px solid rgba(243,237,226,0.18)' }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 6 }}>Domaine</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, fontWeight: 300 }}>Château Réal d'Or · Massif des Maures</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section style={{ padding: 'var(--section-y) 0', background: 'var(--bg)' }}>
        <div className="container">
          <SectionLabel num="V" label={t('Ce qui nous tient', 'What holds us')} align="center" />
          <div style={{ margin: '24px auto 0', maxWidth: 1100, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: 1.18, fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)' }}>
              {t(
                <>&laquo;&nbsp;Toujours la même exigence : l'image&nbsp;juste.&nbsp;&raquo;</>,
                <>"Always the same standard: the right image."</>
              )}
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.36em', textTransform: 'uppercase', marginTop: 36, color: 'var(--fg-muted)' }}>— Antoine & Rémi</div>
          </div>
          <div className="grid-4" style={{ marginTop: 40, borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            {[
              { fr: 'Exigence',         en: 'Standard',       fr_d: 'Du matériel haut de gamme, un œil formé, une attention constante aux détails. Chaque projet mérite notre meilleur.',                     en_d: 'High-end equipment, a trained eye, constant attention to detail. Every project deserves our best.' },
              { fr: 'Adaptabilité',     en: 'Adaptability',   fr_d: 'Reportage discret sur un mariage, mise en scène soignée pour l\'immobilier, captation live pour un événement. Nous changeons de posture, pas de rigueur.', en_d: 'Discreet reportage at a wedding, careful staging for real estate, live capture for an event. We change our stance, not our rigour.' },
              { fr: 'Sensibilité',      en: 'Sensitivity',    fr_d: 'Comprendre ce qu\'on filme avant de filmer. Que ce soit une salle de concert ou un vignoble, nous cherchons ce qui fait la vérité du lieu ou du moment.', en_d: 'Understand what we film before filming. Whether a concert hall or a vineyard, we look for what makes the truth of the place or moment.' },
              { fr: 'Engagement',       en: 'Commitment',     fr_d: 'Nous mettons dans chaque projet ce que nous mettrions dans le nôtre. Sans distance.',                                       en_d: 'We bring to every project what we would bring to our own. Without distance.' },
            ].map((v, i) => (
              <div key={i} style={{ padding: '28px 36px', borderRight: i < 3 ? '1px solid var(--line)' : 'none', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif-display)', fontStyle: 'italic', fontSize: 32, fontWeight: 300, marginBottom: 24 }}>{t(v.fr, v.en)}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.65, color: 'var(--fg-muted)', fontWeight: 300, maxWidth: 240, margin: '0 auto' }}>{t(v.fr_d, v.en_d)}</div>
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
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, marginBottom: 22 }}>
                {t(
                  'Antoine photographie depuis 1981. Formé dans un labo photo militaire, projectionniste de cinéma, avant une carrière dans l\'électronique et l\'informatique — la photo l\'a accompagné toute sa vie, en amateur exigeant.',
                  'Antoine has been photographing since 1981. Trained in a military photo lab, cinema projectionist, then a career in electronics and IT — photography accompanied him all his life, as a demanding amateur.'
                )}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, maxWidth: 460 }}>
                {t(
                  'Après un BTS bâtiment, Rémi a exercé comme dessinateur projeteur avant de se tourner vers le drone, puis la vidéo, puis la photo. Un œil formé aux volumes, aux lignes, à la précision. Ensemble, deux regards complémentaires, une même rigueur.',
                  'After a construction degree, Rémi worked as a technical draughtsman before turning to drones, then film, then photography. An eye trained in volumes, lines and precision. Together, two complementary gazes, one shared rigour.'
                )}
              </p>
              <div className="duo-stats" style={{ marginTop: 28, display: 'flex', gap: 56, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
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
          <SectionLabel num="VII" label={t('Ce qu\'ils en disent', 'What they say')} align="center" />
          <div className="grid-3" style={{ marginTop: 56 }}>
            {[
              {
                fr: 'Chaque photo raconte une histoire et reflète parfaitement l\'émotion du moment. Des clichés lumineux, authentiques et d\'une qualité exceptionnelle.',
                en: 'Every photo tells a story and perfectly captures the emotion of the moment. Luminous, authentic images of exceptional quality.',
                who: 'Axelle C.', where: t('Septembre 2025', 'September 2025'),
              },
              {
                fr: 'La gentillesse, la disponibilité, leur écoute, et bien sûr leur travail d\'une très grande qualité. Nous referons appel à eux sans hésitation pour une prochaine occasion.',
                en: 'Their kindness, availability, attentiveness, and of course their work of very high quality. We will call on them again without hesitation.',
                who: 'Pascale B.', where: t('Mariage · Octobre 2024', 'Wedding · October 2024'),
              },
              {
                fr: 'Le choix des points de vue m\'a vraiment bluffé. Je recommande sans l\'ombre d\'une hésitation.',
                en: 'The choice of viewpoints truly amazed me. I recommend without the slightest hesitation.',
                who: 'Gérard B.', where: t('Immobilier · 2020', 'Real estate · 2020'),
              },
            ].map((q, i) => (
              <div key={i} style={{ borderTop: '1px solid var(--line)', paddingTop: 32 }}>
                <div style={{ fontFamily: 'var(--serif-display)', fontSize: 48, fontStyle: 'italic', fontWeight: 300, color: 'var(--fg-muted)', lineHeight: 0.5, marginBottom: 24 }}>"</div>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.6, fontWeight: 300 }}>{t(q.fr, q.en)}</p>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.36em', textTransform: 'uppercase', marginTop: 24, color: 'var(--fg-muted)' }}>
                  — {q.who} · {q.where}
                </div>
              </div>
            ))}
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
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(20px,1.7vw,24px)', fontWeight: 300, color: 'var(--fg-muted)', marginBottom: 32, maxWidth: 460 }}>{subtitle}</div>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.7, fontWeight: 300, maxWidth: 480, marginBottom: 36 }}>{body}</p>
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
    <div className="grid-domain" style={{ paddingTop: 40, paddingBottom: isLast ? 40 : 60, borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      {reverse ? <>{visual}{text}</> : <>{text}{visual}</>}
    </div>
  )
}
