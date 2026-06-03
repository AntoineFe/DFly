import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const PHOTOS_HTACCESS = `Options -MultiViews

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /photos/

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]

</IfModule>

<FilesMatch "^index\\.html$">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>

<FilesMatch "\\.(js|css)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
`

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'photos' && {
      name: 'photos-htaccess',
      closeBundle() {
        fs.writeFileSync(path.resolve(__dirname, 'dist/.htaccess'), PHOTOS_HTACCESS)
      },
    },
  ],
  base: process.env.VITE_BASE ?? '/',
}))
