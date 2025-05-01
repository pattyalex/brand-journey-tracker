import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    hmr: {
      // Enable WebSocket connection on Replit
      clientPort: 443,
      host: process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'localhost'
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}))

function componentTagger() {
  return {
    name: 'dummy-component-tagger',
    // This is a dummy function to prevent build errors
    // while we install the actual package
  }
}