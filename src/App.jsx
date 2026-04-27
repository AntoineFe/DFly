import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Mariage from './pages/Mariage'

export default function App() {
  const [lang, setLang] = useState('FR')

  return (
    <Routes>
      <Route path="/"        element={<Home    lang={lang} setLang={setLang} />} />
      <Route path="/mariage" element={<Mariage lang={lang} setLang={setLang} />} />
    </Routes>
  )
}
