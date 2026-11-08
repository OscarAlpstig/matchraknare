import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    injectRegister: false,
    scope: '/matchraknare/',
    includeAssets: ['icons/apple-touch-icon.png'],
    manifest: {
      id: '/matchraknare/',
      name: 'Målräknare',
      short_name: 'Målräknare',
      description: 'Håll koll på ungdomsmatchens mål, även offline.',
      lang: 'sv',
      start_url: '/matchraknare/',
      scope: '/matchraknare/',
      display: 'standalone',
      theme_color: '#142e28',
      background_color: '#f4f3ed',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html}'],
      navigateFallback: '/matchraknare/index.html',
      navigateFallbackAllowlist: [/^\/matchraknare\//],
      cleanupOutdatedCaches: true,
      skipWaiting: false,
      clientsClaim: false,
    },
  })],
  base: '/matchraknare/',
  test: {
    environment: 'jsdom', setupFiles: './src/test-setup.ts',
    exclude: ['tests/**', 'node_modules/**'],
  },
})
