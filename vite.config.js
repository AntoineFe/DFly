import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin : exclure certains fichiers de public/ lors de la copie dans dist/
function excludePublicFiles(patterns) {
  return {
    name: 'exclude-public-files',
    closeBundle() {
      patterns.forEach(file => {
        const dest = path.resolve(__dirname, 'dist', file)
        if (fs.existsSync(dest)) fs.unlinkSync(dest)
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    excludePublicFiles(['photos.htaccess']),
  ],
  base: process.env.VITE_BASE ?? '/',
})
