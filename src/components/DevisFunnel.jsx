import { useState, useEffect } from "react";

// ── Config ────────────────────────────────────────────────────────────────────

const CAGNES = { lat: 43.6646, lng: 7.1579 };
const KM_RATE = 0.697;
const MIN_TTC = 800;
const FULL_DAY_H = 8;
const PP_PHOTO_HT = 1200;  // Rémi 3j × 400€
const PP_VIDEO_HT = 2000;  // Antoine 5j × 400€
const CAPTATION_HT = 800;  // 2 personnes × 400€/j

const MOMENTS = [
  { id: "preparatifs", label: "Préparatifs",                       h: 2   },
  { id: "mairie",      label: "Mairie",                            h: 1   },
  { id: "ceremonie",   label: "Cérémonie religieuse ou laïque",    h: 1.5 },
  { id: "groupes",     label: "Photos de groupes",                 h: 0.5 },
  { id: "couple",      label: "Photos de couple",                  h: 1.5 },
  { id: "cocktail",    label: "Cocktail / Vin d'honneur", opts: [
    { v: "complet", label: "Couverture complète",          h: 2   },
    { v: "debut",   label: "Jusqu'au début seulement",     h: 0.5 },
  ]},
  { id: "diner",       label: "Dîner", opts: [
    { v: "complet", label: "Jusqu'au gâteau",                      h: 3 },
    { v: "debut",   label: "Installation et groupes seulement",    h: 1 },
  ]},
  { id: "danse",       label: "Soirée / Danse", opts: [
    { v: "standard", label: "Ouverture de bal + gâteau + 30 min", h: 1.5 },
    { v: "etendue",  label: "Soirée étendue",                      h: 3   },
  ]},
];

const MOMENT_IDS = MOMENTS.map(m => m.id);

const EXTRAS = [
  { id: "engagement", label: "Séance d'engagement",  note: "à partir de 200 €" },
  { id: "trash",      label: "Trash the dress",       note: "à partir de 200 €" },
];

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

// Taux horaires HT (post-prod + captation ramenés à l'heure)
const RATE_HT = {
  photo: (PP_PHOTO_HT + CAPTATION_HT) / FULL_DAY_H,  // 250 €/h
  video: (PP_VIDEO_HT + CAPTATION_HT) / FULL_DAY_H,  // 350 €/h
  both:  (PP_PHOTO_HT + PP_VIDEO_HT + CAPTATION_HT) / FULL_DAY_H,  // 500 €/h
};

