
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5000'),
    strictPort: false,
    hmr: {
      clientPort: 443,
      host: process.env.REPL_SLUG ? `${process.env.REPL_OWNER}.replit.dev` : undefined,
      protocol: 'wss'
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
