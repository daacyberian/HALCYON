import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
    host: true,
    // Is line ko add karne se ngrok block nahi hoga
    allowedHosts: ['deonna-screwy-lia.ngrok-free.dev']
  },
})