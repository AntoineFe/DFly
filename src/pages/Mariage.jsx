import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import SectionLabel from '../components/SectionLabel'
import DevisFunnel from '../components/DevisFunnel'

const BASE = import.meta.env.BASE_URL;
const W_IMG = {
  hero:        `${BASE}images/mariage/_7R41480.jpeg`,
  bride:       `${BASE}images/mariage/434_DSC8785.jpeg`,
  couple:      `${BASE}images/mariage/420b_7R41676.jpeg`,
  ceremony:    `${BASE}images/mariage/MAX_0035.jpeg`,
  bouquet:     `${BASE}images/mariage/409_7R49654.jpeg`,
  preparation: `${BASE}images/mariage/_7R44108.jpg`,
  dance:       `${BASE}images/mariage/374_7R45410.jpeg`,
  details:     `${BASE}images/mariage/239_7R45173_1.jpg`,
  guests:      `${BASE}images/mariage/424_DSC8763.jpeg`,
  table:       `${BASE}images/mariage/_7R41267.jpeg`,
  aerial:      `${BASE}images/mariage/MAX_0011.jpeg`,
  sortie:      `${BASE}images/mariage/090_7R43637.jpg`,
  filmstrip1:  `${BASE}images/mariage/_DSC7546.jpeg`,
  filmstrip2:  `${BASE}images/mariage/_7R41266_1.jpeg`,
  filmstrip3:  `${BASE}images/mariage/_DSC7838.jpeg`,
  filmstrip4:  `${BASE}images/mariage/397_DSC0942.jpeg`,
  filmstrip5:  `${BASE}images/mariage/445_7R49749.jpeg`,
  filmstrip6:  `${BASE}images/mariage/423_7R44891_1.jpeg`,
  filmstrip7:  `${BASE}images/mariage/462_7R45062.jpeg`,
};

