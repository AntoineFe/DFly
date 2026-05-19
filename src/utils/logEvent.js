const BASE = import.meta.env.BASE_URL

function post(url) {
  const token = localStorage.getItem('galerie_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  fetch(`${BASE}services/galerie-log.php`, {
    method: 'POST', headers,
    body: JSON.stringify({ url }),
  }).catch(() => {})
}

export function logEvent(action, pathname) {
  post(`[click] ${action} — ${pathname}`)
}

export function logDevis(format, ttc, moments) {
  post(`[devis] ${format} · ${ttc} € · ${moments}`)
}

export function logGalerie(event) {
  post(`[galerie] ${event}`)
}
