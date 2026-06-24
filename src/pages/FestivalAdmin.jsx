import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGalerieAuth } from '../context/GalerieAuth'
import GalerieNav from '../components/GalerieNav'

const BASE = import.meta.env.BASE_URL
const API  = path => `${BASE}services/${path}`

const STATUT_LABELS = {
  ouvert:           'Ouvert',
  virement_attendu: 'Virement attendu',
  cloture:          'Clôturé',
}
const STATUT_COLORS = {
  ouvert:           '#27ae60',
  virement_attendu: '#e67e22',
  cloture:          '#7f8c8d',
}

const st = {
  page:    { minHeight: '100vh', background: 'var(--bg)' },
  content: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' },
  h1:      { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 4, color: 'var(--fg)' },
  sub:     { fontSize: 12, color: 'var(--fg-muted)', marginBottom: 32 },
  card:    { border: '1px solid var(--line)', marginBottom: 20 },
  cardH:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
             padding: '12px 16px', background: 'var(--bg-alt)', borderBottom: '1px solid var(--line)' },
  badge:   (s) => ({ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                     padding: '3px 8px', color: '#fff', background: STATUT_COLORS[s] }),
  btn:     { padding: '7px 16px', background: 'var(--fg)', color: 'var(--bg)', border: 'none',
             fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
             cursor: 'pointer' },
  th:      { padding: '8px 12px', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
             color: 'var(--fg-muted)', borderBottom: '1px solid var(--line)', textAlign: 'left', fontWeight: 400 },
  td:      { padding: '8px 12px', fontSize: 13, color: 'var(--fg)', borderBottom: '1px solid var(--line)' },
}

export default function FestivalAdmin() {
  const { authFetch } = useGalerieAuth()
  const navigate = useNavigate()
  const [data,    setData]    = useState(null)
  const [busy,    setBusy]    = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const r = await authFetch('festival-admin.php')
    const d = await r.json()
    if (d.ok) setData(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function cloture(id) {
    if (!window.confirm('Clôturer cette harmonie ?')) return
    setBusy(id)
    const r = await authFetch('festival-close.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'cloture' }),
    })
    const d = await r.json()
    setBusy(false)
    if (d.ok) load()
  }

  async function reopen(id) {
    if (!window.confirm('Rouvrir les commandes pour cette harmonie ?')) return
    setBusy(id)
    const r = await authFetch('festival-close.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'reopen' }),
    })
    const d = await r.json()
    setBusy(false)
    if (d.ok) load()
  }

  return (
    <div style={st.page}>
      <GalerieNav />
      <div style={st.content}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                          color: 'var(--fg-muted)', marginBottom: 8 }}>
              Administration
            </div>
            <h1 style={st.h1}>190e Festival des Musiques du Faucigny</h1>
            <div style={st.sub}>Commandes groupées par harmonie</div>
          </div>
          <button style={{ ...st.btn, background: 'none', color: 'var(--fg)', border: '1px solid var(--line)' }}
            onClick={() => navigate('/galerie/admin')}>← Retour admin</button>
        </div>

        {loading && <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Chargement…</div>}

        {data && (
          <>
            {/* Totaux globaux */}
            <div style={{ border: '1px solid var(--line)', padding: '16px 20px', marginBottom: 32, background: 'var(--bg-alt)' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                            color: 'var(--fg-muted)', marginBottom: 12 }}>Totaux globaux (commandes en cours)</div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {Object.entries(data.produits).map(([key, label]) => (
                  <div key={key}>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 22, fontFamily: 'var(--serif)' }}>{data.totaux[key] ?? 0}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 2 }}>Total HT</div>
                  <div style={{ fontSize: 22, fontFamily: 'var(--serif)' }}>
                    {data.total_global.toFixed(2).replace('.', ',')} €
                  </div>
                </div>
              </div>
            </div>

            {/* Liste par harmonie */}
            {data.harmonies.length === 0 && (
              <div style={{ color: 'var(--fg-muted)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                Aucune commande enregistrée.
              </div>
            )}

            {data.harmonies.map(h => {
              const en_cours = h.commandes.filter(c => c.statut === 'en_cours')
              const annulees = h.commandes.filter(c => c.statut === 'annulee')
              return (
                <div key={h.id} style={st.card}>
                  <div style={st.cardH}>
                    <div>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{h.harmonie}</span>
                      <span style={{ marginLeft: 12, ...st.badge(h.statut_global) }}>
                        {STATUT_LABELS[h.statut_global]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
                        {en_cours.length} commande{en_cours.length !== 1 ? 's' : ''} — {h.total.toFixed(2).replace('.', ',')} €
                      </span>
                      {h.statut_global !== 'cloture' && (
                        <button style={st.btn} onClick={() => cloture(h.id)} disabled={busy === h.id}>
                          {busy === h.id ? '…' : 'Clôturer'}
                        </button>
                      )}
                      {h.statut_global !== 'ouvert' && (
                        <button style={{ ...st.btn, background: 'none', color: 'var(--fg)', border: '1px solid var(--line)' }}
                          onClick={() => reopen(h.id)} disabled={busy === h.id}>
                          {busy === h.id ? '…' : 'Rouvrir'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px' }}>
                    {/* Responsable */}
                    {h.responsable ? (
                      <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 12 }}>
                        Responsable : <strong style={{ color: 'var(--fg)' }}>{h.responsable.nom}</strong>
                        {' '}— {h.responsable.email} — {h.responsable.adresse}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 12, fontStyle: 'italic' }}>
                        Aucun responsable désigné
                      </div>
                    )}

                    {/* Commandes en cours */}
                    {en_cours.length > 0 && (
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                        <thead>
                          <tr>
                            <th style={st.th}>Numéro</th>
                            <th style={st.th}>Musicien</th>
                            {Object.values(data.produits).map(label => (
                              <th key={label} style={{ ...st.th, fontSize: 9 }}>{label}</th>
                            ))}
                            <th style={{ ...st.th, textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {en_cours.map(cmd => (
                            <tr key={cmd.numero}>
                              <td style={{ ...st.td, fontSize: 11, color: 'var(--fg-muted)' }}>{cmd.numero}</td>
                              <td style={st.td}>{cmd.nom}<br /><span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{cmd.email}</span></td>
                              {Object.keys(data.produits).map(key => (
                                <td key={key} style={{ ...st.td, textAlign: 'center' }}>{cmd.produits[key] || 0}</td>
                              ))}
                              <td style={{ ...st.td, textAlign: 'right' }}>{cmd.total.toFixed(2).replace('.', ',')} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {annulees.length > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                        {annulees.length} commande{annulees.length !== 1 ? 's' : ''} annulée{annulees.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
