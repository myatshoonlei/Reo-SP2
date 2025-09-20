import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
=======

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> e5875884714e99cadbd0c233c6947c4f77e7a52d
})
