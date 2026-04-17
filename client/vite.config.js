import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://revenue-intelligence-364307352476.us-east1.run.app',
        changeOrigin: true,
      }
    }
  }
})