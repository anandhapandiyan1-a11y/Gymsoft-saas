import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    historyApiFallback: true,
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/owner': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/trainer': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/member': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/super-admin': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    }
  }
})