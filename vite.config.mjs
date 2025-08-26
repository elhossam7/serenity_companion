import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [
    tsconfigPaths(),
    react(),
    mode === 'development' ? tagger() : undefined,
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Cache-first for static assets; no runtime caching of Supabase/API to respect privacy
      },
      manifest: {
        name: 'Serenity Companion',
        short_name: 'Serenity',
        description: 'Culturally sensitive mental wellness companion',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.ico', sizes: '64x64 32x32 24x24 16x16', type: 'image/x-icon' },
          // Placeholders to satisfy installability; replace with real PNGs (192/512)
          { src: '/favicon.ico', sizes: '192x192', type: 'image/x-icon', purpose: 'any' },
          { src: '/favicon.ico', sizes: '512x512', type: 'image/x-icon', purpose: 'any' }
        ]
      }
    })
  ].filter(Boolean),
  server: {
  // Use a fixed port if available; fallback automatically if in use
  port: 4028,
  host: "0.0.0.0",
  strictPort: false,
  // If you need to expose the dev server behind a reverse proxy, add allowed hosts here.
  // allowedHosts: ['your-domain.com']
  }
  ,
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)']
  }
}));