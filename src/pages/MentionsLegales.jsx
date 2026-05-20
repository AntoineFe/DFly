import TopNav from '../components/TopNav'
import Footer from '../components/Footer'

export default function MentionsLegales({ lang, setLang }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <TopNav scheme="light" lang={lang} setLang={setLang} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '120px var(--gutter) 100px' }}>

        <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em',
          textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 16 }}>
          Informations légales
        </div>
        <h1 style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 400, lineHeight: 1.15, marginBottom: 64 }}>
          Mentions légales
        </h1>

        <Section title="Éditeur du site">
          <Row label="Société">HELANSOFT SASU</Row>
          <Row label="SIRET">84161405000018</Row>
          <Row label="Siège social">1 impasse de la vigne, 06800 Cagnes-sur-Mer</Row>
          <Row label="Contact">
            <a href="mailto:contact@helansoft.fr" style={{ color: 'var(--fg)', borderBottom: '1px solid var(--line)' }}>
              contact@helansoft.fr
            </a>
          </Row>
        </Section>

        <Section title="Responsable de publication">
          <Row label="Nom">Antoine Ferrera</Row>
        </Section>

        <Section title="Hébergeur">
          <Row label="Société">Ex2 Inc.</Row>
          <Row label="Adresse">309 rue des Épervières, Saguenay (Québec) G7G 0A6, Canada</Row>
          <Row label="Site web">
            <a href="https://www.ex2.com" target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--fg)', borderBottom: '1px solid var(--line)' }}>
              www.ex2.com
            </a>
          </Row>
          <Row label="Localisation des données">France</Row>
        </Section>

        <Section title="Propriété intellectuelle">
          <p style={bodyStyle}>
            L'ensemble des contenus présents sur ce site (photographies, vidéos, textes, logos) sont la propriété exclusive de HELANSOFT SASU ou de leurs auteurs respectifs et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.
          </p>
          <p style={bodyStyle}>
            Toute reproduction, représentation, modification ou exploitation, totale ou partielle, de ces contenus est strictement interdite sans autorisation écrite préalable.
          </p>
        </Section>

        <Section title="Liens hypertextes">
          <p style={bodyStyle}>
            Le site peut contenir des liens vers des sites tiers. HELANSOFT SASU n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>
        </Section>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--line)',
          fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.12em' }}>
          Dernière mise à jour : mai 2026
        </div>

      </div>

      <Footer lang={lang} />
    </div>
  )
}

const bodyStyle = {
  fontFamily: 'var(--serif)',
  fontSize: 17,
  lineHeight: 1.8,
  color: 'var(--fg)',
  marginBottom: 16,
  fontWeight: 300,
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 56 }}>
      <h2 style={{ fontFamily: 'var(--serif-display)', fontSize: 22, fontWeight: 400,
        marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16,
      paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--line)' }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: 'var(--fg-muted)', paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.6, fontWeight: 300 }}>
        {children}
      </div>
    </div>
  )
}
