import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Forward /api/* to the Netlify CLI local functions server during development.
      // Run `netlify dev` instead of `npm run dev` to start both servers together.
      // When using `npm run dev` alone (no functions server), the proxy target is
      // unreachable and ai.ts falls back to its local mock responses automatically.
      '/api': 'http://localhost:8888',
    },
  },
})
