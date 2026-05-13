import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Mariage from './pages/Mariage'
import MariageFilm from './pages/MariageFilm'
import Immobilier from './pages/Immobilier'
import Communication from './pages/Communication'
import Spectacle from './pages/Spectacle'
import Famille from './pages/Famille'
import Contact from './pages/Contact'
import GalerieLogin from './pages/GalerieLogin'
import GalerieAlbums from './pages/GalerieAlbums'
import GalerieAdmin from './pages/GalerieAdmin'
import { GalerieAuthProvider, useGalerieAuth } from './context/GalerieAuth'
import useImageProtection from './hooks/useImageProtection'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useGalerieAuth()
  if (loading) return null
  if (!user)   return <Navigate to="/galerie" replace />
  if (adminOnly && !user.auths?.admin?.includes('R')) return <Navigate to="/galerie/albums" replace />
  return children
}

function GalerieRoutes() {
  return (
    <Routes>
      <Route path="login" element={<GalerieLogin />} />
      <Route path="albums"    element={<ProtectedRoute><GalerieAlbums /></ProtectedRoute>} />
      <Route path="albums/:entId" element={<ProtectedRoute><GalerieAlbums /></ProtectedRoute>} />
      <Route path="admin"  element={<ProtectedRoute adminOnly><GalerieAdmin /></ProtectedRoute>} />
      <Route index         element={<GalerieLogin />} />
    </Routes>
  )
}

export default function App() {
  const [lang, setLang] = useState('FR')
  useImageProtection()

  return (
    <GalerieAuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/"               element={<Home          lang={lang} setLang={setLang} />} />
        <Route path="/mariage"        element={<Mariage       lang={lang} setLang={setLang} />} />
        <Route path="/mariage/film"   element={<MariageFilm   lang={lang} setLang={setLang} />} />
        <Route path="/immobilier"     element={<Immobilier    lang={lang} setLang={setLang} />} />
        <Route path="/communication"  element={<Communication lang={lang} setLang={setLang} />} />
        <Route path="/spectacle"      element={<Spectacle     lang={lang} setLang={setLang} />} />
        <Route path="/evenements"     element={<Navigate to="/spectacle" replace />} />
        <Route path="/famille"        element={<Famille       lang={lang} setLang={setLang} />} />
        <Route path="/contact"        element={<Contact       lang={lang} setLang={setLang} />} />
        <Route path="/galerie/*"      element={<GalerieRoutes />} />
      </Routes>
    </GalerieAuthProvider>
  )
}
