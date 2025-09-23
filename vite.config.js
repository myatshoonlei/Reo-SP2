import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
     host: true,                 // allow access from network/tunnel
     allowedHosts: true,
     port: 5173
  },
  plugins: [react()],
})
