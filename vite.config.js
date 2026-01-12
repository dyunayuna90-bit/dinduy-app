import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'], // Asset lokal
      manifest: {
        name: 'Dinduy Notes',
        short_name: 'Dinduy',
        description: 'Catatan Logika & Rasa untuk Dinda.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone', 
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png', // Ngambil dari folder public/icon-192.png
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png', // Ngambil dari folder public/icon-512.png
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Biar iconnya adaptif di Android (bunder/kotak ngikutin tema HP)
          }
        ]
      }
    })
  ],
})