function Mariage({ lang, setLang }) {
  const t = (fr, en) => lang === "FR" ? fr : en;

  return (
    <div>
      <TopNav active="wedding" scheme="over-hero" lang={lang} setLang={setLang} />

      {/* HERO — full bleed image with editorial title overlay */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
        color: "var(--ivory)",
        paddingTop: 160,
        paddingBottom: 80,
      }}>
        <img
          src={W_IMG.hero}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            filter: "brightness(0.62) saturate(0.82) contrast(1.05)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(20,22,18,0.5) 0%, rgba(20,22,18,0.15) 50%, rgba(20,22,18,0.85) 100%)",
        }} />

        {/* Top corner labels */}
        <div className="hero-corner-label" style={{
          position: "absolute", top: 110, left: "var(--gutter)",
          fontFamily: "var(--sans)", fontSize: 11,
          letterSpacing: "0.4em", textTransform: "uppercase",
          opacity: 0.85,
        }}>
          {t("Domaine 01", "Field 01")}
        </div>
        <div className="hero-province-label" style={{
          position: "absolute", top: 110, right: "var(--gutter)",
          fontFamily: "var(--sans)", fontSize: 11,
          letterSpacing: "0.4em", textTransform: "uppercase",
          opacity: 0.85,
        }}>
          {t('Provence Alpes Côte d\'Azur', 'Provence Alpes Côte d\'Azur')}
        </div>

        <div className="container hero-intro-container" style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-intro-flex" style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 80,
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--sans)", fontSize: 11,
                letterSpacing: "0.4em", textTransform: "uppercase",
                opacity: 0.85, marginBottom: 32,
              }}>
                — {t("Mariage", "Wedding")}
              </div>
              <h1 style={{
                fontFamily: "var(--serif-display)",
                fontSize: "clamp(72px, 11vw, 200px)",
                lineHeight: 0.86,
                fontWeight: 400,
                margin: 0,
                letterSpacing: "-0.005em",
              }}>
                {t(<>Le jour<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>qui devient</em><br/>mémoire.</>,
                   <>The day<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>that becomes</em><br/>memory.</>)}
              </h1>
            </div>
            <div style={{ maxWidth: 500, paddingBottom: 24 }}>
              <p style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: "clamp(19px, 1.6vw, 24px)", lineHeight: 1.6,
                fontWeight: 300,
                opacity: 0.92,
              }}>
                {t(
                  "Antoine et Rémi, père et fils, photographes et vidéastes. Selon votre journée, nous intervenons en duo : deux photographes, deux vidéastes, ou photographe & vidéaste.",
                  "Antoine and Rémi, father and son, photographers and filmmakers. Depending on your day, we work as a duo: two photographers, two filmmakers, or photographer & filmmaker."
                )}
              </p>
              <a href="#devis" style={{
                display: "inline-block", marginTop: 24,
                fontFamily: "var(--sans)", fontSize: 11,
                letterSpacing: "0.32em", textTransform: "uppercase",
                border: "1px solid rgba(243,237,226,0.7)",
                padding: "12px 24px", color: "rgba(243,237,226,0.9)",
                textDecoration: "none",
              }}>
                {t("Voir les tarifs", "See pricing")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO MANIFESTO */}
      <section style={{ padding: "var(--section-y) 0", background: "var(--bg)" }}>
        <div className="container">
          <div className="grid-manifesto">
            <div style={{ position: "sticky", top: 120 }}>
              <SectionLabel num="I" label={t("Notre approche", "Our approach")} />
            </div>
            <div>
              <p style={{
                fontFamily: "var(--serif-display)",
                fontSize: "clamp(30px, 3.4vw, 48px)",
                lineHeight: 1.18,
                fontWeight: 400,
                color: "var(--fg)",
                marginTop: 0, marginBottom: 36,
                letterSpacing: "-0.005em",
                textWrap: "pretty",
              }}>
                {t(
                  "Vous nous confiez un jour qui ne se rejoue pas. Nous le capturons en photo et en vidéo avec sensibilité, présents aux bons moments.",
                  "You entrust us with a day that won't replay. We capture it in photo and video with sensitivity, present at the right moments."
                )}
              </p>
              <p style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(18px, 1.2vw, 21px)", lineHeight: 1.75,
                fontWeight: 300,
                color: "var(--fg-muted)",
                maxWidth: 620,
                marginBottom: 24,
              }}>
                {t(
                  "Nous intervenons selon le déroulé de votre journée, et composons avec ce qui se joue naturellement, à vos côtés. Le jour vous appartient. Notre rôle est d'en révéler les images.",
                  "We work with the flow of your day, composing with what unfolds naturally, by your side. The day is yours. Our role is to reveal its images."
                )}
              </p>
              <p style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(18px, 1.2vw, 21px)", lineHeight: 1.75,
                fontWeight: 300,
                color: "var(--fg-muted)",
                maxWidth: 620,
              }}>
                {t(
                  "Nous travaillons ensemble depuis plusieurs années, en duo. Deux regards complémentaires, deux manières de lire la scène, pour une vision plus complète de votre journée.",
                  "We have worked together for several years, as a duo. Two complementary perspectives, two ways of reading the scene, for a more complete vision of your day."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TWO WORLDS — photo / video editorial */}
      <section style={{ padding: "var(--section-y) 0", background: "var(--bg-alt)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel num="II" label={t("Deux médiums", "Two mediums")} align="center" />
            <h2 style={{
              fontFamily: "var(--serif-display)",
              fontSize: "clamp(40px, 5vw, 72px)",
              lineHeight: 1.05,
              fontWeight: 400,
              margin: "32px 0 0",
              color: "var(--fg)",
            }}>
              {t(
                <>Photographie<em style={{ fontStyle: "italic", fontWeight: 300 }}> & </em>Film</>,
                <>Photography<em style={{ fontStyle: "italic", fontWeight: 300 }}> & </em>Film</>
              )}
            </h2>
          </div>

          <div className="grid-two-mediums">
            {/* Photo */}
            <div>
              <img src={W_IMG.bride} alt=""
                style={{
                  width: "100%", aspectRatio: "4/5", objectFit: "cover",
                  filter: "saturate(0.85) contrast(1.02)",
                }} />
              <div style={{ padding: "32px 0 0" }}>
                <div className="num" style={{ marginBottom: 12 }}>— {t("Médium 01", "Medium 01")}</div>
                <div style={{
                  fontFamily: "var(--serif-display)",
                  fontSize: 38, fontStyle: "italic", fontWeight: 300,
                  marginBottom: 18, color: "var(--fg)",
                }}>{t("Photographie", "Photography")}</div>
                <p style={{
                  fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.7,
                  fontWeight: 300, color: "var(--fg-muted)", maxWidth: 480,
                }}>
                  {t(
                    "Boîtiers plein-format, optiques haut de gamme Sony GM, lumière maîtrisée selon les lieux. Une sélection d'images travaillées une à une. Livraison via galerie privée et coffret DFly contenant l'ensemble des fichiers en haute définition.",
                    "Full-frame bodies, Sony GM premium lenses, light mastered to each location. A curated selection of individually processed images. Delivered via private gallery and DFly box set containing all files in high definition."
                  )}
                </p>
                <div style={{
                  marginTop: 24,
                  display: "flex", gap: 16, flexWrap: "wrap",
                  fontFamily: "var(--sans)", fontSize: 10.5,
                  letterSpacing: "0.32em", textTransform: "uppercase",
                  color: "var(--fg-muted)",
                }}>
                  <span>Galerie privée</span><span>·</span>
                  <span>Clé USB bois DFly</span><span>·</span>
                  <span>Commande de tirages en ligne</span>
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="medium-offset" style={{ paddingTop: 100 }}>
              <img src={W_IMG.couple} alt=""
                style={{
                  width: "100%", aspectRatio: "4/5", objectFit: "cover",
                  objectPosition: "70% center",
                  filter: "saturate(0.85) contrast(1.02)",
                }} />
              <div style={{ padding: "32px 0 0" }}>
                <div className="num" style={{ marginBottom: 12 }}>— {t("Médium 02", "Medium 02")}</div>
                <div style={{
                  fontFamily: "var(--serif-display)",
                  fontSize: 38, fontStyle: "italic", fontWeight: 300,
                  marginBottom: 18, color: "var(--fg)",
                }}>{t("Vidéo & captation", "Film & capture")}</div>
                <p style={{
                  fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.7,
                  fontWeight: 300, color: "var(--fg-muted)", maxWidth: 480,
                }}>
                  {t(
                    "Caméras cinéma, son en direct, deux à trois axes. Un teaser de 90 secondes, un film d'environ 12 minutes, et la cérémonie complète. Color grading sur mesure, scène par scène.",
                    "Cinema cameras, live sound, two to three axes. A 90-second teaser, a film of about 12 minutes, and the full ceremony. Custom color grading, scene by scene."
                  )}
                </p>
                <div style={{
                  marginTop: 24,
                  display: "flex", gap: 16, flexWrap: "wrap",
                  fontFamily: "var(--sans)", fontSize: 10.5,
                  letterSpacing: "0.32em", textTransform: "uppercase",
                  color: "var(--fg-muted)",
                }}>
                  <span>Teaser 90s</span><span>·</span>
                  <span>Film 12 min</span><span>·</span>
                  <span>Cérémonie intégrale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY MOSAIC — editorial */}
      <section style={{ padding: "var(--section-y) 0 0", background: "var(--bg)" }}>
        <div className="container">
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 60,
          }}>
            <SectionLabel num="III" label={t("Quelques images", "A few images")} />
            <div style={{
              fontFamily: "var(--serif)", fontStyle: "italic",
              fontSize: 18, fontWeight: 300, color: "var(--fg-muted)",
            }}>
              {t("Provence · 2024 — 2026", "Provence · 2024 — 2026")}
            </div>
          </div>
        </div>

        <div style={{ width: "100%", padding: "0 var(--gutter)" }}>
          <div className="grid-gallery">
            <GridImg src={W_IMG.ceremony}    cols="span 7"  rows="span 4" />
            <GridImg src={W_IMG.bouquet}     cols="span 5"  rows="span 3" />
            <GridImg src={W_IMG.preparation} cols="span 5"  rows="span 4" />
            <GridImg src={W_IMG.dance}       cols="span 4"  rows="span 6" pos="center 20%" />
            <GridImg src={W_IMG.sortie}      cols="span 3"  rows="span 3" zoom={1} pos="center 30%" />
            <GridImg src={W_IMG.details}     cols="span 8"  rows="span 3" pos="center 30%" />
            <GridImg src={W_IMG.guests}      cols="span 6"  rows="span 4" />
            <GridImg src={W_IMG.table}       cols="span 6"  rows="span 4" />
            <GridImg src={W_IMG.aerial}      cols="span 12" rows="span 4" pos="center 60%" />
          </div>
        </div>
      </section>

      {/* TIMELINE — the day */}
      <section style={{ padding: "var(--section-y) 0", background: "var(--bg-alt)", position: "relative", overflow: "hidden" }}>
        <img
          src={`${BASE}images/mariage/230_7R44147.jpeg`}
          alt=""
          className="timeline-bg"
          style={{
            position: "absolute", right: 0, bottom: 0,
            height: "100%", width: "auto",
            objectFit: "cover", objectPosition: "right bottom",
            opacity: 0.1,
            filter: "grayscale(1)",
            pointerEvents: "none",
          }}
        />
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel num="IV" label={t("L", "The day, hour by hour")} align="center" />
            <h2 style={{
              fontFamily: "var(--serif-display)",
              fontSize: "clamp(36px, 4.4vw, 60px)",
              lineHeight: 1.1,
              fontWeight: 400,
              margin: "32px 0 0",
              color: "var(--fg)",
            }}>
              {t(
                <>Une journée qui se raconte<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>du matin à la dernière danse.</em></>,
                <>A day told<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>from morning to the last dance.</em></>
              )}
            </h2>
          </div>

          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            {[
              { time: "10h00", fr: "Préparatifs",  en: "Preparations",
                fr_d: "Dans la chambre des parents, la robe attend dans la lumière. Les bijoux, les chaussures neuves. Les amies rient, la maman guide, la mamie tient en elle quelque chose entre bonheur et nostalgie. Le grand-père ne dit rien mais ne rate rien. Puis la porte s'ouvre. Le père voit sa fille.",
                en_d: "In the parents' room, the dress waits in the light. The jewellery, the new shoes. Friends laugh, the mother guides, the grandmother holds something between joy and nostalgia. The grandfather says nothing but misses nothing. Then the door opens. The father sees his daughter." },
              { time: "14h00", fr: "Mairie", en: "Town hall",
                fr_d: "C'est l'étape qui change tout — devant la loi et devant les hommes. La salle est joyeuse, le marié entre, puis la mariée, puis la salle vit au rythme des paroles du maire. Des textes simples, lus à voix haute, officiels. Des sourires, des regards, des larmes.\nC'est la naissance d'une famille.",
                en_d: "This is the step that changes everything — before the law and before the world. The room is joyful, the groom enters, then the bride, then the room comes alive with the mayor's words. Simple texts, read aloud, irrevocable. Smiles, glances, tears. A family is born." },
              { time: "15h00", fr: "Cérémonie laïque ou religieuse", en: "Ceremony",
                fr_d: "La cérémonie — religieuse ou laïque — ramène vers l'essentiel. On pense à ceux qui sont partis, on mesure à quel point on tient à ceux qui sont encore là. Les mots viennent du cœur — et pourtant la salle reste légère, les rires arrivent entre les larmes. C'est ce mélange qu'on observe dans l'objectif : la profondeur et la joie, souvent sur le même visage, au même instant.",
                en_d: "The ceremony — religious or secular — brings us back to what matters. We think of those who have gone, we measure how much we hold onto those still here. Words come from the heart — and yet the room stays light, laughter arrives between tears. That is the mix we observe through the lens: depth and joy, often on the same face, at the same instant." },
              { time: "16h30", fr: "Séance photo", en: "Portrait session",
                fr_d: "Ils se sont dit oui. À la sortie, la joie explose — bulles et pétales brillent, tout le monde veut sa photo avec les mariés. Puis le couple s'éclipse. C'est notre moment : trente minutes, à l'écart, loin du bruit.",
                en_d: "They've said yes. Outside, joy erupts — bubbles and petals catching the light, everyone wants a photo with the couple. Then they slip away. This is our moment: thirty minutes, apart from the crowd, away from the noise." },
              { time: "18h00", fr: "Cocktail / Vin d'honneur", en: "Cocktail hour",
                fr_d: "Les amis se retrouvent. Les deux familles font connaissance, un verre à la main. Des photos spontanées, sans mise en scène.",
                en_d: "The cocktail hour is the world finding itself again. Families discover each other, old friends recognise one another with a smile. Children run between adults, glasses clink. While the couple was with us, the party organised itself without them. When they reappear, there's a way of applauding that says everything." },
              { time: "20h00", fr: "Dîner", en: "Dinner",
                fr_d: "Une salle décorée, des tables soignées. Le plan de table est une surprise — les invités découvrent, s'amusent, s'émerveillent. Puis la musique, les mariés entrent sous les acclamations. La soirée peut commencer. On se défoule puis on s'assoit pour le dîner — un tour des tables pour les photos de groupe. Souvent, le repas s'entremêle de musique et de danse. Puis viennent les discours, les interventions, les jeux — certains préparés depuis des semaines, d'autres improvisés au micro. Les larmes ne préviennent pas, les rires non plus. Le gâteau clôt le repas.",
                en_d: "A decorated room, carefully dressed tables. The seating plan is a surprise — guests discover it, laugh, wonder. Then the music, the couple enters to cheers. The evening can begin. People let loose then take their seats — a round of tables for group photos. Then come the speeches, the games, the surprises — some prepared for weeks, others improvised at the mic. Tears don't warn you. Neither do laughs." },
              { time: "23h00", fr: "Danse", en: "Dancing",
                fr_d: "L'ouverture de bal, puis la piste qui s'ouvre à tous. Les lumières baissent, la musique monte, les gens se lâchent. Il y a ceux qui dansent bien et ceux qui s'en fichent. La piste se vide vers minuit quand les parents rentrent, se remplit à nouveau. On reste jusqu'à la fin. Les meilleures images, parfois, se font à cette heure-là.",
                en_d: "The first dance, then the floor opens to everyone. Lights go down, music rises, people let go. Some dance well, others don't care. The cake arrives — everyone stops, they cut, they taste. Then the floor comes back. It empties around midnight when the parents leave, fills again. We stay until the end. The best images, sometimes, happen at this hour." },
            ].map((step, i) => (
              <div key={i} className="grid-timeline-row" style={{
                padding: "32px 0",
                borderTop: "1px solid var(--line)",
                borderBottom: i === 6 ? "1px solid var(--line)" : "none",
              }}>
                <div>
                  <div style={{
                    fontFamily: "var(--serif-display)",
                    fontSize: 28, fontStyle: "italic",
                    fontWeight: 300, color: "var(--fg)",
                  }}>{step.time}</div>
                </div>
                <div>
                  <div style={{
                    fontFamily: "var(--serif-display)",
                    fontSize: 26, fontWeight: 400,
                    color: "var(--fg)", marginBottom: 10,
                  }}>{t(step.fr, step.en)}</div>
                  <div style={{
                    fontFamily: "var(--serif)",
                    fontSize: "clamp(20px, 2vw, 30px)", lineHeight: 1.3,
                    fontWeight: 300, fontStyle: "italic",
                    color: "var(--fg-muted)",
                    whiteSpace: "pre-line",
                  }}>{t(step.fr_d, step.en_d)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILMSTRIP / Process — wedding film stills */}
      <section style={{ padding: "var(--section-y) 0", background: "var(--bg)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <SectionLabel num="V" label={t("Un extrait", "A frame")} align="center" />
            <h2 style={{
              fontFamily: "var(--serif-display)",
              fontSize: "clamp(36px, 4vw, 56px)",
              fontStyle: "italic",
              lineHeight: 1.15,
              fontWeight: 300,
              margin: "32px auto 0",
              color: "var(--fg)",
              maxWidth: 720,
            }}>
              {t("« Un film de mariage »", "« A wedding film »")}
            </h2>
            <div style={{
              fontFamily: "var(--sans)", fontSize: 11,
              letterSpacing: "0.36em", textTransform: "uppercase",
              color: "var(--fg-muted)", marginTop: 16,
            }}>
              {t("Côte d'Azur · Provence", "Côte d'Azur · Provence")}
            </div>
          </div>
        </div>

        {/* film strip */}
        <div style={{
          background: "var(--bg-deep)",
          padding: "32px 0",
          position: "relative",
        }}>
          <div style={{
            display: "flex", gap: 4,
            overflowX: "auto",
            padding: "0 var(--gutter)",
          }}>
            {[W_IMG.filmstrip1, W_IMG.filmstrip2, W_IMG.filmstrip3, W_IMG.filmstrip4, W_IMG.filmstrip5, W_IMG.filmstrip6, W_IMG.filmstrip7].map((src, i) => (
              <div key={i} style={{
                flex: "1 0 280px", height: 200,
                position: "relative",
              }}>
                <img src={src} alt=""
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    filter: "saturate(0.85) contrast(1.05) brightness(0.95)",
                  }} />
              </div>
            ))}
          </div>
          {/* film perforations */}
          <div style={{
            position: "absolute", top: 8, left: 0, right: 0,
            height: 8, display: "flex", gap: 16, padding: "0 24px",
            opacity: 0.4,
          }}>
            {Array.from({ length: 120 }).map((_, i) => (
              <div key={i} style={{ width: 12, height: 8, background: "var(--ivory)", flexShrink: 0 }} />
            ))}
          </div>
          <div style={{
            position: "absolute", bottom: 8, left: 0, right: 0,
            height: 8, display: "flex", gap: 16, padding: "0 24px",
            opacity: 0.4,
          }}>
            {Array.from({ length: 120 }).map((_, i) => (
              <div key={i} style={{ width: 12, height: 8, background: "var(--ivory)", flexShrink: 0 }} />
            ))}
          </div>
        </div>

        <div className="container" style={{ textAlign: "center", marginTop: 60 }}>
          <a href="#" style={{
            fontFamily: "var(--sans)", fontSize: 11,
            letterSpacing: "0.4em", textTransform: "uppercase",
            color: "var(--fg)",
            borderBottom: "1px solid var(--fg)",
            paddingBottom: 8,
          }}>
            {t("Voir le film", "Watch the film")} &nbsp;→
          </a>
        </div>
      </section>

      {/* DEVIS FUNNEL */}
      <section style={{ padding: "var(--section-y) 0", background: "var(--bg-alt)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel num="VI" label={t("Votre devis", "Your quote")} align="center" />
            <h2 style={{
              fontFamily: "var(--serif-display)",
              fontSize: "clamp(36px, 4.4vw, 56px)",
              fontWeight: 400, lineHeight: 1.1,
              margin: "32px auto 16px",
              color: "var(--fg)", maxWidth: 800,
            }}>
              {t(
                <>Construisons ensemble<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>votre journée.</em></>,
                <>Let's build<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>your day together.</em></>
              )}
            </h2>
            <p style={{
              fontFamily: "var(--serif)", fontStyle: "italic",
              fontSize: 17, fontWeight: 300, color: "var(--fg-muted)",
              maxWidth: 520, margin: "16px auto 0",
            }}>
              {t(
                "Quelques questions pour estimer votre devis en temps réel.",
                "A few questions to estimate your quote in real time."
              )}
            </p>
          </div>
          <DevisFunnel lang={lang} />
        </div>
      </section>

      {/* TESTIMONIALS — 2 stacked */}
      <section style={{ padding: "var(--section-y) 0", background: "var(--bg-deep)", color: "var(--fg-on-deep)" }}>
        <div className="container">
          <SectionLabel num="VII" label={t("Ce qu'ils en disent", "What they say")} align="center" />
          <div className="grid-testimonials" style={{ marginTop: 80 }}>
            {[
              {
                fr: "Je vous recommande vivement Antoine et Rémy qui ont parfaitement immortalisé notre mariage ! Les photos sont de très bonne qualité. Nous avons eu un vrai coup de cœur pour ces deux professionnels.",
                en: "I highly recommend Antoine and Rémy, who perfectly captured our wedding! The photos are of very high quality. We had a real love-at-first-sight feeling for these two professionals.",
                who: "Tatiana Q.", where: t("Mariage, juin 2024", "Wedding, June 2024"),
              },
              {
                fr: "Nous avons énormément apprécié notre collaboration avec Antoine et Rémi pour immortaliser le mariage de nos enfants : la gentillesse, la disponibilité, leur écoute, et bien sûr leur travail d'une très grande qualité. Nous referons appel à eux sans hésitation.",
                en: "We greatly appreciated working with Antoine and Rémi to capture our children's wedding: their kindness, availability, attentiveness, and of course their outstanding work. We will call on them again without hesitation.",
                who: "Pascale B.", where: t("Mariage, octobre 2024", "Wedding, October 2024"),
              },
              {
                fr: "Antoine et Rémi sont d'une extrême gentillesse, nos photos de mariage sont magnifiques, je les recommande et referai appel à eux pour de prochaines photos !",
                en: "Antoine and Rémi are extremely kind, our wedding photos are magnificent — I recommend them wholeheartedly and will call on them again!",
                who: "Maxime B.", where: t("Mariage, octobre 2024", "Wedding, October 2024"),
              },
            ].map((q, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "var(--serif-display)", fontSize: 56,
                  fontStyle: "italic", fontWeight: 300,
                  opacity: 0.5, lineHeight: 0.5, marginBottom: 24,
                }}>“</div>
                <p style={{
                  fontFamily: "var(--serif)", fontStyle: "italic",
                  fontSize: 24, lineHeight: 1.5, fontWeight: 300,
                  textWrap: "pretty",
                }}>{t(q.fr, q.en)}</p>
                <div style={{
                  fontFamily: "var(--sans)", fontSize: 11,
                  letterSpacing: "0.36em", textTransform: "uppercase",
                  marginTop: 24, opacity: 0.7,
                }}>
                  — {q.who} · {q.where}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "var(--section-y) 0", background: "var(--bg)" }}>
        <div className="container">
          <div style={{ maxWidth: 680 }}>
            <SectionLabel num="VIII" label={t("Écrire", "Write")} />
            <h2 style={{
              fontFamily: "var(--serif-display)",
              fontSize: "clamp(40px, 4.4vw, 64px)",
              fontWeight: 400, lineHeight: 1.05,
              margin: "32px 0 32px",
              color: "var(--fg)",
            }}>
              {t(
                <>Parlons de<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>votre projet.</em></>,
                <>Let's talk about<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>your project.</em></>
              )}
            </h2>
            <p style={{
              fontFamily: "var(--serif)", fontSize: 19,
              lineHeight: 1.7, fontWeight: 300, color: "var(--fg-muted)",
              marginBottom: 48, maxWidth: 520,
            }}>
              {t(
                "Écrivez-nous, nous répondons sous 48h. Ou appelez-nous — on prend toujours le temps d'un appel avant tout engagement.",
                "Write to us, we reply within 48h. Or call us — we always take the time for a call before any commitment."
              )}
            </p>
            <div className="grid-contact-info">
              <div>
                <div style={{ fontFamily: "var(--serif-display)", fontSize: 22, fontStyle: "italic", fontWeight: 300, marginBottom: 12 }}>Antoine</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 2, color: "var(--fg-muted)" }}>
                  <a href="tel:+33607720940" style={{ color: "inherit", textDecoration: "none" }}>06 07 72 09 40</a><br/>
                  <a href="mailto:antoine.ferrera@dfly.fr" style={{ color: "inherit", textDecoration: "none" }}>antoine.ferrera@dfly.fr</a>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--serif-display)", fontSize: 22, fontStyle: "italic", fontWeight: 300, marginBottom: 12 }}>Rémi</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 2, color: "var(--fg-muted)" }}>
                  <a href="tel:+33695402700" style={{ color: "inherit", textDecoration: "none" }}>06 95 40 27 00</a><br/>
                  <a href="mailto:remi.ferrera@dfly.fr" style={{ color: "inherit", textDecoration: "none" }}>remi.ferrera@dfly.fr</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}

function GridImg({ src, cols, rows, pos = "center", zoom = 1 }) {
  return (
    <div style={{ gridColumn: cols, gridRow: rows, overflow: "hidden" }}>
      <img src={src} alt="" style={{
        width: "100%", height: "100%",
        objectFit: "cover",
        objectPosition: pos,
        transform: `scale(${zoom})`,
        filter: "saturate(0.85) contrast(1.02)",
      }} />
    </div>
  );
}

function FormRow({ label, placeholder, type = "text" }) {
  return (
    <div className="form-row" style={{
      padding: "20px 0", borderBottom: "1px solid var(--line)",
      alignItems: "center",
    }}>
      <label style={{
        fontFamily: "var(--sans)", fontSize: 11,
        letterSpacing: "0.32em", textTransform: "uppercase",
        color: "var(--fg-muted)",
      }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        style={{
          border: "none", outline: "none", background: "transparent",
          fontFamily: "var(--serif)", fontSize: 18,
          fontWeight: 300, color: "var(--fg)",
          padding: "8px 0", width: "100%",
        }}
      />
    </div>
  );
}

export default Mariage;
