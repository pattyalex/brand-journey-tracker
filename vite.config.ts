
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
    },
    watch: {
      ignored: ['**/node_modules/**', '**/date-fns/**', '**/.git/**', '**/dist/**'],
      usePolling: false
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['date-fns', 'dayjs', 'luxon'] // Exclude date-related libraries
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
})
