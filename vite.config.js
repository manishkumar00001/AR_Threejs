import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,     // 👈 allows access from other devices on the same network
    port: 5174,     // (optional) lock your port if you want
  },
})
