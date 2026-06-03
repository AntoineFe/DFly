import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

// Copie public-common + public-{mode} dans dist/ après le build
function mergePublic(mode) {
  const specific = mode === 'photos' ? 'public-photos' : 'public-dfly'
  return {
    name: 'merge-public',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      copyDir(path.resolve(__dirname, 'public-common'), dist)
      copyDir(path.resolve(__dirname, specific), dist)
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), mergePublic(mode)],
  base: process.env.VITE_BASE ?? '/',
  publicDir: false, // géré manuellement par mergePublic
}))
