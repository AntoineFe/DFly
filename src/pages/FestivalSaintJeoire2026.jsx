import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CLE_GALERIE = 'ynXdh0M9pXDx0Uayn1zWL33MqWHDvCRaCGyqwFicU4HsooFa'

const BODY_HTML = `
<p>Retrouvez ici les photos officielles du festival !</p>
<p>
  Petit déjeuner, ambiance dans les rues de <strong>Saint-Jeoire</strong>,
  cérémonie, vues aériennes et 27 orchestres.
</p>

<hr>
<a href="https://dfly.fr/commande-festival-faucigny-2026" style="
  display: block;
  margin: 32px 0;
  padding: 28px 32px;
  background: var(--bg-alt, #f7f5f2);
  border: 1px solid var(--line, #e0ddd8);
  border-left: 4px solid var(--fg, #1a1a1a);
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s;
" onmouseover="this.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">

  <p style="font-size:1.1em; font-weight:500; margin: 0 0 20px; font-family: var(--serif-display);">
    🎵 Envie de garder un souvenir durable ?
  </p>

  <div style="
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    justify-content: center;
    align-items: flex-start;
    margin: 0 0 24px;
  ">
    <div style="flex:1 1 300px; max-width:400px; text-align:center;">
      <img src="https://dfly.fr/images/modelePhoto_.jpg" alt="Le poster de l'orchestre" style="
        width:100%; max-width:360px; height:auto;
        display:block; margin:0 auto 12px;
        border: 1px solid var(--line, #e0ddd8);
      ">
      <p style="margin:0; font-size: 0.95em;">
        <strong>Le poster de votre orchestre</strong><br>
        Tirage de la photo de groupe officielle prise devant la mairie,
        disponible en trois formats.<br>
        <em style="opacity:0.7; font-size:0.9em;">Papier photo brillant Fujifilm Crystal Archive DP II – 250 g/m²</em>
      </p>
    </div>

    <div style="flex:1 1 300px; max-width:400px; text-align:center;">
      <img src="https://dfly.fr/images/CleUSB_.jpg" alt="Clé USB collector" style="
        width:100%; max-width:360px; height:auto;
        display:block; margin:0 auto 12px;
        border: 1px solid var(--line, #e0ddd8);
      ">
      <p style="margin:0; font-size: 0.95em;">
        <strong>Clé USB collector</strong><br>
        L'intégralité des photos HD du festival dans un coffret bois gravé
        au logo du festival.<br>
        <em style="opacity:0.7; font-size:0.9em;">Le logo DflyDrone visible ici sera remplacé par celui du Festival.</em>
      </p>
    </div>
  </div>

  <p style="text-align:center; margin:0; font-family: var(--sans); font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; opacity: 0.8;">
    → En savoir plus
  </p>

</a>
`

export default function FestivalSaintJeoire2026() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Photos du 190e Festival des Musiques du Faucigny — Saint-Jeoire 2026'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = 'Galerie photo officielle du 190e Festival des Musiques du Faucigny, le 28 juin 2026 à Saint-Jeoire. Petit déjeuner, ambiance dans les rues, cérémonie, vues aériennes et 27 orchestres.'
  }, [])

  function voirPhotos() {
    navigate(`/galerie?cle=${CLE_GALERIE}`)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--serif)' }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', width: '100%', minHeight: 360, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
        <img
          src="https://dfly.fr/images/Pro/e_fesmus2026/galerie/00b_Ambiance/0572_DSC00041.jpeg"
          alt="190e Festival des Musiques du Faucigny — Saint-Jeoire 2026"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)' }} />
        <div style={{ position: 'relative', padding: '40px var(--gutter) 36px', maxWidth: 860, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>
            Galerie photo officielle
          </div>
          <h1 style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 300, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>
            190e Festival des Musiques du Faucigny
          </h1>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', marginBottom: 28 }}>
            28 juin 2026 — Saint-Jeoire-en-Faucigny
          </div>
          <button onClick={voirPhotos} style={{ padding: '13px 32px', background: '#fff', color: '#1a1a1a', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
            Voir les photos →
          </button>
        </div>
      </div>

      {/* ── Corps ── */}
      <div
        style={{ maxWidth: 860, margin: '0 auto', padding: '48px var(--gutter) 80px', boxSizing: 'border-box', fontSize: 17, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: BODY_HTML }}
      />

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid var(--line)', padding: '24px var(--gutter)', textAlign: 'center', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.15em', color: 'var(--fg-muted)' }}>
        <a href="/" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>DFly Photographie</a>
      </div>

    </div>
  )
}