function calcPrice(state) {
  const h = totalHours(state.moments);
  const billableH = Math.min(h, FULL_DAY_H);
  const rate = RATE_HT[state.format === "both" ? "both" : state.format] ?? RATE_HT.photo;
  let baseHT = billableH * rate;

  let addonsHT = 0;
  if (state.format !== "photo") {
    if (state.teaser)   addonsHT += 700 / 1.2;
    if (state.integral) addonsHT += 500 / 1.2;
  }
  if (state.drone) addonsHT += 200 / 1.2;

  const ttc = Math.max((baseHT + addonsHT) * 1.2, MIN_TTC);
  return { h, ttc: Math.round(ttc / 10) * 10 };
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
    if (!last || Math.abs(last.lat - coords.lat) > 0.0005 || Math.abs(last.lng - coords.lng) > 0.0005) {
      venues.push(coords);
    }
  }
  if (!venues.length) return { km: 0, cost: 0 };

  try {
    const pts = [CAGNES, ...venues, CAGNES];
    const coordStr = pts.map(p => `${p.lng},${p.lat}`).join(";");
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=false`);
    const d = await r.json();
    if (d.code === "Ok") {
      const km = Math.round(d.routes[0].distance / 1000);
      return { km, cost: Math.round(km * KM_RATE) };
    }
  } catch {}
  return { km: 0, cost: 0 };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function eur(n) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " €";
}

function formatLabel(state) {
  if (state.format === "photo") return "Photo";
  if (state.format === "video") return "Vidéo";
  return "Photo + Vidéo";
}

function momentsSummary(moments) {
  return MOMENTS
    .filter(m => moments[m.id])
    .map(m => {
      if (m.opts) {
        const o = m.opts.find(o => o.v === moments[m.id]);
        return o ? m.label : m.label;
      }
      return m.label;
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

function StepMoments({ state, set }) {
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
        Sur quels moments souhaitez-vous nous avoir ?
      </h3>
      <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 36 }}>
        Sélectionnez tous les moments qui vous intéressent.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {MOMENTS.map((m, i) => (
          <div key={m.id} style={{ borderTop: i === 0 ? "1px solid var(--line)" : "none", borderBottom: "1px solid var(--line)" }}>
            {m.opts ? (
              <div style={{ padding: "16px 0" }}>
                <div style={{ fontWeight: 500, marginBottom: 12, color: "var(--fg)" }}>{m.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 4 }}>
                  {m.opts.map(opt => (
                    <label key={opt.v} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "var(--fg)", fontSize: 15 }}>
                      <input
                        type="radio" name={m.id}
                        checked={moments[m.id] === opt.v}
                        onChange={() => selectOpt(m.id, opt.v)}
                      />
                      {opt.label}
                    </label>
                  ))}
                  {moments[m.id] && (
                    <button
                      onClick={() => { const n = { ...moments }; delete n[m.id]; set("moments", n); }}
                      style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--fg-muted)", fontSize: 12, cursor: "pointer", padding: 0, marginTop: 4 }}
                    >
                      Retirer
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", cursor: "pointer" }}>
                <input type="checkbox" checked={!!moments[m.id]} onChange={() => toggleSimple(m.id)} />
                <span style={{ fontWeight: 500, color: "var(--fg)", fontSize: 15 }}>{m.label}</span>
              </label>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36 }}>
        <div style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 14 }}>
          Prestations complémentaires (avant ou après le mariage)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {EXTRAS.map(e => (
            <label key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!extras[e.id]}
                onChange={() => set("extras", { ...extras, [e.id]: !extras[e.id] })}
              />
              <span style={{ fontSize: 15, color: "var(--fg)" }}>{e.label}</span>
              <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>{e.note}</span>
            </label>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!extras.autreChecked}
              onChange={() => set("extras", { ...extras, autreChecked: !extras.autreChecked, autre: "" })}
            />
            <span style={{ fontSize: 15, color: "var(--fg)" }}>Autre</span>
          </label>
          {extras.autreChecked && (
            <input
              type="text"
              placeholder="Précisez..."
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

function StepDate({ state, set }) {
  const { dates } = state;
  const upd = patch => set("dates", { ...dates, ...patch });

  return (
    <div>
      <h3 style={{ marginBottom: 36, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        Avez-vous fixé une date ?
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={!!dates.noDate} onChange={e => upd({ noDate: e.target.checked, main: "" })} />
          <span style={{ color: "var(--fg)" }}>Date non encore fixée</span>
        </label>

        {!dates.noDate && (
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500, color: "var(--fg)" }}>Date du mariage</div>
            <input type="date" value={dates.main} onChange={e => upd({ main: e.target.value })}
              style={{ ...inputStyle, width: "auto" }} />
          </div>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={!!dates.diffMairie} onChange={e => upd({ diffMairie: e.target.checked })} />
          <span style={{ color: "var(--fg)" }}>La mairie se déroule à une date différente</span>
        </label>

        {dates.diffMairie && (
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500, color: "var(--fg)" }}>Date de la mairie</div>
            <input type="date" value={dates.mairie} onChange={e => upd({ mairie: e.target.value })}
              style={{ ...inputStyle, width: "auto" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function StepLieux({ state, set }) {
  const { moments, lieux } = state;
  const [geocoding, setGeocoding] = useState({});

  const activeMoments = MOMENTS.filter(m => !!moments[m.id]);

  async function handleBlur(id) {
    const loc = lieux[id];
    if (!loc?.address || loc.coords) return;
    setGeocoding(g => ({ ...g, [id]: true }));
    const coords = await geocode(loc.address);
    setGeocoding(g => ({ ...g, [id]: false }));
    set("lieux", { ...lieux, [id]: { ...loc, coords } });
  }

  function setAddress(id, address) {
    set("lieux", { ...lieux, [id]: { address, coords: null } });
  }

  function setSameAs(id, sameAs) {
    if (sameAs) set("lieux", { ...lieux, [id]: { sameAs } });
    else set("lieux", { ...lieux, [id]: { address: "", coords: null } });
  }

  return (
    <div>
      <h3 style={{ marginBottom: 8, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        Où se déroulent vos événements ?
      </h3>
      <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 36 }}>
        Adresse complète — nous préparons chaque lieu à l'avance.
      </p>

      {activeMoments.length === 0 && (
        <p style={{ color: "var(--fg-muted)" }}>Aucun moment sélectionné à l'étape précédente.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {activeMoments.map((m, idx) => {
          const loc = lieux[m.id] || {};
          const prevMoments = activeMoments.slice(0, idx);
          const hasOk = loc.sameAs || loc.coords;

          return (
            <div key={m.id} style={{ paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: "var(--fg)" }}>{m.label}</span>
                {hasOk && <span style={{ color: "var(--sage)", fontSize: 13 }}>✓</span>}
              </div>

              {prevMoments.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <select
                    value={loc.sameAs || ""}
                    onChange={e => setSameAs(m.id, e.target.value)}
                    style={{ ...inputStyle, width: "auto", marginBottom: 4 }}
                  >
                    <option value="">Lieu différent</option>
                    {prevMoments.map(p => (
                      <option key={p.id} value={p.id}>Même lieu que : {p.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {!loc.sameAs && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Adresse complète..."
                    value={loc.address || ""}
                    onChange={e => setAddress(m.id, e.target.value)}
                    onBlur={() => handleBlur(m.id)}
                    style={inputStyle}
                  />
                  {geocoding[m.id] && <span style={{ color: "var(--fg-muted)", fontSize: 13, whiteSpace: "nowrap" }}>…</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepFormat({ state, set }) {
  const FORMAT_OPTS = [
    { v: "photo", label: "Photo uniquement",  desc: "Des images fixes, pour (re)voir chaque instant." },
    { v: "video", label: "Vidéo uniquement",  desc: "La journée en mouvement — voix, musique, émotions. Micro-cravate fourni." },
    { v: "both",  label: "Photo + Vidéo",     desc: "Le choix de la plupart de nos mariés. Rien ne manque.", recommended: true },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: 8, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        Comment souhaitez-vous revivre cette journée dans dix ans ?
      </h3>
      <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 36 }}>
        Choisissez ce qui vous ressemble.
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
                {opt.recommended && <span style={{ marginLeft: 10, fontSize: 12, color: "var(--fg-muted)", fontWeight: 400 }}>recommandé</span>}
              </div>
              <div style={{ fontSize: 14, color: "var(--fg-muted)" }}>{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>

      {state.format !== "photo" && (
        <div style={{ padding: "24px", background: "var(--bg-alt)", border: "1px solid var(--line)" }}>
          <div style={{ fontWeight: 600, color: "var(--fg)", marginBottom: 16 }}>Format du film</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--line)", opacity: 0.7 }}>
              <input type="checkbox" checked disabled style={{ marginTop: 3, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, color: "var(--fg)" }}>Film — 20 à 40 min</div>
                <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>L'histoire de votre journée</div>
              </div>
              <div style={{ color: "var(--fg-muted)", fontSize: 13, whiteSpace: "nowrap" }}>inclus</div>
            </div>

            {[
              { key: "teaser",   label: "Teaser — 2 à 5 min",
                desc: "Les émotions dans un résumé à partager", price: "+700 €" },
              { key: "integral", label: "Intégral — 1h+",
                desc: "Parce que certains jours, vous voudrez revivre chaque moment comme si vous y étiez", price: "+500 €" },
            ].map(opt => (
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

function StepDrone({ state, set }) {
  return (
    <div>
      <h3 style={{ marginBottom: 36, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        Souhaitez-vous des prises de vue par drone ?
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { v: true,  label: "Oui",  desc: "Vues aériennes du lieu, des invités, de la cérémonie. +200 €" },
          { v: false, label: "Non",  desc: null },
        ].map(opt => (
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

function StepDemandes({ state, set }) {
  return (
    <div>
      <h3 style={{ marginBottom: 8, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        Des éléments particuliers à nous signaler ?
      </h3>
      <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 36 }}>
        Contraintes de lieu, moments importants, demandes spécifiques — tout ce qui nous aide à préparer un devis juste.
      </p>
      <textarea
        value={state.demandes}
        onChange={e => set("demandes", e.target.value)}
        placeholder="Ex : cérémonie en extérieur, discours surprise des témoins, liste de personnes à ne pas manquer…"
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

function StepEstimation({ state, set, travel, travelLoading, onExplore, simulations }) {
  const { ttc, h } = calcPrice(state);
  const total = ttc + (travel?.cost || 0);

  const fmtLabel = formatLabel(state);
  const momentsLabel = momentsSummary(state.moments);
  const hasVideo = state.format !== "photo";

  return (
    <div>
      {simulations?.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontWeight: 600, color: "var(--fg)", marginBottom: 12 }}>Vos estimations précédentes</div>
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
        {simulations?.length > 0 ? "Votre nouvelle estimation" : "Votre estimation"}
      </h3>
      <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 36 }}>
        Durée estimée : {Math.round(h * 10) / 10}h de présence
      </p>

      <div style={{ marginBottom: 32 }}>
        <PriceLine label={fmtLabel + (momentsLabel ? ` · ${momentsLabel}` : '')} value={eur(ttc)} />
        {hasVideo && state.teaser   && <PriceLine label="+ Teaser"   value="+700 €"  muted />}
        {hasVideo && state.integral && <PriceLine label="+ Intégral" value="+500 €"  muted />}
        {state.drone                && <PriceLine label="+ Drone"    value="+200 €"  muted />}
        {travelLoading ? (
          <PriceLine label="Déplacement" value="calcul en cours…" muted />
        ) : travel?.km > 0 ? (
          <PriceLine label={`Déplacement · ${travel.km} km A/R`} value={`+${eur(travel.cost)} + péages`} muted />
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
          padding: "20px 0 0", marginTop: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 17 }}>Total estimé TTC</span>
          <span style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700, fontFamily: "var(--serif-display)" }}>
            {eur(total)}
          </span>
        </div>
        {travel?.km > 0 && (
          <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4 }}>
            Hors péages — confirmés dans le devis définitif
          </div>
        )}
        <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 16, fontFamily: "var(--serif)", fontStyle: "italic" }}>
          Estimation indicative. Devis définitif confirmé sous 48h.
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, marginBottom: 14, color: "var(--fg)" }}>Ce budget vous convient-il ?</div>
        {[
          { v: "oui",    label: "Oui, tout à fait" },
          { v: "approx", label: "C'est un peu au-dessus, mais je suis intéressé·e" },
          { v: "non",    label: "C'est au-dessus de mon budget" },
        ].map(opt => (
          <label key={opt.v} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", color: "var(--fg)" }}>
            <input type="radio" name="reaction" checked={state.reaction === opt.v}
              onChange={() => set("reaction", opt.v)} />
            {opt.label}
          </label>
        ))}
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: 14, color: "var(--fg)" }}>Quelle est votre intention ?</div>
        {[
          { v: "reserver",  label: "Je souhaite réserver cette date" },
          { v: "discuter",  label: "Je voudrais en discuter avant de décider" },
          { v: "reflechir", label: "Je vais réfléchir" },
          { v: "explorer",  label: "Faire une nouvelle estimation" },
        ].map(opt => (
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

function StepContact({ state, set, simulations, travel, onSubmit }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const allSims = [...simulations, {
    format: formatLabel(state),
    moments: momentsSummary(state.moments),
    price: calcPrice(state).ttc,
    travel,
  }];

  const [chosen, setChosen] = useState(allSims.length - 1);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError("");

    const reactionLabel = {
      oui:    "Oui, tout à fait",
      approx: "C'est un peu au-dessus, mais je suis intéressé·e",
      non:    "C'est au-dessus de mon budget",
    }[state.reaction] ?? state.reaction;

    const intentionLabel = {
      reserver:  "Je souhaite réserver cette date",
      discuter:  "Je voudrais en discuter avant de décider",
      reflechir: "Je vais réfléchir",
    }[state.intention] ?? state.intention;

    const payload = {
      prenom:      state.prenom,
      nom:         state.nom,
      email:       state.email,
      tel:         state.tel,
      demandes:    state.demandes,
      simulations:  allSims,
      simulation:   allSims[chosen],
      reaction:     reactionLabel,
      intention:    intentionLabel,
      intentionKey: state.intention,
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
        setError("L'envoi a échoué. Veuillez réessayer ou nous écrire directement à contact@dfly.fr");
      }
    } catch {
      setError("L'envoi a échoué. Veuillez réessayer ou nous écrire directement à contact@dfly.fr");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {allSims.length > 1 && (
        <div style={{ marginBottom: 40 }}>
          <h4 style={{ fontWeight: 600, marginBottom: 16, color: "var(--fg)" }}>Vos simulations</h4>
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
                  <div style={{ fontWeight: 500, color: "var(--fg)" }}>Simulation {i + 1} · {sim.format}</div>
                  <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{sim.moments}</div>
                </div>
                <div style={{ fontWeight: 600, color: "var(--fg)", whiteSpace: "nowrap" }}>{eur(sim.price)}</div>
              </label>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 36, fontFamily: "var(--serif-display)", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)" }}>
        Vos coordonnées
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[
            { key: "prenom", label: "Prénom", type: "text", required: true },
            { key: "nom",    label: "Nom",    type: "text", required: true },
          ].map(f => (
            <div key={f.key}>
              <div style={{ marginBottom: 6, fontWeight: 500, color: "var(--fg)", fontSize: 14 }}>{f.label}</div>
              <input type={f.type} required={f.required} value={state[f.key]}
                onChange={e => set(f.key, e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {[
            { key: "email", label: "Email",     type: "email", required: true },
            { key: "tel",   label: "Téléphone", type: "tel",   required: false },
          ].map(f => (
            <div key={f.key}>
              <div style={{ marginBottom: 6, fontWeight: 500, color: "var(--fg)", fontSize: 14 }}>{f.label}</div>
              <input type={f.type} required={f.required} value={state[f.key]}
                onChange={e => set(f.key, e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>

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
          {sending ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>
        {error && (
          <p style={{ color: "red", fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</p>
        )}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--fg-muted)", marginTop: 12 }}>
          Nous vous répondons sous 48h.
        </p>
      </form>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

const STEP_LABELS = ["Moments", "Date", "Lieux", "Format", "Drone", "Infos", "Estimation", "Contact"];

function Progress({ step }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {STEP_LABELS.map((_, i) => (
          <div key={i} style={{
            height: 2, flex: 1,
            background: i <= step ? "var(--fg)" : "var(--line)",
            transition: "background .3s",
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {STEP_LABELS[step]}
      </div>
    </div>
  );
}

function NavBtns({ step, onBack, onNext, nextLabel, nextDisabled }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
      {step > 0
        ? <button onClick={onBack} style={{ background: "none", border: "1px solid var(--line)", padding: "10px 24px", cursor: "pointer", color: "var(--fg)", fontSize: 14, fontFamily: "inherit" }}>← Retour</button>
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
        {nextLabel || "Suivant →"}
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
  demandes: "",
  reaction: "", intention: "",
  prenom: "", nom: "", email: "", tel: "",
};

export default function DevisFunnel() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState(INIT);
  const [simulations, setSimulations] = useState([]);
  const [travel, setTravel] = useState({ km: 0, cost: 0 });
  const [travelLoading, setTravelLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field, value) {
    setState(s => ({ ...s, [field]: value }));
  }

  // Calculate travel when arriving on estimation step
  useEffect(() => {
    if (step === 6) {
      setTravelLoading(true);
      calcTravel(state.lieux, state.moments).then(t => {
        setTravel(t);
        setTravelLoading(false);
      });
    }
  }, [step]);

  function goNext() { setStep(s => s + 1); }
  function goBack() { setStep(s => s - 1); }

  function handleExplore() {
    const { ttc } = calcPrice(state);
    setSimulations(prev => [...prev, {
      format: formatLabel(state),
      moments: momentsSummary(state.moments),
      price: ttc + (travel?.cost || 0),
      state: { ...state },
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
          Votre demande a bien été envoyée.
        </h3>
        <p style={{ color: "var(--fg-muted)", fontFamily: "var(--serif)", fontStyle: "italic" }}>
          Nous vous répondons sous 48h.
        </p>
      </div>
    );
  }

  const canGoNext = () => {
    if (step === 0) return Object.keys(state.moments).length > 0;
    if (step === 6) return !!state.reaction && !!state.intention && state.intention !== "explorer";
    return true;
  };

  const steps = [
    <StepMoments  key="moments"   state={state} set={set} />,
    <StepDate     key="date"      state={state} set={set} />,
    <StepLieux    key="lieux"     state={state} set={set} />,
    <StepFormat   key="format"    state={state} set={set} />,
    <StepDrone    key="drone"     state={state} set={set} />,
    <StepDemandes key="demandes"  state={state} set={set} />,
    <StepEstimation key="estim"   state={state} set={set} travel={travel} travelLoading={travelLoading} onExplore={handleExplore} simulations={simulations} />,
    <StepContact  key="contact"   state={state} set={set} simulations={simulations} travel={travel} onSubmit={handleSubmit} />,
  ];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <Progress step={step} />
      {steps[step]}
      {step < 7 && (
        <NavBtns
          step={step}
          onBack={goBack}
          onNext={goNext}
          nextLabel={step === 6 ? "Continuer →" : undefined}
          nextDisabled={!canGoNext()}
        />
      )}
    </div>
  );
}
