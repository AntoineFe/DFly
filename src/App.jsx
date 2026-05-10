import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Mariage from './pages/Mariage'
import Contact from './pages/Contact'
import GalerieLogin from './pages/GalerieLogin'
import GalerieAlbums from './pages/GalerieAlbums'
import GalerieAdmin from './pages/GalerieAdmin'
import { GalerieAuthProvider, useGalerieAuth } from './context/GalerieAuth'

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

  return (
    <GalerieAuthProvider>
      <Routes>
        <Route path="/"         element={<Home    lang={lang} setLang={setLang} />} />
        <Route path="/mariage"  element={<Mariage lang={lang} setLang={setLang} />} />
        <Route path="/contact"  element={<Contact lang={lang} setLang={setLang} />} />
        <Route path="/galerie/*" element={<GalerieRoutes />} />
      </Routes>
    </GalerieAuthProvider>
  )
}
