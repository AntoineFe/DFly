import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const BASE = import.meta.env.BASE_URL
const API  = path => `${BASE}services/${path}`

const GalerieAuthContext = createContext(null)

export function GalerieAuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const token = () => localStorage.getItem('galerie_token')

  const authFetch = useCallback((path, opts = {}) => {
    return fetch(API(path), {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        Authorization: `Bearer ${token()}`,
      },
    })
  }, [])

  // Vérifier la session au chargement
  useEffect(() => {
    const t = token()
    if (!t) { setLoading(false); return }
    authFetch('galerie-session.php')
      .then(r => r.json())
      .then(d => { if (d.ok) setUser(d.user) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authFetch])

  async function login(loginStr, password) {
    const r = await fetch(API('galerie-login.php'), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ login: loginStr, password }),
    })
    const d = await r.json()
    if (d.ok) {
      localStorage.setItem('galerie_token', d.token)
      setUser(d.user)
    }
    return d
  }

  async function loginWithCle(cle) {
    const r = await fetch(API(`galerie-autologin.php?cle=${encodeURIComponent(cle)}`))
    const d = await r.json()
    if (d.ok) {
      localStorage.setItem('galerie_token', d.token)
      setUser(d.user)
    }
    return d
  }

  async function logout() {
    await authFetch('galerie-logout.php', { method: 'POST' }).catch(() => {})
    localStorage.removeItem('galerie_token')
    setUser(null)
  }

  function hasAuth(rsrc, level) {
    return !!(user?.auths?.[rsrc] && user.auths[rsrc].includes(level))
  }

  return (
    <GalerieAuthContext.Provider value={{ user, loading, login, loginWithCle, logout, authFetch, hasAuth }}>
      {children}
    </GalerieAuthContext.Provider>
  )
}

export function useGalerieAuth() {
  return useContext(GalerieAuthContext)
}
