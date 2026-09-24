import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [vue(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'LinguSeñas',
      short_name: 'LinguSeñas',
      description: 'LinguSeñas',
      theme_color: '#ffffff',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    assetsInclude: ["**/*.task", "**/*.wasm"],
  },
  
  server: {
    watch: {
      ignored: [
        '**/pocketbase/**',
        '**/pocketbase/pb_data/**'
      ]
    },
    allowedHosts: [
      'diet-seminars-significantly-portions.trycloudflare.com',
      // O puedes usar '.trycloudflare.com' para permitir cualquier túnel de Cloudflare:
      // '.trycloudflare.com'
    ]
  }
})