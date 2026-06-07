import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Force dev server config reload and cache clear

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
