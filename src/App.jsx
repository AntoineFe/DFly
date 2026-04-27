import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Mariage from './pages/Mariage'
import TweaksPanel, { TweakSection, TweakRadio, TweakSlider } from './components/TweaksPanel'

const TYPO_MAP = {
  cormorant: "'Cormorant Garamond', 'Cormorant', Georgia, serif",
  italiana:  "'Italiana', 'Cormorant Garamond', serif",
  playfair:  "'Playfair Display', 'Cormorant Garamond', serif",
}

export default function App() {
  const [palette, setPalette] = useState('ivory')
  const [typo, setTypo]       = useState('playfair')
  const [grain, setGrain]     = useState(0)
  const [lang, setLang]       = useState('FR')

  useEffect(() => { document.body.setAttribute('data-theme', palette) }, [palette])
  useEffect(() => { document.documentElement.style.setProperty('--grain-opacity', String(grain)) }, [grain])
  useEffect(() => { document.documentElement.style.setProperty('--serif-display', TYPO_MAP[typo]) }, [typo])

  return (
    <>
      <Routes>
        <Route path="/"        element={<Home    lang={lang} setLang={setLang} />} />
        <Route path="/mariage" element={<Mariage lang={lang} setLang={setLang} />} />
      </Routes>

      <TweaksPanel title="Tweaks · DFly">
        <TweakSection title="Palette">
          <TweakRadio value={palette} onChange={setPalette} options={[
            { value: 'ivory', label: 'Ivoire' },
            { value: 'sage',  label: 'Encre'  },
            { value: 'dark',  label: 'Sombre' },
          ]} />
        </TweakSection>
        <TweakSection title="Typographie">
          <TweakRadio value={typo} onChange={setTypo} options={[
            { value: 'cormorant', label: 'Cormorant' },
            { value: 'italiana',  label: 'Italiana'  },
            { value: 'playfair',  label: 'Playfair'  },
          ]} />
        </TweakSection>
        <TweakSection title="Grain photo">
          <TweakSlider
            value={grain} min={0} max={0.18} step={0.01}
            onChange={setGrain}
            format={v => `${Math.round(v * 100)}%`}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  )
}
