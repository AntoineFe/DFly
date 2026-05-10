import { useState, useEffect, useRef } from "react";

// ── Config ────────────────────────────────────────────────────────────────────

const CAGNES = { lat: 43.6646, lng: 7.1579 };
const KM_RATE = 0.697;
const FULL_DAY_H = 13.5;
const REAL_DAY_H = 16;
const BASE_HT = 0;
const PP_PHOTO_HT = 1200;
const PP_VIDEO_HT = 2000;
const CAPTATION_DAY_HT = 400; // par prestataire par jour
const HOTEL_TTC = 120;

const MOMENTS = [
  { id: "preparatifs", label: "Préparatifs",                       en: "Getting ready",                       h: 2   },
  { id: "mairie",      label: "Mairie",                            en: "Civil ceremony",                      h: 1   },
  { id: "ceremonie",   label: "Cérémonie religieuse ou laïque",    en: "Religious or civil ceremony",         h: 1.5 },
  { id: "groupes",     label: "Photos de groupes",                 en: "Group photos",                        h: 0.5 },
  { id: "couple",      label: "Photos de couple",                  en: "Couple portraits",                    h: 0.5 },
  { id: "cocktail",    label: "Cocktail / Vin d'honneur",          en: "Cocktail hour", opts: [
    { v: "complet", label: "Couverture complète",          en: "Full coverage",        h: 2   },
    { v: "debut",   label: "Jusqu'au début seulement",     en: "Beginning only",       h: 0.5 },
  ]},
  { id: "diner",       label: "Dîner",                             en: "Reception dinner", opts: [
    { v: "complet", label: "Jusqu'au gâteau",                      en: "Until the cake",               h: 3 },
    { v: "debut",   label: "Installation et groupes seulement",    en: "Setup and group photos only",  h: 1 },
  ]},
  { id: "danse",       label: "Soirée / Danse",                    en: "Evening / Dancing", opts: [
    { v: "etendue",  label: "Jusqu'au bout de la nuit",            en: "Extended evening",             h: 3   },
    { v: "standard", label: "Début des danses · 30 min",            en: "Start of dancing · 30 min",    h: 1.5 },
  ]},
];

const MOMENT_IDS = MOMENTS.map(m => m.id);

const EXTRAS = [
  { id: "engagement", label: "Séance d'engagement",  en: "Engagement session", note: "à partir de 200 €", noteEn: "from €200" },
  { id: "trash",      label: "Trash the dress",       en: "Trash the dress",    note: "à partir de 200 €", noteEn: "from €200" },
];

// ── i18n helper ───────────────────────────────────────────────────────────────

const mkT = (lang) => (fr, en) => lang === "EN" ? en : fr;
const mLabel = (m, lang) => lang === "EN" ? (m.en || m.label) : m.label;

// ── Pricing ───────────────────────────────────────────────────────────────────

function totalHours(moments) {
  return MOMENTS.reduce((acc, m) => {
    if (!moments[m.id]) return acc;
    if (m.opts) {
      const o = m.opts.find(o => o.v === moments[m.id]);
      return acc + (o ? o.h : 0);
    }
    return acc + m.h;
  }, 0);
}

// Taux de post-production HT par heure
const PP_RATE_HT = {
  photo: PP_PHOTO_HT / FULL_DAY_H,
  video: PP_VIDEO_HT / FULL_DAY_H,
  both:  (PP_PHOTO_HT + PP_VIDEO_HT) / FULL_DAY_H,
};

// Captation : paliers × 2 prestataires × 400€/jour/presta
function oldCaptationHT(h) {
  if (h <= 4)  return 0.5 * CAPTATION_DAY_HT * 2;
  if (h <= 10) return 1.0 * CAPTATION_DAY_HT * 2;
  return             1.5 * CAPTATION_DAY_HT * 2;
}
function captationHT(h) {
  if (h <= 3)  return 0.33 * CAPTATION_DAY_HT * 2;
  return              0.33 * CAPTATION_DAY_HT * 2 + ((h-3) / 5) * 0.67 * CAPTATION_DAY_HT * 2;
}

function calcPrice(state) {
  const activeH  = totalHours(state.moments);
  const displayH = Math.round(activeH * (REAL_DAY_H / FULL_DAY_H) * 10) / 10;
  const fmt = state.format === "both" ? "both" : state.format;
  const ppRate = PP_RATE_HT[fmt] ?? PP_RATE_HT.photo;

  let totalHT = BASE_HT + activeH * ppRate + (activeH > 0 ? captationHT(activeH) : 0);

  if (state.format !== "photo") {
    if (state.teaser)   totalHT += 700 / 1.2;
    if (state.integral) totalHT += 500 / 1.2;
  }
  if (state.drone) totalHT += 200 / 1.2;

  return { h: displayH, ttc: Math.round(totalHT * 1.2 / 10) * 10 };
}

