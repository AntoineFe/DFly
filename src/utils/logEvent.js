const BASE = import.meta.env.BASE_URL

export function logEvent(action, pathname) {
  const token = localStorage.getItem('galerie_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  fetch(`${BASE}services/galerie-log.php`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: `[click] ${action} — ${pathname}` }),
  }).catch(() => {})
}
