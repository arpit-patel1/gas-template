import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Apps Script serves a single HTML file, so JS + CSS are inlined into index.html.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src/frontend', import.meta.url)) },
  },
  build: {
    outDir: 'gas/dist',
    emptyOutDir: false,
  },
})
