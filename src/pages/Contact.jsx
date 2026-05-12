import { useState } from 'react'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import SectionLabel from '../components/SectionLabel'
import usePageMeta from '../hooks/usePageMeta'

const BASE = import.meta.env.BASE_URL

const SUJETS_FR = ['Mariage', 'Immobilier', 'Communication & Entreprise', 'Événement & Spectacle', 'Portrait & Famille', 'Autre']
const SUJETS_EN = ['Wedding', 'Real Estate', 'Business & Brand', 'Event & Stage', 'Portrait & Family', 'Other']

const inputStyle = {
  width: '100%', padding: '12px 14px',
  border: '1px solid var(--line)', background: 'var(--bg)',
  color: 'var(--fg)', fontSize: 15, fontFamily: 'inherit',
  boxSizing: 'border-box', outline: 'none',
}

export default function Contact({ lang, setLang }) {
  const t = (fr, en) => lang === 'FR' ? fr : en
  usePageMeta({
    title: t('Contact — DFly Photographie & Vidéo · PACA', 'Contact — DFly Photography & Film · French Riviera'),
    description: t('Contactez DFly pour votre projet photo ou vidéo en Provence Alpes Côte d\'Azur.', 'Contact DFly for your photography or film project in the French Riviera.'),
  })

  const [form, setForm] = useState({ prenom: '', nom: '', email: '', tel: '', sujet: '', message: '' })
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState('')

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch(`${BASE}services/send-contact.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang }),
      })
      const d = await res.json()
      if (d.ok) { setSent(true) }
      else { setError(t('L\'envoi a échoué. Écrivez-nous directement à contact@dfly.fr', 'Sending failed. Write to us directly at contact@dfly.fr')) }
    } catch {
      setError(t('L\'envoi a échoué. Écrivez-nous directement à contact@dfly.fr', 'Sending failed. Write to us directly at contact@dfly.fr'))
    } finally {
      setSending(false)
    }
  }

  const sujets = lang === 'EN' ? SUJETS_EN : SUJETS_FR
  const canSubmit = form.prenom && form.email && form.message && !sending

  return (
    <div>
      <TopNav scheme="light" lang={lang} setLang={setLang} />

      <div style={{ paddingTop: 120, paddingBottom: 0, background: 'var(--bg)' }}>
        <div className="container">

          {/* Header */}
          <div style={{ maxWidth: 760, marginBottom: 80 }}>
            <SectionLabel num="—" label={t('Contact', 'Contact')} />
            <h1 style={{ fontFamily: 'var(--serif-display)', fontSize: 'clamp(44px,6vw,88px)', lineHeight: 0.95, fontWeight: 400, margin: '28px 0 0', letterSpacing: '-0.01em' }}>
              {t(<>Parlons de<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>votre projet.</em></>, <>Let's talk about<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>your project.</em></>)}
            </h1>
          </div>

          {/* Grid 2 cols */}
          <div className="grid-contact" style={{ paddingBottom: 120 }}>

            {/* Colonne gauche — infos */}
            <div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, fontWeight: 300, color: 'var(--fg-muted)', marginBottom: 48, maxWidth: 380 }}>
                {t(
                  'Une question, un projet, une envie — écrivez-nous. Nous vous répondons sous 48 heures.',
                  "A question, a project, an idea — write to us. We'll get back to you within 48 hours."
                )}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Antoine</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.9 }}>
                    <a href="tel:+33607720940" style={{ color: 'var(--fg)' }}>06 07 72 09 40</a><br />
                    <a href="mailto:antoine.ferrera@dfly.fr" style={{ color: 'var(--fg)', borderBottom: '1px solid var(--line)' }}>antoine.ferrera@dfly.fr</a>
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Rémi</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.9 }}>
                    <a href="tel:+33695402700" style={{ color: 'var(--fg)' }}>06 95 40 27 00</a><br />
                    <a href="mailto:remi.ferrera@dfly.fr" style={{ color: 'var(--fg)', borderBottom: '1px solid var(--line)' }}>remi.ferrera@dfly.fr</a>
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
                    {t('Basés à', 'Based in')}
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, fontWeight: 300, color: 'var(--fg-muted)' }}>
                    Cagnes-sur-mer<br />Provence Alpes Côte d'Azur
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite — formulaire */}
            <div>
              {sent ? (
                <div style={{ paddingTop: 40 }}>
                  <div style={{ fontFamily: 'var(--serif-display)', fontSize: 48, fontStyle: 'italic', fontWeight: 300, color: 'var(--fg-muted)', lineHeight: 1, marginBottom: 24 }}>✓</div>
                  <div style={{ fontFamily: 'var(--serif-display)', fontSize: 28, fontWeight: 400, marginBottom: 16 }}>
                    {t('Message envoyé.', 'Message sent.')}
                  </div>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.7, color: 'var(--fg-muted)', fontWeight: 300, marginBottom: 40 }}>
                    {t('Nous vous répondons sous 48 heures. Vérifiez également vos spams.', "We'll get back to you within 48 hours. Also check your spam folder.")}
                  </p>
                  <button onClick={() => { setSent(false); setForm({ prenom: '', nom: '', email: '', tel: '', sujet: '', message: '' }) }} style={{ background: 'none', border: '1px solid var(--line)', padding: '12px 28px', cursor: 'pointer', color: 'var(--fg-muted)', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' }}>
                    {t('Nouveau message', 'New message')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                      {t('Prénom', 'First name')} *
                      <input type="text" required value={form.prenom} onChange={e => set('prenom', e.target.value)} style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                      {t('Nom', 'Last name')}
                      <input type="text" value={form.nom} onChange={e => set('nom', e.target.value)} style={inputStyle} />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                      Email *
                      <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                      {t('Téléphone', 'Phone')}
                      <input type="tel" value={form.tel} onChange={e => set('tel', e.target.value)} style={inputStyle} />
                    </label>
                  </div>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                    {t('Sujet', 'Subject')}
                    <select value={form.sujet} onChange={e => set('sujet', e.target.value)} style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}>
                      <option value="">{t('— Choisir —', '— Select —')}</option>
                      {sujets.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                    {t('Message', 'Message')} *
                    <textarea required rows={6} value={form.message} onChange={e => set('message', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
                  </label>

                  {error && (
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#c0392b', letterSpacing: '0.04em' }}>{error}</div>
                  )}

                  <button type="submit" disabled={!canSubmit} style={{
                    padding: '16px 32px', background: canSubmit ? 'var(--fg)' : 'var(--line)',
                    color: canSubmit ? 'var(--bg)' : 'var(--fg-muted)',
                    border: 'none', fontFamily: 'var(--sans)', fontSize: 11,
                    letterSpacing: '0.32em', textTransform: 'uppercase',
                    cursor: canSubmit ? 'pointer' : 'default', alignSelf: 'flex-start',
                  }}>
                    {sending ? t('Envoi en cours…', 'Sending…') : t('Envoyer mon message', 'Send my message')}
                  </button>

                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--fg-muted)', margin: 0 }}>
                    * {t('Champs obligatoires', 'Required fields')}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  )
}
