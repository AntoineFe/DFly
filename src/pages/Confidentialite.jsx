import TopNav from '../components/TopNav'
import Footer from '../components/Footer'

export default function Confidentialite({ lang, setLang }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <TopNav scheme="light" lang={lang} setLang={setLang} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '120px var(--gutter) 100px' }}>

        <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em',
          textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 16 }}>
          Données personnelles
        </div>
        <h1 style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 400, lineHeight: 1.15, marginBottom: 64 }}>
          Politique de confidentialité
        </h1>

        <Section title="Responsable du traitement">
          <p style={bodyStyle}>
            HELANSOFT SASU — 1 impasse de la vigne, 06800 Cagnes-sur-Mer<br />
            Contact : <a href="mailto:contact@helansoft.fr" style={{ color: 'var(--fg)', borderBottom: '1px solid var(--line)' }}>contact@helansoft.fr</a>
          </p>
        </Section>

        <Section title="Données collectées et finalités">
          <table style={tableStyle}>
            <thead>
              <tr>
                {['Contexte', 'Données', 'Finalité', 'Base légale'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Tr cells={[
                'Formulaire de contact',
                'Prénom, nom, email, téléphone (optionnel)',
                'Répondre à votre demande',
                'Intérêt légitime',
              ]} />
              <Tr cells={[
                'Formulaire de devis',
                'Prénom, nom, email, téléphone (optionnel), adresses des lieux',
                'Établir votre estimation tarifaire',
                'Intérêt légitime',
              ]} />
              <Tr cells={[
                'Galerie privée (connexion)',
                'Email, mot de passe (chiffré), adresse IP',
                'Authentification sécurisée à votre espace personnel',
                'Exécution du contrat',
              ]} />
              <Tr cells={[
                'Logs de navigation',
                'Nom (si connecté), page visitée, adresse IP, horodatage',
                'Suivi de fréquentation interne (aucune transmission à des tiers)',
                'Intérêt légitime',
              ]} />
            </tbody>
          </table>
        </Section>

        <Section title="Durée de conservation">
          <ul style={listStyle}>
            <li>Formulaires contact et devis : données transmises par email uniquement, non stockées en base de données.</li>
            <li>Comptes galerie privée : données conservées le temps de la relation client.</li>
            <li>Sessions de connexion : expiration automatique après 90 jours d'inactivité. L'utilisateur peut se déconnecter à tout moment.</li>
            <li>Logs de navigation : durée inférieure à 6 mois (rotation automatique des fichiers).</li>
          </ul>
        </Section>

        <Section title="Services tiers">
          <p style={bodyStyle}>
            Les polices de caractères utilisées sur ce site sont auto-hébergées sur nos serveurs. Aucune donnée n'est transmise à Google à ce titre.
          </p>
          <p style={bodyStyle}>
            Lors de l'utilisation du simulateur de devis mariage uniquement, le site interroge les services suivants pour le calcul des distances et la recherche d'adresses :
          </p>
          <ul style={listStyle}>
            <li><strong>OpenStreetMap Nominatim</strong> — géocodage d'adresses (nominatim.openstreetmap.org)</li>
            <li><strong>Komoot Photon</strong> — autocomplétion d'adresses (photon.komoot.io)</li>
            <li><strong>OSRM</strong> — calcul d'itinéraires routiers (router.project-osrm.org)</li>
          </ul>
          <p style={bodyStyle}>
            Ces services reçoivent les termes de recherche saisis (adresses) et l'adresse IP du visiteur. Ils sont utilisés exclusivement dans le cadre du simulateur de devis et ne servent à aucune fin publicitaire.
          </p>
        </Section>

        <Section title="Hébergement des données">
          <p style={bodyStyle}>
            Le site et les données associées sont hébergés par Ex2 Inc. (309 rue des Épervières, Saguenay, Canada) sur des serveurs physiquement situés en France.
          </p>
        </Section>

        <Section title="Vos droits">
          <p style={bodyStyle}>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants sur vos données personnelles :
          </p>
          <ul style={listStyle}>
            <li><strong>Droit d'accès</strong> : obtenir une copie des données vous concernant.</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes ou incomplètes.</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données.</li>
            <li><strong>Droit d'opposition</strong> : vous opposer à un traitement basé sur l'intérêt légitime.</li>
          </ul>
          <p style={bodyStyle}>
            Pour exercer ces droits, adressez votre demande via le{' '}
            <a href="/contact" style={{ color: 'var(--fg)', borderBottom: '1px solid var(--line)' }}>
              formulaire de contact
            </a>{' '}
            ou par email à{' '}
            <a href="mailto:contact@helansoft.fr" style={{ color: 'var(--fg)', borderBottom: '1px solid var(--line)' }}>
              contact@helansoft.fr
            </a>.
          </p>
          <p style={bodyStyle}>
            En cas de réponse insatisfaisante, vous pouvez introduire une réclamation auprès de la{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--fg)', borderBottom: '1px solid var(--line)' }}>
              CNIL
            </a>.
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

const listStyle = {
  fontFamily: 'var(--serif)',
  fontSize: 17,
  lineHeight: 1.9,
  color: 'var(--fg)',
  fontWeight: 300,
  paddingLeft: 24,
  marginBottom: 16,
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'var(--serif)',
  fontSize: 15,
  lineHeight: 1.6,
  fontWeight: 300,
}

const thStyle = {
  fontFamily: 'var(--sans)',
  fontSize: 9.5,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: 'var(--fg-muted)',
  padding: '10px 12px',
  textAlign: 'left',
  borderBottom: '2px solid var(--line)',
  background: 'var(--bg)',
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

function Tr({ cells }) {
  return (
    <tr>
      {cells.map((c, i) => (
        <td key={i} style={{
          padding: '12px 12px',
          borderBottom: '1px solid var(--line)',
          verticalAlign: 'top',
          color: 'var(--fg)',
        }}>
          {c}
        </td>
      ))}
    </tr>
  )
}
