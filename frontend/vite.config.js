import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API endpoints to backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/student': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Note: /l is handled by the SPA router, not proxied to backend
      // The frontend calls /api/l/:token for data
    },
  },
})
