// DFly — Shared components
// Exposed on window for cross-script use.

const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────────
// Monogram — the "D" stylized as a drone (echo of the business card).
// Two propellers above the D, simple, refined.
// ─────────────────────────────────────────────────────────────────
function DflyMonogram({ size = 56, color = "currentColor", stroke = 1.6 }) {
  // Real logo from the business card. CSS filter inverts to white when needed.
  const isLight = color !== "currentColor" && (
    color.includes("ivory") || color.includes("243,237,226") || color === "white" || color === "#fff"
  );
  return (
    <img
      src="assets/dfly-logo.png"
      alt="DFly"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        filter: isLight ? "invert(1) brightness(1.05)" : "none",
      }}
    />
  );
}

// Wordmark — display style for hero cartouche
function DflyWordmark({ tagline = true, color = "currentColor" }) {
  return (
    <div style={{ textAlign: "center", color }}>
      <div style={{
        fontFamily: "var(--serif-display)",
        fontSize: "clamp(72px, 9vw, 140px)",
        lineHeight: 0.9,
        letterSpacing: "0.01em",
        fontWeight: 400,
      }}>
        D<span style={{ fontStyle: "italic", fontWeight: 300 }}>Fly</span>
      </div>
      {tagline && (
        <div style={{
          fontFamily: "var(--sans)",
          fontSize: 11,
          letterSpacing: "0.5em",
          textTransform: "uppercase",
          marginTop: 18,
          paddingLeft: "0.5em",
        }}>
          Photographie · Vidéo
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Cartouche — the elegant arched frame (Ladies & Gentleman echo)
// Used around the hero wordmark.
// ─────────────────────────────────────────────────────────────────
function Cartouche({ children, color = "currentColor", width = 560, height = 720 }) {
  return (
    <div style={{ position: "relative", width, height, maxWidth: "90vw" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        preserveAspectRatio="none"
      >
        <path
          d={`M ${width/2} 8
              C ${width*0.25} 8, 8 ${height*0.08}, 8 ${height*0.18}
              L 8 ${height - 60}
              C 8 ${height - 20}, 40 ${height - 8}, ${width/2} ${height - 8}
              C ${width - 40} ${height - 8}, ${width - 8} ${height - 20}, ${width - 8} ${height - 60}
              L ${width - 8} ${height*0.18}
              C ${width - 8} ${height*0.08}, ${width*0.75} 8, ${width/2} 8 Z`}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.55"
        />
        {/* Inner double line */}
        <path
          d={`M ${width/2} 18
              C ${width*0.27} 18, 18 ${height*0.09}, 18 ${height*0.19}
              L 18 ${height - 62}
              C 18 ${height - 26}, 46 ${height - 18}, ${width/2} ${height - 18}
              C ${width - 46} ${height - 18}, ${width - 18} ${height - 26}, ${width - 18} ${height - 62}
              L ${width - 18} ${height*0.19}
              C ${width - 18} ${height*0.09}, ${width*0.73} 18, ${width/2} 18 Z`}
          fill="none"
          stroke={color}
          strokeWidth="0.6"
          opacity="0.35"
        />
      </svg>
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 40px",
        textAlign: "center",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Top navigation
// ─────────────────────────────────────────────────────────────────
function TopNav({ active = "home", scheme = "light", lang = "FR", setLang }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { id: "home", label: lang === "FR" ? "Accueil" : "Home", href: "DFly.html" },
    { id: "wedding", label: lang === "FR" ? "Mariage" : "Wedding", href: "Mariage.html" },
    { id: "real-estate", label: lang === "FR" ? "Immobilier" : "Real Estate", href: "#" },
    { id: "stage", label: lang === "FR" ? "Spectacle" : "Stage", href: "#" },
    { id: "events", label: lang === "FR" ? "Événements" : "Events", href: "#" },
    { id: "family", label: lang === "FR" ? "Famille" : "Family", href: "#" },
  ];

  const isOverHero = scheme === "over-hero" && !scrolled;
  const tone = isOverHero ? "rgba(243,237,226,0.95)" : "var(--fg)";
  const bg = isOverHero ? "transparent" : "var(--bg)";
  const border = isOverHero ? "rgba(243,237,226,0.18)" : "var(--line)";

  return (
    <header style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 100,
      background: bg,
      backdropFilter: scrolled ? "blur(10px)" : "none",
      borderBottom: `1px solid ${border}`,
      transition: "background .35s ease, border-color .35s ease",
      color: tone,
    }}>
      <div style={{
        maxWidth: "var(--maxw)",
        margin: "0 auto",
        padding: "16px var(--gutter)",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 24,
      }}>
        {/* Left: monogram + name */}
        <a href="DFly.html" style={{ display: "flex", alignItems: "center", gap: 14, color: tone }}>
          <DflyMonogram size={32} color={tone} stroke={1.2} />
          <div>
            <div style={{
              fontFamily: "var(--serif-display)",
              fontSize: 24,
              lineHeight: 1,
              letterSpacing: "0.01em",
            }}>D<span style={{ fontStyle: "italic", fontWeight: 300 }}>Fly</span></div>
            <div style={{
              fontFamily: "var(--sans)",
              fontSize: 8.5,
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              marginTop: 3,
              opacity: 0.75,
            }}>Photographie · Vidéo</div>
          </div>
        </a>

        {/* Center: links */}
        <nav style={{
          display: "flex",
          gap: 28,
          alignItems: "center",
          fontFamily: "var(--sans)",
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
        }}>
          {links.map((l, i) => (
            <a key={l.id} href={l.href} style={{
              color: tone,
              opacity: active === l.id ? 1 : 0.72,
              borderBottom: active === l.id ? `1px solid ${tone}` : "1px solid transparent",
              paddingBottom: 4,
              transition: "opacity .2s ease, border-color .2s ease",
            }}>{l.label}</a>
          ))}
        </nav>

        {/* Right: lang + contact */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 18 }}>
          <div style={{
            fontFamily: "var(--sans)",
            fontSize: 11,
            letterSpacing: "0.24em",
            display: "flex",
            gap: 10,
          }}>
            <button
              onClick={() => setLang && setLang("FR")}
              style={{
                background: "none", border: "none", padding: 0,
                color: tone, opacity: lang === "FR" ? 1 : 0.5,
                cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit",
              }}>FR</button>
            <span style={{ opacity: 0.4 }}>·</span>
            <button
              onClick={() => setLang && setLang("EN")}
              style={{
                background: "none", border: "none", padding: 0,
                color: tone, opacity: lang === "EN" ? 1 : 0.5,
                cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit",
              }}>EN</button>
          </div>
          <a href="#contact" style={{
            fontFamily: "var(--sans)",
            fontSize: 10.5,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            border: `1px solid ${tone}`,
            padding: "10px 18px",
            color: tone,
          }}>{lang === "FR" ? "Contact" : "Contact"}</a>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────
function Footer({ lang = "FR" }) {
  const t = (fr, en) => lang === "FR" ? fr : en;
  return (
    <footer style={{
      background: "var(--bg-deep)",
      color: "var(--fg-on-deep)",
      paddingTop: 100,
      paddingBottom: 40,
    }}>
      <div className="container">
        <div style={{
          textAlign: "center",
          paddingBottom: 80,
          borderBottom: "1px solid rgba(243,237,226,0.18)",
        }}>
          <DflyMonogram size={48} color="rgba(243,237,226,0.9)" stroke={1.2} />
          <div style={{
            fontFamily: "var(--serif-display)",
            fontSize: "clamp(40px, 5vw, 64px)",
            fontStyle: "italic",
            fontWeight: 300,
            marginTop: 24,
            letterSpacing: "0.01em",
          }}>
            {t("Parlons de votre projet", "Let's talk about your project")}
          </div>
          <div style={{
            fontFamily: "var(--sans)",
            fontSize: 12,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            marginTop: 16,
            opacity: 0.7,
          }}>
            {t("Réponse sous 48 heures", "Reply within 48 hours")}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
          gap: 60,
          paddingTop: 80,
          paddingBottom: 80,
        }}>
          <div>
            <div style={{ fontFamily: "var(--serif-display)", fontSize: 32, marginBottom: 18 }}>
              D<span style={{ fontStyle: "italic", fontWeight: 300 }}>Fly</span>
            </div>
            <p style={{
              fontFamily: "var(--serif)",
              fontSize: 15,
              lineHeight: 1.7,
              color: "rgba(243,237,226,0.75)",
              fontStyle: "italic",
              fontWeight: 300,
              maxWidth: 320,
            }}>
              {t(
                "Antoine & Rémi Ferrera. Père et fils, photographes et vidéastes basés en Provence.",
                "Antoine & Rémi Ferrera. Father and son — photographers and filmmakers based in Provence."
              )}
            </p>
          </div>

          <div>
            <div className="eyebrow" style={{ opacity: 0.6, marginBottom: 18 }}>Antoine</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.8 }}>
              06 07 72 09 40<br />
              <a href="mailto:antoine.ferrera@dfly.fr" style={{ borderBottom: "1px solid rgba(243,237,226,0.4)" }}>
                antoine.ferrera@dfly.fr
              </a>
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ opacity: 0.6, marginBottom: 18 }}>Rémi</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.8 }}>
              06 95 40 27 00<br />
              <a href="mailto:remi.ferrera@dfly.fr" style={{ borderBottom: "1px solid rgba(243,237,226,0.4)" }}>
                remi.ferrera@dfly.fr
              </a>
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ opacity: 0.6, marginBottom: 18 }}>{t("Suivre", "Follow")}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.8 }}>
              <a href="#" style={{ display: "block" }}>Instagram</a>
              <a href="#" style={{ display: "block" }}>Vimeo</a>
              <a href="#" style={{ display: "block" }}>Pinterest</a>
            </div>
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--sans)",
          fontSize: 10.5,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          opacity: 0.55,
        }}>
          <span>© {new Date().getFullYear()} DFly — Tous droits réservés</span>
          <span>Pilote drone certifié · DGAC</span>
          <span>dfly.fr</span>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section header — numbered, editorial
// ─────────────────────────────────────────────────────────────────
function SectionLabel({ num, label, align = "left" }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      flexWrap: "nowrap",
      whiteSpace: "nowrap",
      justifyContent: align === "center" ? "center" : "flex-start",
      fontFamily: "var(--sans)",
      fontSize: 11,
      letterSpacing: "0.36em",
      textTransform: "uppercase",
      color: "var(--fg-muted)",
    }}>
      <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", letterSpacing: "0.02em", textTransform: "none", fontSize: 14 }}>— {num}</span>
      <span>{label}</span>
    </div>
  );
}

Object.assign(window, {
  DflyMonogram, DflyWordmark, Cartouche,
  TopNav, Footer, SectionLabel,
});
