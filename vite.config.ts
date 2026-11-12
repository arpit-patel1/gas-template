import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev server + unit tests. Production builds use vite.config.frontend.ts / backend.ts.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src/frontend', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.spec.ts'],
  },
})
