import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — сборка работает и из корня домена, и из подпапки
// (например, https://<user>.github.io/practice/), и даже открытая локально из dist/.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
})
