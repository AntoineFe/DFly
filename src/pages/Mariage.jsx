import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import SectionLabel from '../components/SectionLabel'

const BASE = import.meta.env.BASE_URL;
const W_IMG = {
  hero:        `${BASE}images/mariage/_7R41480.jpeg`,
  bride:       `${BASE}images/mariage/434_DSC8785.jpeg`,
  couple:      `${BASE}images/mariage/420b_7R41676.jpeg`,
  ceremony:    `${BASE}images/mariage/MAX_0035.jpeg`,
  bouquet:     `${BASE}images/mariage/409_7R49654.jpeg`,
  preparation: `${BASE}images/mariage/507__7R42870.jpeg`,
  dance:       `${BASE}images/mariage/467__DSC0477.jpeg`,
  details:     `${BASE}images/mariage/485__DSC0490.jpeg`,
  guests:      `${BASE}images/mariage/424_DSC8763.jpeg`,
  table:       `${BASE}images/mariage/_7R41267.jpeg`,
  aerial:      `${BASE}images/mariage/MAX_0011.jpeg`,
  filmstrip1:  `${BASE}images/mariage/_7R41266_1.jpeg`,
  filmstrip2:  `${BASE}images/mariage/_DSC7546.jpeg`,
  filmstrip3:  `${BASE}images/mariage/_DSC7838.jpeg`,
  filmstrip4:  `${BASE}images/mariage/423_7R44891_1.jpeg`,
  filmstrip5:  `${BASE}images/mariage/397_DSC0942.jpeg`,
  filmstrip6:  `${BASE}images/mariage/445_7R49749.jpeg`,
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
        <div style={{
          position: "absolute", top: 110, left: "var(--gutter)",
          fontFamily: "var(--sans)", fontSize: 11,
          letterSpacing: "0.4em", textTransform: "uppercase",
          opacity: 0.85,
        }}>
          {t("Domaine 01", "Field 01")}
        </div>
        <div style={{
          position: "absolute", top: 110, right: "var(--gutter)",
          fontFamily: "var(--sans)", fontSize: 11,
          letterSpacing: "0.4em", textTransform: "uppercase",
          opacity: 0.85,
        }}>
          {t('Provence Alpes Côte d\'Azur', 'Provence Alpes Côte d\'Azur')}
        </div>

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{
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
            <div style={{ maxWidth: 380, paddingBottom: 24 }}>
              <p style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 21, lineHeight: 1.6,
                fontWeight: 300,
                opacity: 0.92,
              }}>
                {t(
                  "Antoine et Rémi, père et fils. Tous deux photographes et vidéastes. Selon votre journée, nous intervenons à deux photographes, à deux caméramans, ou en duo photographe & vidéaste.",
                  "Antoine and Rémi, father and son. Both photographers and filmmakers. Depending on your day, we work as two photographers, two camera operators, or as a photographer-filmmaker duo."
                )}
              </p>
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
                  <>Vous nous confiez un jour qui ne se rejoue pas. Nous le filmons comme nous filmerions celui de notre <em style={{ fontStyle: "italic", fontWeight: 300 }}>propre famille</em> — avec sensibilité, à voix basse, sans rien forcer.</>,
                  <>You entrust us with a day that won't replay. We film it as we would film our own <em style={{ fontStyle: "italic", fontWeight: 300 }}>family's</em> — with sensitivity, in a low voice, forcing nothing.</>
                )}
              </p>
              <p style={{
                fontFamily: "var(--serif)",
                fontSize: 19, lineHeight: 1.75,
                fontWeight: 300,
                color: "var(--fg-muted)",
                maxWidth: 620,
                marginBottom: 24,
              }}>
                {t(
                  "Pas de séance posée interminable. Pas de figures imposées. Nous arrivons tôt, nous partons tard, et entre les deux nous attendons les regards qu'on n'attend pas. Le jour vous appartient. Notre travail est de le rendre visible plus tard.",
                  "No endless posed sessions. No required choreography. We arrive early, we leave late, and between the two we wait for the looks no one expects. The day is yours. Our work is to make it visible later."
                )}
              </p>
              <p style={{
                fontFamily: "var(--serif)",
                fontSize: 19, lineHeight: 1.75,
                fontWeight: 300,
                color: "var(--fg-muted)",
                maxWidth: 620,
              }}>
                {t(
                  "Nous travaillons en silence, à deux, depuis plusieurs années. C'est cette continuité — entre nous, et entre nous et vous — qui fait la matière des images.",
                  "We work in silence, the two of us, for years now. It is this continuity — between us, and between us and you — that gives the images their substance."
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
                    "Boîtiers plein-format, optiques fixes, lumière naturelle. Une livraison de 500 à 800 images traitées une à une, accessibles via une galerie privée et téléchargeables en haute définition.",
                    "Full-frame bodies, prime lenses, natural light. A delivery of 500 to 800 images, individually processed, available through a private gallery and downloadable in high definition."
                  )}
                </p>
                <div style={{
                  marginTop: 24,
                  display: "flex", gap: 16, flexWrap: "wrap",
                  fontFamily: "var(--sans)", fontSize: 10.5,
                  letterSpacing: "0.32em", textTransform: "uppercase",
                  color: "var(--fg-muted)",
                }}>
                  <span>500–800 images</span><span>·</span>
                  <span>Galerie privée</span><span>·</span>
                  <span>Livre photo en option</span>
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="medium-offset" style={{ paddingTop: 100 }}>
              <img src={W_IMG.couple} alt=""
                style={{
                  width: "100%", aspectRatio: "4/5", objectFit: "cover",
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
            <GridImg src={W_IMG.ceremony} cols="span 7" rows="span 4" />
            <GridImg src={W_IMG.bouquet} cols="span 5" rows="span 3" />
            <GridImg src={W_IMG.preparation} cols="span 5" rows="span 3" />
            <GridImg src={W_IMG.dance} cols="span 4" rows="span 3" />
            <GridImg src={W_IMG.details} cols="span 8" rows="span 3" />
            <GridImg src={W_IMG.guests} cols="span 5" rows="span 4" />
            <GridImg src={W_IMG.table} cols="span 7" rows="span 4" />
            <GridImg src={W_IMG.aerial} cols="span 12" rows="span 4" />
          </div>
        </div>
      </section>

      {/* TIMELINE — the day */}
      <section style={{ padding: "var(--section-y) 0", background: "var(--bg-alt)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel num="IV" label={t("Le déroulé", "The day, hour by hour")} align="center" />
            <h2 style={{
              fontFamily: "var(--serif-display)",
              fontSize: "clamp(36px, 4.4vw, 60px)",
              lineHeight: 1.1,
              fontWeight: 400,
              margin: "32px 0 0",
              color: "var(--fg)",
            }}>
              {t(
                <>Une journée filmée<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>de l'aube à la dernière danse.</em></>,
                <>A day filmed<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>from dawn to the last dance.</em></>
              )}
            </h2>
          </div>

          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            {[
              { time: "06h30", fr: "Préparatifs",  en: "Preparations",
                fr_d: "Les premiers gestes, la robe accrochée à la fenêtre, les mains qui tremblent un peu. Nous arrivons en silence.",
                en_d: "The first gestures, the dress hanging by the window, hands trembling slightly. We arrive in silence." },
              { time: "11h00", fr: "First look", en: "First look",
                fr_d: "Le moment que nous ne provoquons jamais. Nous reculons et laissons le temps faire son travail.",
                en_d: "The moment we never provoke. We step back and let time do its work." },
              { time: "14h30", fr: "Cérémonie", en: "Ceremony",
                fr_d: "Civile, religieuse, laïque — ce qui compte, ce sont les visages dans l'assistance.",
                en_d: "Civil, religious, secular — what matters are the faces in the audience." },
              { time: "17h00", fr: "Cocktail & portraits", en: "Cocktail & portraits",
                fr_d: "Les rires, les retrouvailles, les vingt minutes que nous volons aux mariés pour quelques portraits dans la lumière qui descend.",
                en_d: "The laughter, the reunions, the twenty minutes we steal for portraits in the falling light." },
              { time: "20h00", fr: "Dîner", en: "Dinner",
                fr_d: "Discours, larmes, tables qui s'animent. Nous tournons autour, nous attrapons les regards qu'on échange entre les rires.",
                en_d: "Speeches, tears, tables coming alive. We orbit, we catch the glances exchanged between laughs." },
              { time: "23h30", fr: "Ouverture & danse", en: "First dance & beyond",
                fr_d: "Lumières basses, son chaud. Nous restons jusqu'à ce que la piste se vide — c'est souvent là que se passent les images les plus tendres.",
                en_d: "Low lights, warm sound. We stay until the floor empties — that's often where the most tender images are made." },
            ].map((step, i) => (
              <div key={i} className="grid-timeline-row" style={{
                padding: "32px 0",
                borderTop: "1px solid var(--line)",
                borderBottom: i === 5 ? "1px solid var(--line)" : "none",
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
                    fontSize: 18, lineHeight: 1.65,
                    fontWeight: 300, fontStyle: "italic",
                    color: "var(--fg-muted)",
                    maxWidth: 620,
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
                flex: "0 0 auto",
                width: 280, height: 200,
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
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} style={{ width: 12, height: 8, background: "var(--ivory)", flexShrink: 0 }} />
            ))}
          </div>
          <div style={{
            position: "absolute", bottom: 8, left: 0, right: 0,
            height: 8, display: "flex", gap: 16, padding: "0 24px",
            opacity: 0.4,
          }}>
            {Array.from({ length: 60 }).map((_, i) => (
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

      {/* COLLECTIONS / pricing */}
      <section style={{ padding: "var(--section-y) 0", background: "var(--bg-alt)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel num="VI" label={t("Les collections", "The collections")} align="center" />
            <h2 style={{
              fontFamily: "var(--serif-display)",
              fontSize: "clamp(36px, 4.4vw, 56px)",
              fontWeight: 400, lineHeight: 1.1,
              margin: "32px auto 16px",
              color: "var(--fg)", maxWidth: 800,
            }}>
              {t(
                <>Trois formules,<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>la même exigence.</em></>,
                <>Three offerings,<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>the same standard.</em></>
              )}
            </h2>
            <p style={{
              fontFamily: "var(--serif)", fontStyle: "italic",
              fontSize: 17, fontWeight: 300, color: "var(--fg-muted)",
              maxWidth: 520, margin: "16px auto 0",
            }}>
              {t(
                "Chaque mariage est unique. Ce que vous lisez ci-dessous est une base que nous adaptons.",
                "Every wedding is unique. What you see below is a starting point we adapt."
              )}
            </p>
          </div>

          <div className="grid-collections">
            {[
              {
                name: t("Photographie", "Photography"),
                roman: "I",
                desc: t("Un photographe seul. Une journée pleine, en images.", "A photographer alone. A full day, in images."),
                price: t("dès 2 400 €", "from €2,400"),
                points: [
                  t("12 heures de couverture", "12 hours coverage"),
                  t("500 — 800 photos traitées", "500 — 800 retouched photos"),
                  t("Galerie privée HD", "Private HD gallery"),
                  t("Tirage album sur demande", "Album on request"),
                ],
              },
              {
                name: t("Photographie & Film", "Photography & Film"),
                roman: "II",
                desc: t("Un photographe et un vidéaste. Notre formule la plus demandée.", "One photographer and one filmmaker. Our most requested offering."),
                price: t("dès 4 200 €", "from €4,200"),
                points: [
                  t("Photo + vidéo journée complète", "Photo + film, full day"),
                  t("500 — 800 photos traitées", "500 — 800 retouched photos"),
                  t("Teaser 90 s + film 12 min", "90s teaser + 12-min film"),
                  t("Cérémonie intégrale", "Full ceremony"),
                  t("Color grading sur mesure", "Custom color grading"),
                ],
                highlighted: true,
              },
              {
                name: t("Signature", "Signature"),
                roman: "III",
                desc: t("Pour les jours qui s'étendent, et le ciel.", "For days that extend, and the sky."),
                price: t("sur devis", "on request"),
                points: [
                  t("Photographie & vidéo deux jours", "Photography & film, two days"),
                  t("Vues aériennes drone", "Aerial drone footage"),
                  t("Album baryté en édition limitée", "Limited edition baryta album"),
                  t("Film long format, 25 min", "Long-form film, 25 min"),
                  t("Captation son professionnel", "Professional sound capture"),
                ],
              },
            ].map((p, i) => (
              <div key={i} style={{
                padding: "60px 40px",
                borderRight: i < 2 ? "1px solid var(--line)" : "none",
                background: p.highlighted ? "var(--bg)" : "transparent",
                position: "relative",
              }}>
                {p.highlighted && (
                  <div style={{
                    position: "absolute", top: -1, left: 0, right: 0,
                    height: 3, background: "var(--sage)",
                  }} />
                )}
                <div className="num" style={{ marginBottom: 18 }}>— {p.roman}</div>
                <div style={{
                  fontFamily: "var(--serif-display)",
                  fontSize: 32, fontWeight: 400, lineHeight: 1.1,
                  marginBottom: 12, color: "var(--fg)",
                }}>{p.name}</div>
                <div style={{
                  fontFamily: "var(--serif)", fontStyle: "italic",
                  fontSize: 17, fontWeight: 300,
                  color: "var(--fg-muted)", marginBottom: 36, lineHeight: 1.5,
                }}>{p.desc}</div>

                <ul style={{
                  listStyle: "none", padding: 0, margin: "0 0 40px",
                  borderTop: "1px solid var(--line)",
                }}>
                  {p.points.map((pt, j) => (
                    <li key={j} style={{
                      padding: "14px 0",
                      borderBottom: "1px solid var(--line)",
                      fontFamily: "var(--serif)", fontSize: 17,
                      color: "var(--fg)", fontWeight: 300,
                      display: "flex", alignItems: "baseline", gap: 12,
                    }}>
                      <span style={{
                        fontFamily: "var(--serif)", fontStyle: "italic",
                        fontSize: 12, color: "var(--fg-muted)", flexShrink: 0,
                      }}>0{j+1}</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                <div style={{
                  fontFamily: "var(--serif-display)",
                  fontStyle: "italic",
                  fontSize: 24, fontWeight: 300,
                  color: "var(--fg)",
                }}>{p.price}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 60 }}>
            <a href="#contact" className="btn">
              {t("Demander un devis personnalisé", "Request a tailored quote")}
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — 2 stacked */}
      <section style={{ padding: "var(--section-y) 0", background: "var(--bg-deep)", color: "var(--fg-on-deep)" }}>
        <div className="container">
          <SectionLabel num="VII" label={t("Ce qu'ils en disent", "What they say")} align="center" />
          <div className="grid-testimonials" style={{ marginTop: 80 }}>
            {[
              {
                fr: "Nous avions peur d'un mariage envahi par les caméras. Antoine et Rémi ont été invisibles toute la journée. Le film qu'ils nous ont rendu — nous le regardons encore, deux ans plus tard.",
                en: "We feared a wedding invaded by cameras. Antoine and Rémi were invisible all day. The film they gave us — we still watch it, two years later.",
                who: "Camille & Étienne", where: t("Mariage à Gordes", "Wedding in Gordes"),
              },
              {
                fr: "Ils ont saisi des regards entre nos parents que nous n'avions pas vus. Ce sont devenus nos images préférées du jour.",
                en: "They captured glances between our parents we hadn't seen. They became our favorite images of the day.",
                who: "Anaïs & Pierre", where: t("Mariage à Lourmarin", "Wedding at Lourmarin"),
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
          <div className="grid-contact">
            <div>
              <SectionLabel num="VIII" label={t("Écrire", "Write")} />
              <h2 style={{
                fontFamily: "var(--serif-display)",
                fontSize: "clamp(40px, 4.4vw, 64px)",
                fontWeight: 400, lineHeight: 1.05,
                margin: "32px 0 32px",
                color: "var(--fg)",
              }}>
                {t(
                  <>Parlez-nous de<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>votre journée.</em></>,
                  <>Tell us about<br/><em style={{ fontStyle: "italic", fontWeight: 300 }}>your day.</em></>
                )}
              </h2>
              <p style={{
                fontFamily: "var(--serif)", fontSize: 19,
                lineHeight: 1.7, fontWeight: 300, color: "var(--fg-muted)",
                marginBottom: 40, maxWidth: 440,
              }}>
                {t(
                  "Quelques mots sur la date, le lieu, l'esprit que vous imaginez. Nous répondons sous 48 heures, et nous prenons le temps d'un appel avant tout engagement.",
                  "A few words about the date, the place, the spirit you imagine. We reply within 48 hours, and we take time for a call before any commitment."
                )}
              </p>
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 32 }}>
                <div className="eyebrow" style={{ color: "var(--fg-muted)", marginBottom: 18 }}>
                  {t("Joignables directement", "Reach us directly")}
                </div>
                <div className="grid-contact-info">
                  <div>
                    <div style={{ fontFamily: "var(--serif-display)", fontSize: 22, fontStyle: "italic", fontWeight: 300, marginBottom: 8 }}>Antoine</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.7, color: "var(--fg-muted)" }}>
                      06 07 72 09 40<br/>antoine.ferrera@dfly.fr
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--serif-display)", fontSize: 22, fontStyle: "italic", fontWeight: 300, marginBottom: 8 }}>Rémi</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.7, color: "var(--fg-muted)" }}>
                      06 95 40 27 00<br/>remi.ferrera@dfly.fr
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()} style={{
              borderTop: "1px solid var(--line)",
              paddingTop: 8,
            }}>
              <FormRow label={t("Vos prénoms", "Your first names")} placeholder={t("Camille & Étienne", "Camille & Étienne")} />
              <FormRow label={t("E-mail", "Email")} placeholder="vous@exemple.fr" type="email" />
              <FormRow label={t("Date du mariage", "Wedding date")} placeholder={t("12 juin 2026", "June 12, 2026")} />
              <FormRow label={t("Lieu", "Place")} placeholder={t("Domaine en Lubéron", "Estate in the Luberon")} />
              <div className="form-row" style={{
                padding: "20px 0", borderBottom: "1px solid var(--line)",
              }}>
                <label style={{
                  fontFamily: "var(--sans)", fontSize: 11,
                  letterSpacing: "0.32em", textTransform: "uppercase",
                  color: "var(--fg-muted)", paddingTop: 8,
                }}>{t("Quelques mots", "A few words")}</label>
                <textarea
                  rows={5}
                  placeholder={t("L'esprit, l'ambiance que vous imaginez…", "The spirit, the mood you imagine…")}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontFamily: "var(--serif)", fontSize: 17,
                    fontWeight: 300, color: "var(--fg)",
                    resize: "vertical", width: "100%",
                  }}
                />
              </div>
              <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="eyebrow" style={{ color: "var(--fg-muted)" }}>
                  {t("Réponse sous 48h", "Reply within 48h")}
                </div>
                <button type="submit" className="btn btn-solid">
                  {t("Envoyer le message", "Send message")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}

function GridImg({ src, cols, rows }) {
  return (
    <div style={{ gridColumn: cols, gridRow: rows, overflow: "hidden" }}>
      <img src={src} alt="" style={{
        width: "100%", height: "100%", objectFit: "cover",
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