// ── Geocoding + routing ───────────────────────────────────────────────────────

async function geocode(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const r = await fetch(url, { headers: { "User-Agent": "DFly-Devis/1.0" } });
    const d = await r.json();
    if (d[0]) return { lat: +d[0].lat, lng: +d[0].lon };
  } catch {}
  return null;
}

function resolveCoords(id, lieux) {
  const loc = lieux[id];
  if (!loc) return null;
  if (loc.sameAs) return resolveCoords(loc.sameAs, lieux);
  return loc.coords || null;
}

async function calcTravel(lieux, moments) {
  const venues = [];
  for (const id of MOMENT_IDS) {
    if (!moments[id]) continue;
    const coords = resolveCoords(id, lieux);
    if (!coords) continue;
    const last = venues[venues.length - 1];
    if (!last || last.lat !== coords.lat || last.lng !== coords.lng) {
      venues.push(coords);
    }
  }
  if (!venues.length) return { km: 0, cost: 0 };

  const waypoints = [CAGNES, ...venues, CAGNES];
  const coordStr  = waypoints.map(c => `${c.lng},${c.lat}`).join(";");
  try {
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=false`);
    const d = await r.json();
    if (d.routes?.[0]) {
      const km   = Math.round(d.routes[0].distance / 1000);
      const cost = Math.round(km * KM_RATE);
      return { km, cost };
    }
  } catch {}
  return { km: 0, cost: 0 };
}

// ── Formatters ────────────────────────────────────────────────────────────────

const eur = v => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

function formatLabel(state, lang = "FR") {
  if (state.format === "photo") return lang === "EN" ? "Photo" : "Photo";
  if (state.format === "video") return lang === "EN" ? "Video" : "Vidéo";
  return "Photo + Vidéo";
}

function momentsSummary(moments, lang = "FR") {
  return MOMENTS
    .filter(m => moments[m.id])
    .map(m => {
      if (m.opts) {
        const o = m.opts.find(o => o.v === moments[m.id]);
        return o ? mLabel(o, lang) : mLabel(m, lang);
      }
      return mLabel(m, lang);
    })
    .join(", ");
}

// ── Step components ───────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "1px solid var(--line)", background: "var(--bg)",
  color: "var(--fg)", fontSize: 15, fontFamily: "inherit",
  boxSizing: "border-box",
};

function StepMoments({ state, set, lang }) {
  const t = mkT(lang);
  const { moments, extras } = state;

  function toggleSimple(id) {
    const next = { ...moments };
    if (next[id]) delete next[id]; else next[id] = true;
    set("moments", next);
  }

  function selectOpt(id, v) {
    const next = { ...moments };
    if (next[id] === v) delete next[id]; else next[id] = v;
    set("moments", next);
  }

  return (
    <div>
      <h3 style={{ marginBottom: 8, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        {t("Quels moments souhaitez-vous nous confier ?", "Which moments would you like us to cover?")}
      </h3>
      <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 36 }}>
        {t("Sélectionnez tous les moments qui vous intéressent.", "Select all the moments you'd like covered.")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {MOMENTS.map((m, i) => (
          <div key={m.id} style={{ borderTop: i === 0 ? "1px solid var(--line)" : "none", borderBottom: "1px solid var(--line)" }}>
            {m.opts ? (
              <div style={{ padding: "16px 0" }}>
                <div style={{ fontWeight: 500, marginBottom: 12, color: "var(--fg)" }}>{mLabel(m, lang)}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 4 }}>
                  {m.opts.map(opt => (
                    <label key={opt.v} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "var(--fg)", fontSize: 15 }}>
                      <input
                        type="radio" name={m.id}
                        checked={moments[m.id] === opt.v}
                        onChange={() => selectOpt(m.id, opt.v)}
                      />
                      {mLabel(opt, lang)}
                    </label>
                  ))}
                  {moments[m.id] === "etendue" && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)", paddingLeft: 4 }}>
                      <div style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 8 }}>
                        {t("Hébergement des prestataires", "Accommodation for photographers")}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "var(--fg)", fontSize: 15 }}>
                          <input type="radio" name="hotel" checked={!state.hotelPrisEnCharge}
                            onChange={() => set("hotelPrisEnCharge", false)} />
                          {t(`Forfait hôtelier : +${eur(HOTEL_TTC)}`, `Hotel allowance: +${eur(HOTEL_TTC)}`)}
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "var(--fg)", fontSize: 15 }}>
                          <input type="radio" name="hotel" checked={!!state.hotelPrisEnCharge}
                            onChange={() => set("hotelPrisEnCharge", true)} />
                          {t("Pris en charge par les mariés", "Covered by the couple")}
                        </label>
                      </div>
                    </div>
                  )}
                  {moments[m.id] && (
                    <button
                      onClick={() => { const n = { ...moments }; delete n[m.id]; set("moments", n); }}
                      style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--fg-muted)", fontSize: 12, cursor: "pointer", padding: 0, marginTop: 4 }}
                    >
                      {t("Retirer", "Remove")}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", cursor: "pointer" }}>
                <input type="checkbox" checked={!!moments[m.id]} onChange={() => toggleSimple(m.id)} />
                <span style={{ fontWeight: 500, color: "var(--fg)", fontSize: 15 }}>{mLabel(m, lang)}</span>
              </label>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36 }}>
        <div style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 14 }}>
          {t("Prestations complémentaires (avant ou après le mariage)", "Additional services (before or after the wedding)")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {EXTRAS.map(e => (
            <label key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!extras[e.id]}
                onChange={() => set("extras", { ...extras, [e.id]: !extras[e.id] })}
              />
              <span style={{ fontSize: 15, color: "var(--fg)" }}>{mLabel(e, lang)}</span>
              <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>{lang === "EN" ? e.noteEn : e.note}</span>
            </label>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!extras.autreChecked}
              onChange={() => set("extras", { ...extras, autreChecked: !extras.autreChecked, autre: "" })}
            />
            <span style={{ fontSize: 15, color: "var(--fg)" }}>{t("Autre", "Other")}</span>
          </label>
          {extras.autreChecked && (
            <input
              type="text"
              placeholder={t("Précisez...", "Please specify...")}
              value={extras.autre || ""}
              onChange={e => set("extras", { ...extras, autre: e.target.value })}
              style={{ ...inputStyle, marginLeft: 24, width: "calc(100% - 24px)" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StepDate({ state, set, lang }) {
  const t = mkT(lang);
  const { dates } = state;
  const upd = patch => set("dates", { ...dates, ...patch });

  return (
    <div>
      <h3 style={{ marginBottom: 36, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        {t("Avez-vous fixé une date ?", "Have you set a date?")}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={!!dates.noDate} onChange={e => upd({ noDate: e.target.checked, main: "" })} />
          <span style={{ color: "var(--fg)" }}>{t("Date non encore fixée", "Date not yet set")}</span>
        </label>

        {!dates.noDate && (
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500, color: "var(--fg)" }}>{t("Date du mariage", "Wedding date")}</div>
            <input type="date" value={dates.main} onChange={e => upd({ main: e.target.value })}
              style={{ ...inputStyle, width: "auto" }} />
          </div>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={!!dates.diffMairie} onChange={e => upd({ diffMairie: e.target.checked })} />
          <span style={{ color: "var(--fg)" }}>{t("La mairie se déroule à une date différente", "The civil ceremony takes place on a different date")}</span>
        </label>

        {dates.diffMairie && (
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500, color: "var(--fg)" }}>{t("Date de la mairie", "Civil ceremony date")}</div>
            <input type="date" value={dates.mairie} onChange={e => upd({ mairie: e.target.value })}
              style={{ ...inputStyle, width: "auto" }} />
          </div>
        )}
      </div>
    </div>
  );
}

async function mapboxSuggest(query) {
  if (!query || query.length < 2) return [];
  try {
    const url = `${import.meta.env.BASE_URL}services/mapbox-suggest.php?q=${encodeURIComponent(query)}`;
    const r = await fetch(url);
    return await r.json();
  } catch { return []; }
}

function AddressInput({ id, loc, setAddress, setLoc, lang }) {
  const t = mkT(lang);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounce = useRef(null);

  function handleChange(val) {
    setAddress(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const s = await mapboxSuggest(val);
      setSuggestions(s);
      setOpen(s.length > 0);
    }, 300);
  }

  function handleSelect(s) {
    setLoc(s.label, s.coords);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <input
        type="text"
        placeholder={t("Nom du lieu ou adresse complète...", "Venue name or full address...")}
        value={loc.address || ""}
        onChange={e => handleChange(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        style={inputStyle}
        autoComplete="off"
      />
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "var(--bg)", border: "1px solid var(--line)", borderTop: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          {suggestions.map((s, i) => (
            <div key={i} onMouseDown={() => handleSelect(s)} style={{
              padding: "10px 14px", cursor: "pointer", fontSize: 14, color: "var(--fg)",
              borderBottom: i < suggestions.length - 1 ? "1px solid var(--line)" : "none",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepLieux({ state, set, lang }) {
  const t = mkT(lang);
  const { moments, lieux } = state;

  const activeMoments = MOMENTS.filter(m => !!moments[m.id]);

  function setAddress(id, address) {
    set("lieux", { ...lieux, [id]: { ...lieux[id], address, coords: null } });
  }

  function setLoc(id, address, coords) {
    set("lieux", { ...lieux, [id]: { ...lieux[id], address, coords } });
  }

  function setSameAs(id, sameAs) {
    if (sameAs) set("lieux", { ...lieux, [id]: { sameAs } });
    else set("lieux", { ...lieux, [id]: { address: "", coords: null } });
  }

  return (
    <div>
      <h3 style={{ marginBottom: 8, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        {t("Où se déroulent vos événements ?", "Where will your events take place?")}
      </h3>
      <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 36 }}>
        {t("Adresse complète — pour le calcul des déplacements et le repérage des lieux.", "Full address — for travel cost calculation and venue scouting.")}
      </p>

      {activeMoments.length === 0 && (
        <p style={{ color: "var(--fg-muted)" }}>{t("Aucun moment sélectionné à l'étape précédente.", "No moments selected in the previous step.")}</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {activeMoments.map((m, idx) => {
          const loc = lieux[m.id] || {};
          const prevMoments = activeMoments.slice(0, idx);
          const hasOk = loc.sameAs || loc.coords;

          return (
            <div key={m.id} style={{ paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: "var(--fg)" }}>{mLabel(m, lang)}</span>
                {hasOk && <span style={{ color: "var(--sage)", fontSize: 13 }}>✓</span>}
              </div>

              {prevMoments.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <select
                    value={loc.sameAs || ""}
                    onChange={e => setSameAs(m.id, e.target.value)}
                    style={{ ...inputStyle, width: "auto", marginBottom: 4 }}
                  >
                    <option value="">{t("Lieu différent", "Different venue")}</option>
                    {prevMoments.map(p => (
                      <option key={p.id} value={p.id}>{t("Même lieu que : ", "Same venue as: ")}{mLabel(p, lang)}</option>
                    ))}
                  </select>
                </div>
              )}

              {!loc.sameAs && (
                <AddressInput
                  id={m.id}
                  loc={loc}
                  setAddress={v => setAddress(m.id, v)}
                  setLoc={(address, coords) => setLoc(m.id, address, coords)}
                  lang={lang}
                />
              )}
              {!loc.sameAs && !loc.coords && (
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 6, fontStyle: "italic" }}>
                  {t("Si le lieu n'est pas reconnu, saisissez la commune — ex : Cros de Cagnes.", "If the venue isn't found, enter the town name.")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepFormat({ state, set, lang }) {
  const t = mkT(lang);

  const FORMAT_OPTS = [
    { v: "photo", label: t("Photo uniquement",  "Photo only"),   desc: t("Des images fixes, pour (re)voir chaque instant.", "Still images to (re)live every moment.") },
    { v: "video", label: t("Vidéo uniquement",  "Video only"),   desc: t("La journée en mouvement — voix, musique, émotions. Micro-cravate fourni.", "The day in motion — voices, music, emotions. Lapel mic included.") },
    { v: "both",  label: "Photo + Vidéo",                         desc: t("Le choix de la plupart de nos mariés. Rien ne manque.", "The choice of most of our couples. Nothing is missed."), recommended: true },
  ];

  const FILM_OPTS = [
    { key: "teaser",   label: t("Teaser — 2 à 5 min",  "Teaser — 2 to 5 min"),
      desc: t("Les émotions dans un résumé à partager", "The emotions in a shareable highlight"), price: "+700 €" },
    { key: "integral", label: t("Intégral — 1h+", "Full version — 1h+"),
      desc: t("Parce que certains jours, vous voudrez revivre chaque moment comme si vous y étiez", "Because some days, you'll want to relive every moment as if you were there"), price: "+500 €" },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: 8, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        {t("Comment souhaitez-vous revivre cette journée dans dix ans ?", "How would you like to relive this day in ten years?")}
      </h3>
      <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 36 }}>
        {t("Choisissez ce qui vous ressemble.", "Choose what suits you.")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
        {FORMAT_OPTS.map(opt => (
          <label key={opt.v} style={{
            display: "flex", gap: 16, padding: "18px 20px", cursor: "pointer",
            border: `2px solid ${state.format === opt.v ? "var(--fg)" : "var(--line)"}`,
            transition: "border-color .15s",
          }}>
            <input type="radio" name="format" checked={state.format === opt.v}
              onChange={() => set("format", opt.v)} style={{ marginTop: 3, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: "var(--fg)", marginBottom: 2 }}>
                {opt.label}
                {opt.recommended && <span style={{ marginLeft: 10, fontSize: 12, color: "var(--fg-muted)", fontWeight: 400 }}>{t("recommandé", "recommended")}</span>}
              </div>
              <div style={{ fontSize: 14, color: "var(--fg-muted)" }}>{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>

      {state.format !== "photo" && (
        <div style={{ padding: "24px", background: "var(--bg-alt)", border: "1px solid var(--line)" }}>
          <div style={{ fontWeight: 600, color: "var(--fg)", marginBottom: 16 }}>{t("Format du film", "Film format")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--line)", opacity: 0.7 }}>
              <input type="checkbox" checked disabled style={{ marginTop: 3, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, color: "var(--fg)" }}>{t("Film — 20 à 40 min", "Film — 20 to 40 min")}</div>
                <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{t("L'histoire de votre journée", "The story of your day")}</div>
              </div>
              <div style={{ color: "var(--fg-muted)", fontSize: 13, whiteSpace: "nowrap" }}>{t("inclus", "included")}</div>
            </div>

            {FILM_OPTS.map(opt => (
              <label key={opt.key} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
                <input type="checkbox" checked={!!state[opt.key]}
                  onChange={() => set(opt.key, !state[opt.key])} style={{ marginTop: 3, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: "var(--fg)" }}>{opt.label}</div>
                  <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{opt.desc}</div>
                </div>
                <div style={{ color: "var(--fg-muted)", fontSize: 13, whiteSpace: "nowrap" }}>{opt.price}</div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepDrone({ state, set, lang }) {
  const t = mkT(lang);

  const DRONE_OPTS = [
    { v: true,  label: t("Oui", "Yes"), desc: t("Vues aériennes du lieu, des invités, de la cérémonie. +200 €", "Aerial views of the venue, guests, and ceremony. +€200") },
    { v: false, label: t("Non", "No"),  desc: null },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: 36, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        {t("Souhaitez-vous des prises de vue par drone ?", "Would you like aerial drone footage?")}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {DRONE_OPTS.map(opt => (
          <label key={String(opt.v)} style={{
            display: "flex", gap: 16, padding: "18px 20px", cursor: "pointer",
            border: `2px solid ${state.drone === opt.v ? "var(--fg)" : "var(--line)"}`,
            transition: "border-color .15s",
          }}>
            <input type="radio" name="drone" checked={state.drone === opt.v}
              onChange={() => set("drone", opt.v)} style={{ marginTop: 3, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: "var(--fg)" }}>{opt.label}</div>
              {opt.desc && <div style={{ fontSize: 14, color: "var(--fg-muted)" }}>{opt.desc}</div>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function StepDemandes({ state, set, lang }) {
  const t = mkT(lang);

  return (
    <div>
      <h3 style={{ marginBottom: 8, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        {t("Des éléments particuliers à nous signaler ?", "Anything specific we should know?")}
      </h3>
      <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 36 }}>
        {t(
          "Contraintes de lieu, moments importants, demandes spécifiques — tout ce qui nous aide à préparer un devis juste.",
          "Venue constraints, important moments, specific requests — anything that helps us prepare an accurate quote."
        )}
      </p>
      <textarea
        value={state.demandes}
        onChange={e => set("demandes", e.target.value)}
        placeholder={t(
          "Ex : cérémonie en extérieur, discours surprise des témoins, liste de personnes à ne pas manquer…",
          "e.g. outdoor ceremony, surprise speech, list of people not to miss…"
        )}
        rows={5}
        style={{ ...inputStyle, resize: "vertical" }}
      />
    </div>
  );
}

function PriceLine({ label, value, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16,
      padding: "10px 0", borderBottom: "1px solid var(--line)",
      color: muted ? "var(--fg-muted)" : "var(--fg)", fontSize: 15 }}>
      <span>{label}</span>
      <span style={{ whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function StepEstimation({ state, set, travel, travelLoading, onExplore, simulations, lang }) {
  const t = mkT(lang);
  const { ttc, h } = calcPrice(state);
  const needsHotel = state.moments.danse === "etendue";
  const hotelCost  = needsHotel && !state.hotelPrisEnCharge ? HOTEL_TTC : 0;
  const total = ttc + (travel?.cost || 0) + hotelCost;

  const fmtLabel    = formatLabel(state, lang);
  const momentsLabel = momentsSummary(state.moments, lang);
  const hasVideo    = state.format !== "photo";

  const REACTION_OPTS = [
    { v: "oui",    label: t("Oui, tout à fait", "Yes, absolutely") },
    { v: "approx", label: t("C'est un peu au-dessus, mais je suis intéressé·e", "It's slightly above my budget, but I'm interested") },
    { v: "non",    label: t("C'est au-dessus de mon budget", "It's above my budget") },
  ];

  const INTENTION_OPTS = [
    { v: "reserver",  label: t("Je souhaite réserver cette date", "I'd like to book this date") },
    { v: "discuter",  label: t("Je voudrais en discuter avant de décider", "I'd like to discuss before deciding") },
    { v: "reflechir", label: t("Je vais réfléchir", "I'll think about it") },
    { v: "explorer",  label: t("Faire une nouvelle estimation", "Make a new estimate") },
  ];

  return (
    <div>
      {simulations?.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontWeight: 600, color: "var(--fg)", marginBottom: 12 }}>
            {t("Vos estimations précédentes", "Your previous estimates")}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {simulations.map((sim, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
                padding: "10px 0", borderBottom: "1px solid var(--line)", gap: 16 }}>
                <div>
                  <span style={{ fontWeight: 500, color: "var(--fg)", fontSize: 14 }}>{sim.format}</span>
                  {sim.moments && <span style={{ color: "var(--fg-muted)", fontSize: 13, marginLeft: 10 }}>{sim.moments}</span>}
                </div>
                <span style={{ fontWeight: 600, color: "var(--fg)", whiteSpace: "nowrap" }}>{eur(sim.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 8, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)",
        ...(simulations?.length > 0 ? { paddingTop: 32, borderTop: "1px solid var(--line)" } : {}) }}>
        {simulations?.length > 0
          ? t("Votre nouvelle estimation", "Your new estimate")
          : t("Votre estimation", "Your estimate")}
      </h3>
      <div style={{ marginBottom: 32 }}>
        <PriceLine label={fmtLabel + (momentsLabel ? ` · ${momentsLabel}` : '')} value={eur(ttc)} />
        {hasVideo && state.teaser   && <PriceLine label={t("+ Teaser",    "+ Teaser")}       value="+700 €" muted />}
        {hasVideo && state.integral && <PriceLine label={t("+ Intégral",  "+ Full version")} value="+500 €" muted />}
        {state.drone                && <PriceLine label="+ Drone"                            value="+200 €" muted />}
        {travelLoading ? (
          <PriceLine label={t("Déplacement", "Travel")} value={t("calcul en cours…", "calculating…")} muted />
        ) : travel?.km > 0 ? (
          <PriceLine label={`${t("Déplacement hors péages autoroute", "Travel excl. motorway tolls")} · ${travel.km} km ${t("A/R", "round trip")}`} value={`+${eur(travel.cost)}`} muted />
        ) : null}

        {needsHotel && (
          <PriceLine
            label={t("Hébergement des prestataires", "Accommodation for photographers")}
            value={state.hotelPrisEnCharge ? t("Pris en charge par les mariés", "Covered by the couple") : `+${eur(HOTEL_TTC)}`}
            muted
          />
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
          padding: "20px 0 0", marginTop: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 17 }}>{t("Total estimé TTC", "Estimated total incl. VAT")}</span>
          <span style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700, fontFamily: "var(--serif-display)" }}>
            {eur(total)}
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 16, fontFamily: "var(--serif)", fontStyle: "italic" }}>
          {t("Estimation indicative. Devis définitif confirmé sous 48h.", "Indicative estimate. Final quote confirmed within 48h.")}
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, marginBottom: 14, color: "var(--fg)" }}>
          {t("Ce budget vous convient-il ?", "Does this budget work for you?")}
        </div>
        {REACTION_OPTS.map(opt => (
          <label key={opt.v} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", color: "var(--fg)" }}>
            <input type="radio" name="reaction" checked={state.reaction === opt.v}
              onChange={() => set("reaction", opt.v)} />
            {opt.label}
          </label>
        ))}
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: 14, color: "var(--fg)" }}>
          {t("Quelle est votre intention ?", "What would you like to do?")}
        </div>
        {INTENTION_OPTS.map(opt => (
          <label key={opt.v} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", color: "var(--fg)" }}>
            <input type="radio" name="intention" checked={state.intention === opt.v}
              onChange={() => {
                set("intention", opt.v);
                if (opt.v === "explorer") setTimeout(onExplore, 200);
              }} />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function StepContact({ state, set, simulations, travel, onSubmit, lang }) {
  const t = mkT(lang);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const allSims = [...simulations, {
    format:  formatLabel(state, lang),
    moments: momentsSummary(state.moments, lang),
    price:   calcPrice(state).ttc,
    travel,
  }];

  const [chosen, setChosen] = useState(allSims.length - 1);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError("");

    const allSimsEmail = [...simulations, {
      format:  formatLabel(state, lang),
      moments: momentsSummary(state.moments, lang),
      price:   calcPrice(state).ttc,
      travel,
    }];

    const payload = {
      prenom:      state.prenom,
      nom:         state.nom,
      email:       state.email,
      tel:         state.tel,
      demandes:    state.demandes,
      simulations:  allSimsEmail,
      simulation:   allSimsEmail[chosen],
      reactionKey:  state.reaction,
      intentionKey: state.intention,
      lang,
    };

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}services/send-devis.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        onSubmit();
      } else {
        setError(t("L'envoi a échoué. Veuillez réessayer ou nous écrire directement à contact@dfly.fr", "Sending failed. Please try again or contact us directly at contact@dfly.fr"));
      }
    } catch {
      setError(t("L'envoi a échoué. Veuillez réessayer ou nous écrire directement à contact@dfly.fr", "Sending failed. Please try again or contact us directly at contact@dfly.fr"));
    } finally {
      setSending(false);
    }
  }

  const FIELDS = [
    [
      { key: "prenom", label: t("Prénom", "First name"), type: "text",  required: true  },
      { key: "nom",    label: t("Nom",    "Last name"),  type: "text",  required: true  },
    ],
    [
      { key: "email", label: "Email",                     type: "email", required: true  },
      { key: "tel",   label: t("Téléphone", "Phone"),     type: "tel",   required: false },
    ],
  ];

  return (
    <div>
      {allSims.length > 1 && (
        <div style={{ marginBottom: 40 }}>
          <h4 style={{ fontWeight: 600, marginBottom: 16, color: "var(--fg)" }}>{t("Vos simulations", "Your estimates")}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {allSims.map((sim, i) => (
              <label key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                cursor: "pointer", borderBottom: "1px solid var(--line)",
                background: chosen === i ? "var(--bg-alt)" : "transparent",
              }}>
                <input type="radio" name="chosen" checked={chosen === i}
                  onChange={() => setChosen(i)} style={{ marginTop: 3 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: "var(--fg)" }}>{t("Simulation", "Estimate")} {i + 1} · {sim.format}</div>
                  <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{sim.moments}</div>
                </div>
                <div style={{ fontWeight: 600, color: "var(--fg)", whiteSpace: "nowrap" }}>{eur(sim.price)}</div>
              </label>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 36, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        {t("Vos coordonnées", "Your contact details")}
      </h3>
      <form onSubmit={handleSubmit}>
        {FIELDS.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {row.map(f => (
              <div key={f.key}>
                <div style={{ marginBottom: 6, fontWeight: 500, color: "var(--fg)", fontSize: 14 }}>{f.label}</div>
                <input type={f.type} required={f.required} value={state[f.key]}
                  onChange={e => set(f.key, e.target.value)} style={inputStyle} />
              </div>
            ))}
          </div>
        ))}
        <div style={{ marginBottom: 32 }} />

        <button
          type="submit"
          disabled={sending || !state.prenom || !state.email}
          style={{
            width: "100%", padding: "16px 32px",
            background: (!state.prenom || !state.email) ? "var(--line)" : "var(--fg)",
            color: (!state.prenom || !state.email) ? "var(--fg-muted)" : "var(--bg)",
            border: "none", fontSize: 15, fontWeight: 600,
            cursor: (!state.prenom || !state.email) ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {sending ? t("Envoi en cours…", "Sending…") : t("Envoyer ma demande", "Send my request")}
        </button>
        {error && (
          <p style={{ color: "red", fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</p>
        )}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--fg-muted)", marginTop: 12 }}>
          {t("Nous vous répondons sous 48h.", "We'll get back to you within 48h.")}
        </p>
      </form>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

const STEP_LABELS_FR = ["Moments", "Date", "Lieux", "Format", "Drone", "Infos", "Estimation", "Contact"];
const STEP_LABELS_EN = ["Moments", "Date", "Venues", "Format", "Drone", "Details", "Estimate", "Contact"];

function Progress({ step, onGoTo, lang }) {
  const labels = lang === "EN" ? STEP_LABELS_EN : STEP_LABELS_FR;
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8, marginTop: 20, position: "relative" }}>
        {labels.map((_, i) => (
          <div
            key={i}
            onClick={() => i < step && onGoTo(i)}
            title={i < step ? labels[i] : undefined}
            style={{ flex: 1, position: "relative", height: 2, cursor: i < step ? "pointer" : "default", padding: "8px 0",
              opacity: hovered === i ? 0.4 : 1, transition: "opacity .2s" }}
            onMouseEnter={() => { if (i < step) setHovered(i); }}
            onMouseLeave={() => setHovered(null)}
          >
            {i < step && (
              <span style={{
                position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
                display: "block", width: 14, height: 14, borderRadius: "50%",
                background: "var(--fg)",
              }} />
            )}
            <span style={{
              display: "block", height: 2,
              background: i <= step ? "var(--fg)" : "var(--line)",
              transition: "background .3s",
            }} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {labels[step]}
      </div>
    </div>
  );
}

function NavBtns({ step, onBack, onNext, nextLabel, nextDisabled, lang }) {
  const t = mkT(lang);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
      {step > 0
        ? <button onClick={onBack} style={{ background: "none", border: "1px solid var(--line)", padding: "10px 24px", cursor: "pointer", color: "var(--fg)", fontSize: 14, fontFamily: "inherit" }}>← {t("Retour", "Back")}</button>
        : <span />
      }
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          background: nextDisabled ? "var(--line)" : "var(--fg)",
          color: nextDisabled ? "var(--fg-muted)" : "var(--bg)",
          border: "none", padding: "12px 32px",
          cursor: nextDisabled ? "default" : "pointer",
          fontSize: 14, fontWeight: 600, fontFamily: "inherit",
        }}
      >
        {nextLabel || `${t("Suivant", "Next")} →`}
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const INIT = {
  moments: {}, extras: {},
  dates: { main: "", mairie: "", diffMairie: false, noDate: false },
  lieux: {},
  format: "both",
  teaser: false, integral: false, drone: false,
  hotelPrisEnCharge: false,
  demandes: "",
  reaction: "", intention: "",
  prenom: "", nom: "", email: "", tel: "",
};

export default function DevisFunnel({ lang = "FR" }) {
  const t = mkT(lang);
  const topRef        = useRef(null);
  const isFirstRender = useRef(true);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [state, setState] = useState(INIT);
  const [simulations, setSimulations] = useState([]);
  const [travel, setTravel] = useState({ km: 0, cost: 0 });
  const [travelLoading, setTravelLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field, value) {
    setState(s => ({ ...s, [field]: value }));
  }

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (step === 6) {
      setTravelLoading(true);
      calcTravel(state.lieux, state.moments).then(t => {
        setTravel(t);
        setTravelLoading(false);
      });
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function goNext() { setStep(s => { const n = s + 1; setMaxStep(m => Math.max(m, n)); return n; }); }
  function goBack() { setStep(s => s - 1); }

  function handleExplore() {
    const { ttc } = calcPrice(state);
    setSimulations(prev => [...prev, {
      format:  formatLabel(state, lang),
      moments: momentsSummary(state.moments, lang),
      price:   ttc + (travel?.cost || 0),
      state:   { ...state },
    }]);
    setState({ ...INIT, dates: state.dates, lieux: state.lieux, moments: state.moments });
    setStep(0);
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontFamily: "var(--serif-display)", fontSize: 48, fontStyle: "italic", fontWeight: 300, marginBottom: 24, opacity: 0.4 }}>✓</div>
        <h3 style={{ fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 16 }}>
          {t("Votre demande a bien été envoyée.", "Your request has been sent.")}
        </h3>
        <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 40 }}>
          {t("Nous vous répondons sous 48h.", "We'll get back to you within 48h.")}
        </p>
        <button
          onClick={() => { setSubmitted(false); setState(INIT); setSimulations([]); setStep(0); setMaxStep(0); }}
          style={{ background: "none", border: "1px solid var(--line)", padding: "12px 28px",
            cursor: "pointer", color: "var(--fg-muted)", fontSize: 13,
            fontFamily: "var(--sans)", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          {t("Faire une nouvelle estimation", "Start a new estimate")}
        </button>
      </div>
    );
  }

  const canGoNext = () => {
    if (step === 0) return Object.keys(state.moments).length > 0;
    if (step === 6) return !!state.reaction && !!state.intention && state.intention !== "explorer";
    return true;
  };

  const steps = [
    <StepMoments    key="moments"  state={state} set={set} lang={lang} />,
    <StepDate       key="date"     state={state} set={set} lang={lang} />,
    <StepLieux      key="lieux"    state={state} set={set} lang={lang} />,
    <StepFormat     key="format"   state={state} set={set} lang={lang} />,
    <StepDrone      key="drone"    state={state} set={set} lang={lang} />,
    <StepDemandes   key="demandes" state={state} set={set} lang={lang} />,
    <StepEstimation key="estim"    state={state} set={set} lang={lang} travel={travel} travelLoading={travelLoading} onExplore={handleExplore} simulations={simulations} />,
    <StepContact    key="contact"  state={state} set={set} lang={lang} simulations={simulations} travel={travel} onSubmit={handleSubmit} />,
  ];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div ref={topRef} style={{ scrollMarginTop: 140 }} />
      <Progress step={step} onGoTo={setStep} lang={lang} />
      {steps[step]}
      {step < 7 && (
        <NavBtns
          step={step}
          onBack={goBack}
          onNext={goNext}
          nextLabel={step === 6 ? `${t("Continuer", "Continue")} →` : undefined}
          nextDisabled={!canGoNext()}
          lang={lang}
        />
      )}
      {step < 6 && maxStep >= 6 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button
            onClick={() => setStep(6)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-muted)", fontSize: 13,
              fontFamily: "var(--sans)", letterSpacing: "0.1em", textDecoration: "underline", textUnderlineOffset: 4 }}
          >
            {t("→ Voir l'estimation", "→ See estimate")}
          </button>
        </div>
      )}
    </div>
  );
}
