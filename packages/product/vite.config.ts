import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const getApiTarget = () => process.env.VITE_API_BASE || 'http://localhost:4000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      '/api': {
        target: getApiTarget(),
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
